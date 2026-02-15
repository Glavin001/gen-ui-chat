import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  type ModelMessage,
} from "ai";
import type { ToolResultPart, ToolResultOutput } from "@ai-sdk/provider-utils";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { pipeJsonRender } from "@json-render/core";
import { generateSystemPrompt } from "@/lib/system-prompt";
import { tools, toolDefs } from "@/lib/tools";
import { claudeCode, createCustomMcpServer } from 'ai-sdk-provider-claude-code';

export const maxDuration = 60;

// ─── Tool Call ID Injection ──────────────────────────────────────────

/**
 * Convert a ToolResultOutput to text format with a [Tool Call ID] header.
 * This makes the toolCallId visible in the content the model reads,
 * not just in structural metadata.
 */
function annotateToolOutput(
  output: ToolResultOutput,
  toolCallId: string,
  toolName: string
): ToolResultOutput {
  const header = `[Tool Call ID: ${toolCallId}]\n[Tool Name: ${toolName}]\n\n`;

  switch (output.type) {
    case "json":
      return {
        type: "text",
        value: header + JSON.stringify(output.value, null, 2),
      };
    case "text":
      return {
        type: "text",
        value: header + output.value,
      };
    case "error-text":
      return {
        type: "error-text",
        value: header + output.value,
      };
    case "error-json":
      return {
        type: "error-text",
        value: header + JSON.stringify(output.value, null, 2),
      };
    default:
      // For 'execution-denied', 'content', etc. — leave as-is
      return output;
  }
}

/**
 * Walk through all model messages and inject toolCallId into every
 * tool-result part's output content, so the AI model can read the ID
 * directly from the result text.
 */
function injectToolCallIdsIntoMessages(
  messages: ModelMessage[]
): ModelMessage[] {
  return messages.map((msg) => {
    if (msg.role !== "tool") return msg;
    return {
      ...msg,
      content: msg.content.map((part) => {
        if (part.type !== "tool-result") return part;
        const toolPart = part as ToolResultPart;
        return {
          ...toolPart,
          output: annotateToolOutput(
            toolPart.output,
            toolPart.toolCallId,
            toolPart.toolName
          ),
        };
      }),
    };
  });
}

// ─── MCP Server for Claude Code ──────────────────────────────────────

/**
 * Create an MCP server that exposes our app tools to Claude Code.
 * Claude Code doesn't use AI SDK's `tools` parameter — tools must be
 * provided via MCP servers.
 *
 * Each handler wraps our existing execute functions and returns
 * the MCP-required { content: [{ type: 'text', text }] } format.
 */
function createAppToolsMcpServer() {
  return createCustomMcpServer({
    name: "app-tools",
    tools: {
      get_weather: {
        description: toolDefs.get_weather.description,
        inputSchema: toolDefs.get_weather.inputSchema,
        handler: async (args) => {
          const result = await toolDefs.get_weather.execute(args as { city: string; unit: "celsius" | "fahrenheit" });
          return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        },
      },
      search_stocks: {
        description: toolDefs.search_stocks.description,
        inputSchema: toolDefs.search_stocks.inputSchema,
        handler: async (args) => {
          const result = await toolDefs.search_stocks.execute(args as { symbols: string[] });
          return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        },
      },
      get_statistics: {
        description: toolDefs.get_statistics.description,
        inputSchema: toolDefs.get_statistics.inputSchema,
        handler: async (args) => {
          const result = await toolDefs.get_statistics.execute(args as { topic: string; dataPoints: number });
          return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        },
      },
      set_state: {
        description: toolDefs.set_state.description,
        inputSchema: toolDefs.set_state.inputSchema,
        handler: async (args) => {
          const result = await toolDefs.set_state.execute(args as {
            state?: Record<string, unknown>;
            computed?: Record<string, { deps: string[]; fn: string }>;
          });
          return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        },
      },
    },
  });
}

// Tool names as they appear to Claude Code via MCP: mcp__<serverName>__<toolName>
const APP_MCP_TOOL_NAMES = [
  "mcp__app-tools__get_weather",
  "mcp__app-tools__search_stocks",
  "mcp__app-tools__get_statistics",
  "mcp__app-tools__set_state",
];

// ─── Model Selection ─────────────────────────────────────────────────

/** Whether to use Claude Code provider (vs direct Anthropic/OpenAI API) */
const USE_CLAUDE_CODE = true;

/**
 * Select the AI model based on configuration and available API keys.
 */
function getModel() {
  if (USE_CLAUDE_CODE) {
    return createClaudeCodeModel();
  }

  if (
    process.env.ANTHROPIC_API_KEY &&
    process.env.ANTHROPIC_API_KEY !== "your-api-key-here"
  ) {
    return anthropic(process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514");
  }
  return openai(process.env.OPENAI_MODEL ?? "gpt-4o");
}

function createClaudeCodeModel() {
  const appToolsServer = createAppToolsMcpServer();

  return claudeCode('haiku', {
    mcpServers: {
      "app-tools": appToolsServer,
    },
    // Allow our MCP tools + built-in Claude Code tools for web access
    allowedTools: [
      ...APP_MCP_TOOL_NAMES,
      'WebSearch',
      'WebFetch',
      'Read',
      'LS',
    ],
    disallowedTools: ['Write', 'Edit', 'Bash', 'Task', 'Glob', 'Grep'],
    debug: true,
  });
}

// ─── Route Handler ───────────────────────────────────────────────────

export async function POST(req: Request) {
  const { messages } = await req.json();

  const model = getModel();
  const systemPrompt = generateSystemPrompt();

  // Convert UI messages (parts-based) to model messages (content-based)
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model,
    system: systemPrompt,
    messages: modelMessages,
    // AI SDK tools are only used by non-Claude-Code models.
    // Claude Code receives tools via MCP server (see createAppToolsMcpServer).
    ...(USE_CLAUDE_CODE ? {} : { tools, toolChoice: "auto" as const }),
    stopWhen: stepCountIs(5),

    /**
     * Before each step, inject toolCallIds into tool result content
     * and append an explicit ID mapping to the system prompt.
     *
     * This ensures the AI model can see and use real toolCallIds
     * rather than inventing fake ones.
     */
    prepareStep: ({ steps, messages: stepMessages }) => {
      // 1. Inject toolCallId headers into all tool result messages
      const enhancedMessages = injectToolCallIdsIntoMessages(stepMessages);

      // 2. Collect toolCallId mapping from completed steps in this turn
      const toolCallMap: Array<{ toolName: string; toolCallId: string }> = [];
      for (const step of steps) {
        for (const tc of step.toolCalls) {
          toolCallMap.push({
            toolName: tc.toolName,
            toolCallId: tc.toolCallId,
          });
        }
      }

      // 3. Append explicit toolCallId listing to system prompt
      let enhancedSystem: string | undefined;
      if (toolCallMap.length > 0) {
        const mapping = toolCallMap
          .map(
            (c) =>
              `- Tool "${c.toolName}" → toolCallId: "${c.toolCallId}" → output at: /tools/${c.toolCallId}/output → input at: /tools/${c.toolCallId}/input`
          )
          .join("\n");
        enhancedSystem =
          systemPrompt +
          `\n\n## YOUR TOOL CALL IDS (use these exact IDs in $state paths and transform deps)\n${mapping}`;
      }

      return {
        ...(enhancedSystem ? { system: enhancedSystem } : {}),
        messages: enhancedMessages,
      };
    },
  });

  // Pipe through json-render transform to classify text vs JSONL spec patches
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.merge(pipeJsonRender(result.toUIMessageStream()));
    },
  });

  return createUIMessageStreamResponse({ stream });
}
