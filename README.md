# Mission Control — AI Council

**8-agent multi-model AI council** led by Jarvis (Chief of Staff, Opus).

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

## Deployment on Vercel

### Environment Variables (Required)

Set these in **Vercel → Project Settings → Environment Variables**:

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (for Opus, Sonnet 4.5, Sonnet, Haiku) |
| `OPENAI_API_KEY` | Your OpenAI API key (for GPT-4o) |

### Steps
1. Import repo in Vercel
2. Add both env vars above
3. Deploy — no build step needed

## Local Development

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export OPENAI_API_KEY=sk-proj-...
npm install
npm start
# → http://localhost:3000
```
\n// Force redeploy Thu Feb 12 06:37:51 PM AEST 2026
