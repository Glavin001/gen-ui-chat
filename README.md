# Gen UI Chat

A Generative UI AI chat application that produces rich, interactive UI alongside conversational text. The AI can respond with charts, tables, metrics, dashboards, and more — streamed in real-time.

## Architecture

- **Framework**: Next.js 15 (App Router) with TypeScript
- **AI**: Vercel AI SDK v6 with tool calling (supports OpenAI and Anthropic)
- **UI Generation**: [json-render](https://json-render.dev) for catalog-based component specs streamed as JSONL patches
- **Reactive State**: Preact Signals (`@preact/signals-core`) for path-addressable reactive store
- **Styling**: Tailwind CSS v4 with dark theme
- **Charts**: Recharts for data visualization

### How It Works

1. **User sends a message** → routed to `/api/chat`
2. **Server calls `streamText`** with tools and the component catalog prompt
3. **AI calls tools** (weather, stocks, statistics) and generates a UI spec
4. **json-render transform** classifies streamed text as prose or JSONL spec patches
5. **Client renders** text + rich UI using json-render's `Renderer` with custom components

### Component Catalog

The AI has access to these components:

| Component | Description |
|-----------|------------|
| `Card` | Container with title/subtitle |
| `Grid` | Responsive column grid |
| `Stack` | Flex stack (horizontal/vertical) |
| `Text` | Text with markdown support |
| `Metric` | KPI display with trend indicator |
| `DataTable` | Structured data table |
| `BarChart` | Bar chart (Recharts) |
| `LineChart` | Line chart (Recharts) |
| `PieChart` | Pie/donut chart (Recharts) |
| `Button` | Interactive button with events |
| `Badge` | Status badge/tag |
| `CodeBlock` | Syntax-highlighted code |
| `Progress` | Progress bar |
| `Image` | Image display |
| `Divider` | Horizontal divider |

## Getting Started

### Prerequisites

- Node.js 18+
- An API key for OpenAI or Anthropic

### Setup

```bash
# Install dependencies
npm install

# Set your API key in .env.local
# For Anthropic:
echo "ANTHROPIC_API_KEY=your-key-here" > .env.local

# Or for OpenAI:
echo "OPENAI_API_KEY=your-key-here" > .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start chatting.

### Try These Prompts

- "Compare weather in Tokyo, London, and NYC"
- "Show me AAPL, GOOGL, MSFT stock data"
- "Create a sales analytics dashboard"
- "What are the top programming languages?"

## Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts    # AI SDK streaming endpoint
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Chat page
│   └── globals.css           # Tailwind imports
├── components/
│   ├── catalog/              # UI component implementations
│   │   ├── Card.tsx
│   │   ├── Grid.tsx
│   │   ├── Metric.tsx
│   │   ├── DataTable.tsx
│   │   ├── BarChartComponent.tsx
│   │   └── ... (15 components)
│   └── chat/                 # Chat shell components
│       ├── ChatApp.tsx
│       ├── ChatMessage.tsx
│       ├── ChatInput.tsx
│       └── ToolCallIndicator.tsx
└── lib/
    ├── catalog.ts            # json-render component catalog with Zod schemas
    ├── registry.ts           # Maps catalog → React components
    ├── system-prompt.ts      # AI system prompt generator
    ├── tools.ts              # AI tool definitions
    ├── reactive-store.ts     # Preact Signals reactive state store
    ├── use-gen-ui.ts         # Client-side spec parsing hook
    ├── types.ts              # Shared types
    └── cn.ts                 # Tailwind className utility
```

## Technology Stack

- **Next.js 15** — React framework with App Router
- **AI SDK v6** — LLM orchestration with streaming and tool calling
- **@json-render/react** — Generative UI framework (catalog, registry, renderer)
- **@json-render/core** — JSONL streaming, spec compilation, mixed stream parsing
- **@preact/signals-core** — Fine-grained reactive primitives
- **Zod v4** — Schema validation for component props
- **Recharts** — Charting library
- **Tailwind CSS v4** — Utility-first CSS
