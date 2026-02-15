import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { pipeJsonRender } from "@json-render/core";
import { generateSystemPrompt } from "@/lib/system-prompt";
import { tools } from "@/lib/tools";

export const maxDuration = 60;

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
  });

  // Pipe through json-render transform to classify text vs JSONL spec patches
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.merge(pipeJsonRender(result.toUIMessageStream()));
    },
  });

  return createUIMessageStreamResponse({ stream });
}
