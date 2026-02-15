"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ViewModeToggle, type ViewMode } from "./ViewModeToggle";

export function ChatApp() {
  // AI SDK v6: useChat defaults to DefaultChatTransport with api="/api/chat"
  const { messages, status, sendMessage, stop } = useChat();

  const isStreaming = status === "streaming" || status === "submitted";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, status]);

  const handleSend = (text: string) => {
    sendMessage({ text });
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm px-6 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm font-bold">
          G
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-zinc-100">Gen UI Chat</h1>
          <p className="text-xs text-zinc-500">AI with Generative UI</p>
        </div>
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <WelcomeScreen onSuggestion={handleSend} />
          )}
          {messages.map((msg, idx) => {
            const isLastAssistant =
              msg.role === "assistant" && idx === messages.length - 1;

            return (
              <ChatMessage
                key={msg.id}
                role={msg.role as "user" | "assistant"}
                parts={msg.parts}
                isStreaming={isLastAssistant && isStreaming}
                viewMode={viewMode}
              />
            );
          })}
          {/* Show thinking dots when loading after user message */}
          {isStreaming &&
            messages.length > 0 &&
            messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-zinc-900 border border-zinc-800 px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} isStreaming={isStreaming} onStop={stop} />
    </div>
  );
}

function WelcomeScreen({
  onSuggestion,
}: {
  onSuggestion: (text: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold mb-6 shadow-lg shadow-indigo-500/20">
        G
      </div>
      <h2 className="text-xl font-semibold text-zinc-100 mb-2">
        Welcome to Gen UI Chat
      </h2>
      <p className="text-sm text-zinc-500 max-w-md mb-8">
        I can respond with rich interactive UI — charts, tables, metrics, and
        more. Try asking me something!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestion(suggestion)}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-left text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 hover:border-zinc-700 transition-all"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "Compare weather in Tokyo, London, and NYC",
  "Show me AAPL, GOOGL, MSFT stock data",
  "Create a sales analytics dashboard",
  "What are the top programming languages?",
];
