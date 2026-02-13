# Mission Control — AI Council + Second Brain

**8-agent multi-model AI council** led by Jarvis (Chief of Staff, Opus), with an integrated **Second Brain** memory system.

## Architecture

| Agent   | Role           | Model       | Provider  |
|---------|---------------|-------------|-----------|
| Jarvis  | Chief of Staff | Opus        | Anthropic |
| Alpha   | Strategist     | Sonnet 4.5  | Anthropic |
| Beta    | Researcher     | GPT-4o      | OpenAI    |
| Gamma   | Executor       | Haiku       | Anthropic |
| Delta   | Analyst        | Sonnet      | Anthropic |
| Epsilon | Creative       | GPT-4o      | OpenAI    |
| Zeta    | Optimizer      | Haiku       | Anthropic |
| Eta     | Synthesizer    | Sonnet      | Anthropic |

### Flow
1. **7 council agents** collaborate sequentially (Alpha → Eta), each building on prior contributions
2. **Jarvis (Opus)** receives the full transcript and makes the **final decision**

### Cost Optimization
- **Haiku** (cheapest) for execution & optimization tasks
- **Sonnet** for analysis & synthesis
- **GPT-4o** for research & creative diversity (cross-provider thinking)
- **Sonnet 4.5** for strategic lead
- **Opus** used once for final, highest-quality decision

## 🧠 Second Brain (Memory System)

Accessible at `/memory` — a searchable memory vault with daily journals, long-term memory, and brain documents.

### Features
- **Left sidebar**: Daily journals grouped by Today/Yesterday/This Week/This Month/Older
- **Center panel**: Markdown document viewer with syntax highlighting
- **Right panel**: Quick Add, Search, and Stats
- **Real-time updates**: Sidebar refreshes every 30 seconds

### Data Sources
- `MEMORY.md` — Long-term curated memory (gold ⭐ icon)
- `memory/YYYY-MM-DD.md` — Daily journal entries
- `brain/**/*.md` — Brain documents organized by category (concepts, strategic, workflows, daily)

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/memory/list` | List all memory files with metadata, grouped by time period |
| GET | `/api/memory/read/:filename` | Read content of a specific memory file |
| POST | `/api/memory/add` | Add new memory (body: `{content, category: "daily"|"long-term"}`) |
| GET | `/api/memory/search?q=keyword` | Search across all memory files |

### "Remember This" Command

When Jarvis detects patterns like:
- "Remember: [thing]"
- "Hey Jarvis, remember this: [thing]"
- "Add to memory: [thing]"

It saves to today's daily journal (`memory/YYYY-MM-DD.md`) with timestamp and responds with confirmation.

### File Structure
```
workspace/
├── MEMORY.md                    # Long-term curated memory
├── memory/
│   ├── 2026-02-13.md           # Today's journal
│   ├── 2026-02-12.md           # Yesterday's journal
│   └── ...
└── brain/
    ├── concepts/               # Conceptual documents
    ├── strategic/              # Strategic planning docs
    ├── workflows/              # Workflow documentation
    └── daily/                  # Daily brain dumps
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WORKSPACE_PATH` | Path to workspace with memory files | `/home/luke/.openclaw/workspace` |

## Deployment on Vercel

### Environment Variables (Required)

Set these in **Vercel → Project Settings → Environment Variables**:

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (for Opus, Sonnet 4.5, Sonnet, Haiku) |
| `OPENAI_API_KEY` | Your OpenAI API key (for GPT-4o) |
| `WORKSPACE_PATH` | *(Optional)* Path to workspace directory |

### Steps
1. Import repo in Vercel
2. Add both env vars above
3. Deploy — no build step needed

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — Dashboard with market data and navigation cards |
| `/council` | AI Council — Multi-agent deliberation system |
| `/growth` | Growth — Metrics and funnel tracking |
| `/pipeline` | Pipeline — Project management |
| `/content` | Content — Calendar and publishing workflow |
| `/memory` | Second Brain — Memory vault and search |

## Local Development

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export OPENAI_API_KEY=sk-proj-...
npm install
npm start
# → http://localhost:3000
```
