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
import { tools } from "@/lib/tools";

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

// ─── Model Selection ─────────────────────────────────────────────────

/**
 * Select the AI model based on available API keys.
 */
function getModel() {
  if (
    process.env.ANTHROPIC_API_KEY &&
    process.env.ANTHROPIC_API_KEY !== "your-api-key-here"
  ) {
    return anthropic(process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514");
  }
  return openai(process.env.OPENAI_MODEL ?? "gpt-4o");
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
    tools,
    toolChoice: "auto",
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
              `- Tool "${c.toolName}" → toolCallId: "${c.toolCallId}" → use $state path: /tools/${c.toolCallId}`
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
