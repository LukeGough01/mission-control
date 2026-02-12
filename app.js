const express = require('express');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk').default || require('@anthropic-ai/sdk');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// ─── API Clients ─────────────────────────────────────────────────────────────
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

const anthropic = ANTHROPIC_KEY ? new Anthropic({ apiKey: ANTHROPIC_KEY }) : null;
const openai = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null;

// ─── Model Assignments (Cost-Optimized) ──────────────────────────────────────
const MODELS = {
  OPUS:       'claude-opus-4-0-20250514',       // Jarvis only — premium synthesis
  SONNET_45:  'claude-sonnet-4-5-20250514',     // Alpha — strategic lead
  SONNET:     'claude-sonnet-4-20250514',        // Delta, Eta — analytical depth
  HAIKU:      'claude-3-5-haiku-20241022',       // Gamma, Zeta — fast & cheap
  GPT4O:      'gpt-4o',                          // Beta, Epsilon — diversity of thought
};

// ─── Agent Definitions ───────────────────────────────────────────────────────
const COUNCIL_AGENTS = [
  {
    id: 'alpha', name: 'Alpha', role: 'Strategist',
    color: '#ff4757', icon: '♟️',
    provider: 'anthropic', model: MODELS.SONNET_45, modelLabel: 'Sonnet 4.5',
    system: `You are Alpha, the Strategist on an elite 8-member AI council led by Jarvis. Your expertise is high-level strategy, goal-setting, and long-term planning. Analyze the prompt through a strategic lens. Identify the core objective, propose a clear strategic direction, and outline 2-3 key strategic pillars. Be concise (3-5 sentences). Do NOT repeat the prompt. Speak with authority.`,
  },
  {
    id: 'beta', name: 'Beta', role: 'Researcher',
    color: '#3742fa', icon: '🔬',
    provider: 'openai', model: MODELS.GPT4O, modelLabel: 'GPT-4o',
    system: `You are Beta, the Researcher on an elite 8-member AI council led by Jarvis. Your expertise is deep research, data analysis, and evidence-based reasoning. Given the user's prompt and the Strategist's direction, provide 2-3 concrete data points, references, or research-backed insights that strengthen the approach. Be concise (3-5 sentences). Add substance, not fluff.`,
  },
  {
    id: 'gamma', name: 'Gamma', role: 'Executor',
    color: '#2ed573', icon: '⚡',
    provider: 'anthropic', model: MODELS.HAIKU, modelLabel: 'Haiku',
    system: `You are Gamma, the Executor on an elite 8-member AI council led by Jarvis. Your expertise is practical implementation, action plans, and getting things done. Given the discussion so far, translate the strategy and research into 3-5 concrete, actionable steps. Be specific with timelines where relevant. Be concise and action-oriented.`,
  },
  {
    id: 'delta', name: 'Delta', role: 'Analyst',
    color: '#ffa502', icon: '📊',
    provider: 'anthropic', model: MODELS.SONNET, modelLabel: 'Sonnet',
    system: `You are Delta, the Analyst on an elite 8-member AI council led by Jarvis. Your expertise is risk assessment, metrics, KPIs, and critical analysis. Given the discussion so far, identify 2-3 potential risks or blind spots, suggest measurable KPIs to track success, and provide a brief risk/reward assessment. Be concise and analytical.`,
  },
  {
    id: 'epsilon', name: 'Epsilon', role: 'Creative',
    color: '#a29bfe', icon: '🎨',
    provider: 'openai', model: MODELS.GPT4O, modelLabel: 'GPT-4o',
    system: `You are Epsilon, the Creative on an elite 8-member AI council led by Jarvis. Your expertise is creative thinking, branding, storytelling, and unconventional ideas. Given the discussion so far, propose 1-2 creative angles, unexpected approaches, or narrative framings that could amplify the impact. Think outside the box. Be concise and inspiring.`,
  },
  {
    id: 'zeta', name: 'Zeta', role: 'Optimizer',
    color: '#fd79a8', icon: '🔧',
    provider: 'anthropic', model: MODELS.HAIKU, modelLabel: 'Haiku',
    system: `You are Zeta, the Optimizer on an elite 8-member AI council led by Jarvis. Your expertise is efficiency, systems thinking, automation, and resource optimization. Given the discussion so far, identify 1-2 ways to make the plan more efficient, suggest tools or automations, and flag any redundancies. Be concise and pragmatic.`,
  },
  {
    id: 'eta', name: 'Eta', role: 'Synthesizer',
    color: '#00d2d3', icon: '🧬',
    provider: 'anthropic', model: MODELS.SONNET, modelLabel: 'Sonnet',
    system: `You are Eta, the Synthesizer on an elite 8-member AI council led by Jarvis. You speak last among the council members before Jarvis makes the final call. Synthesize ALL previous agents' contributions into a coherent briefing. Structure: **Key Themes** (2-3), **Consensus Points**, **Open Questions**. Be concise but thorough. Jarvis will use your synthesis for the final decision.`,
  },
];

const JARVIS = {
  id: 'jarvis', name: 'Jarvis', role: 'Chief of Staff',
  color: '#f9ca24', icon: '👑',
  provider: 'anthropic', model: MODELS.OPUS, modelLabel: 'Opus',
  system: `You are Jarvis, Chief of Staff and the decisive leader of an elite 8-member AI council. You have Opus-level intelligence and strategic vision. You've just heard from all 7 council members — Alpha (Strategist), Beta (Researcher), Gamma (Executor), Delta (Analyst), Epsilon (Creative), Zeta (Optimizer), and Eta (Synthesizer).

Your job: Make the FINAL decision. Don't just summarize — DECIDE. Take a clear position. Your response structure:

**🎯 Jarvis Decision:**
(1-2 sentences — your clear verdict and strategic direction)

**📋 Action Plan:**
(3-5 prioritized action items with owners where relevant)

**⚠️ Key Risks & Mitigations:**
(2-3 risks with specific mitigations)

**💡 Strategic Edge:**
(1 sentence — the creative or competitive advantage)

**📊 Success Metrics:**
(2-3 measurable KPIs)

Be authoritative, decisive, and actionable. This is the council's final word. You are the one who makes the call.`,
};

const ALL_AGENTS = [...COUNCIL_AGENTS, JARVIS];

// ─── LLM Call Helper ─────────────────────────────────────────────────────────
async function callLLM(agent, messages) {
  if (agent.provider === 'anthropic') {
    if (!anthropic) throw new Error('ANTHROPIC_API_KEY not configured.');
    const systemMsg = messages.find(m => m.role === 'system')?.content || '';
    const userMsgs = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role,
      content: m.content,
    }));
    const resp = await anthropic.messages.create({
      model: agent.model,
      max_tokens: agent.id === 'jarvis' ? 800 : 500,
      temperature: agent.id === 'jarvis' ? 0.6 : 0.8,
      system: systemMsg,
      messages: userMsgs,
    });
    return resp.content[0]?.text?.trim() || '(no response)';
  } else if (agent.provider === 'openai') {
    if (!openai) throw new Error('OPENAI_API_KEY not configured.');
    const completion = await openai.chat.completions.create({
      model: agent.model,
      messages,
      max_tokens: 500,
      temperature: 0.8,
    });
    return completion.choices[0]?.message?.content?.trim() || '(no response)';
  }
  throw new Error(`Unknown provider: ${agent.provider}`);
}

// ─── Shared Styles ───────────────────────────────────────────────────────────
const NAV_STYLE = `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0d1117 100%);
      color: #e0e0e0;
      min-height: 100vh;
    }
    nav {
      background: rgba(10, 14, 39, 0.9);
      backdrop-filter: blur(20px);
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      border-bottom: 1px solid rgba(0, 212, 255, 0.15);
      position: sticky; top: 0; z-index: 100;
    }
    nav .logo {
      font-weight: 800; font-size: 1.1rem;
      background: linear-gradient(135deg, #00d4ff, #7b2ff7);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }
    nav a {
      color: #5a6a8a; text-decoration: none; font-weight: 500;
      font-size: 0.9rem; transition: all 0.3s; position: relative;
      padding: 0.3rem 0;
    }
    nav a:hover { color: #8b9dc3; }
    nav a.active {
      color: #00d4ff;
    }
    nav a.active::after {
      content: ''; position: absolute; bottom: -4px; left: 0; right: 0;
      height: 2px; background: linear-gradient(90deg, #00d4ff, #7b2ff7);
      border-radius: 1px;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  </style>
`;

const NAV_HTML = `
  <nav>
    <span class="logo">MISSION CTRL</span>
    <a href="/" id="nav-home">Home</a>
    <a href="/council" id="nav-council">Council</a>
    <a href="/growth" id="nav-growth">Growth</a>
    <a href="/pipeline" id="nav-pipeline">Pipeline</a>
    <a href="/content" id="nav-content">Content</a>
  </nav>
`;

// ─── Home Page ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mission Control</title>
    ${NAV_STYLE}
    <style>
      h1 { font-size: 3rem; font-weight: 800;
        background: linear-gradient(135deg, #00d4ff 0%, #7b2ff7 100%);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem; }
      .subtitle { color: #5a6a8a; font-size: 1.1rem; margin-bottom: 3rem; }
      .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
      .card {
        background: rgba(20, 25, 45, 0.6); border: 1px solid rgba(255,255,255,0.06);
        border-radius: 16px; padding: 2rem; transition: all 0.3s;
        cursor: pointer; text-decoration: none; color: inherit; display: block;
      }
      .card:hover { border-color: rgba(0, 212, 255, 0.3); transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0, 212, 255, 0.1); }
      .card .icon { font-size: 2rem; margin-bottom: 1rem; }
      .card h2 { color: #c0d0e8; font-size: 1.2rem; margin-bottom: 0.5rem; }
      .card p { color: #5a6a8a; font-size: 0.9rem; line-height: 1.6; }
    </style>
  </head><body>
    ${NAV_HTML}
    <div class="container">
      <h1>Mission Control</h1>
      <p class="subtitle">AI-powered operations dashboard</p>
      <div class="cards">
        <a href="/council" class="card"><div class="icon">🤖</div><h2>AI Council</h2><p>8 specialized AI agents — led by Jarvis (Opus) — collaborate across Anthropic &amp; OpenAI to deliver decisive, multi-perspective analysis.</p></a>
        <a href="/growth" class="card"><div class="icon">📈</div><h2>Growth</h2><p>Track growth metrics, conversion funnels, and expansion opportunities.</p></a>
        <a href="/pipeline" class="card"><div class="icon">🔄</div><h2>Pipeline</h2><p>Manage your project pipeline from ideation to delivery.</p></a>
        <a href="/content" class="card"><div class="icon">✍️</div><h2>Content</h2><p>Content calendar, ideas engine, and publishing workflow.</p></a>
      </div>
    </div>
    <script>document.getElementById('nav-home').classList.add('active');</script>
  </body></html>`);
});

// ─── Council Page ────────────────────────────────────────────────────────────
app.get('/council', (req, res) => {
  const allAgentsJSON = JSON.stringify(ALL_AGENTS.map(a => ({
    id: a.id, name: a.name, role: a.role, color: a.color, icon: a.icon, modelLabel: a.modelLabel
  })));

  res.send(`<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Council — Mission Control</title>
    ${NAV_STYLE}
    <style>
      /* ── Layout ── */
      .page-header { margin-bottom: 2rem; }
      .page-header h1 {
        font-size: 2.2rem; font-weight: 800;
        background: linear-gradient(135deg, #00d4ff 0%, #7b2ff7 100%);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      }
      .page-header p { color: #5a6a8a; margin-top: 0.3rem; }
      .page-header .model-info {
        display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem;
      }
      .page-header .model-badge {
        font-size: 0.7rem; padding: 0.2rem 0.6rem; border-radius: 50px;
        background: rgba(255,255,255,0.04); color: #5a6a8a;
        border: 1px solid rgba(255,255,255,0.06);
      }
      .page-header .model-badge.opus {
        background: rgba(249, 202, 36, 0.1); color: #f9ca24;
        border-color: rgba(249, 202, 36, 0.25);
      }

      /* ── Agent Roster ── */
      .roster {
        display: flex; gap: 0.75rem; flex-wrap: wrap;
        margin-bottom: 2rem; padding: 1.25rem;
        background: rgba(15, 18, 35, 0.6);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 14px;
      }
      .agent-chip {
        display: flex; align-items: center; gap: 0.5rem;
        padding: 0.5rem 1rem; border-radius: 50px;
        background: rgba(30, 35, 55, 0.8);
        border: 1px solid rgba(255,255,255,0.08);
        font-size: 0.82rem; transition: all 0.4s;
        position: relative;
      }
      .agent-chip.jarvis-chip {
        background: rgba(249, 202, 36, 0.06);
        border-color: rgba(249, 202, 36, 0.15);
        order: 100;
      }
      .roster-divider {
        display: flex; align-items: center; padding: 0 0.5rem;
        color: #3a4a6a; font-size: 0.75rem; order: 99;
      }
      .roster-divider::before, .roster-divider::after {
        content: ''; flex: 0; height: 1px; width: 8px;
        background: rgba(255,255,255,0.1); margin: 0 0.4rem;
      }
      .agent-chip .dot {
        width: 8px; height: 8px; border-radius: 50%;
        flex-shrink: 0; transition: all 0.4s;
        opacity: 0.4;
      }
      .agent-chip.active { border-color: var(--agent-color); }
      .agent-chip.active .dot {
        opacity: 1;
        box-shadow: 0 0 8px var(--agent-color);
        animation: pulse 1.5s ease-in-out infinite;
      }
      .agent-chip.done .dot { opacity: 1; }
      .agent-chip .role { color: #5a6a8a; font-size: 0.75rem; }
      .agent-chip .name { color: #c0d0e8; font-weight: 600; }
      .agent-chip .model-tag {
        font-size: 0.6rem; color: #4a5a7a; background: rgba(255,255,255,0.04);
        padding: 0.1rem 0.4rem; border-radius: 50px;
      }
      @keyframes pulse {
        0%, 100% { box-shadow: 0 0 4px var(--agent-color); }
        50% { box-shadow: 0 0 14px var(--agent-color); }
      }

      /* ── Input Area ── */
      .input-area {
        display: flex; gap: 0.75rem; margin-bottom: 2rem;
      }
      .input-area input {
        flex: 1; padding: 0.9rem 1.2rem;
        background: rgba(15, 18, 35, 0.8);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px; color: #e0e0e0;
        font-size: 1rem; font-family: inherit;
        transition: border-color 0.3s;
        outline: none;
      }
      .input-area input:focus { border-color: rgba(0, 212, 255, 0.5); }
      .input-area input::placeholder { color: #3a4a6a; }
      .btn-primary {
        padding: 0.9rem 2rem;
        background: linear-gradient(135deg, #00d4ff 0%, #7b2ff7 100%);
        border: none; border-radius: 12px;
        color: white; font-weight: 700; font-size: 0.95rem;
        cursor: pointer; transition: all 0.3s;
        font-family: inherit; white-space: nowrap;
      }
      .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
      }
      .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

      /* ── Chat Feed ── */
      .feed {
        display: flex; flex-direction: column; gap: 1rem;
        margin-bottom: 2rem;
      }
      .msg {
        padding: 1.25rem 1.5rem;
        background: rgba(15, 20, 40, 0.7);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 14px;
        border-left: 3px solid var(--agent-color, #333);
        animation: fadeSlide 0.4s ease-out;
      }
      .msg .msg-header {
        display: flex; align-items: center; gap: 0.6rem;
        margin-bottom: 0.6rem;
      }
      .msg .msg-icon {
        width: 28px; height: 28px; border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.9rem; flex-shrink: 0;
        background: rgba(255,255,255,0.05);
      }
      .msg .msg-name {
        font-weight: 700; color: var(--agent-color, #c0d0e8);
        font-size: 0.9rem;
      }
      .msg .msg-role {
        font-size: 0.75rem; color: #5a6a8a;
        background: rgba(255,255,255,0.04);
        padding: 0.15rem 0.5rem; border-radius: 50px;
      }
      .msg .msg-model {
        font-size: 0.65rem; color: #4a5a7a;
        margin-left: auto;
      }
      .msg .msg-body {
        color: #b0c4de; font-size: 0.92rem; line-height: 1.7;
        white-space: pre-wrap;
      }
      .msg .msg-body strong { color: #e0e8f0; }
      @keyframes fadeSlide {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* ── User message ── */
      .msg.user-msg {
        background: rgba(0, 212, 255, 0.06);
        border-left-color: #00d4ff;
      }

      /* ── Jarvis Decision Card ── */
      .jarvis-card {
        background: linear-gradient(135deg, rgba(249, 202, 36, 0.06), rgba(249, 150, 36, 0.04));
        border: 1px solid rgba(249, 202, 36, 0.25);
        border-radius: 16px; padding: 2rem;
        animation: fadeSlide 0.5s ease-out;
        position: relative;
        overflow: hidden;
      }
      .jarvis-card::before {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, #f9ca24, #f39c12, #f9ca24);
      }
      .jarvis-card .jarvis-header {
        display: flex; align-items: center; gap: 0.75rem;
        margin-bottom: 1.25rem;
      }
      .jarvis-card .jarvis-header .crown {
        font-size: 1.5rem;
      }
      .jarvis-card .jarvis-header h3 {
        font-size: 1.1rem; font-weight: 800;
        background: linear-gradient(135deg, #f9ca24, #f39c12);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      }
      .jarvis-card .jarvis-header .jarvis-badge {
        font-size: 0.65rem; color: #f9ca24;
        background: rgba(249, 202, 36, 0.1);
        border: 1px solid rgba(249, 202, 36, 0.2);
        padding: 0.15rem 0.5rem; border-radius: 50px;
        margin-left: auto;
      }
      .jarvis-card .jarvis-body {
        color: #d4c5a0; font-size: 0.95rem; line-height: 1.8;
        white-space: pre-wrap;
      }
      .jarvis-card .jarvis-body strong { color: #f0e6c0; }

      /* ── Phase Divider ── */
      .phase-divider {
        display: flex; align-items: center; gap: 1rem;
        margin: 1.5rem 0;
        animation: fadeSlide 0.4s ease-out;
      }
      .phase-divider::before, .phase-divider::after {
        content: ''; flex: 1; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(249, 202, 36, 0.3), transparent);
      }
      .phase-divider span {
        font-size: 0.75rem; color: #f9ca24; font-weight: 700;
        text-transform: uppercase; letter-spacing: 1px;
        white-space: nowrap;
      }

      /* ── Typing Indicator ── */
      .typing-indicator {
        display: flex; align-items: center; gap: 0.6rem;
        padding: 1rem 1.5rem;
        background: rgba(15, 20, 40, 0.5);
        border: 1px solid rgba(255,255,255,0.04);
        border-radius: 14px;
        border-left: 3px solid var(--agent-color, #333);
        animation: fadeSlide 0.3s ease-out;
      }
      .typing-indicator.jarvis-typing {
        background: rgba(249, 202, 36, 0.04);
        border: 1px solid rgba(249, 202, 36, 0.15);
        border-left: 3px solid #f9ca24;
      }
      .typing-dots { display: flex; gap: 4px; }
      .typing-dots span {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--agent-color, #5a6a8a);
        animation: typingBounce 1.2s infinite;
      }
      .typing-dots span:nth-child(2) { animation-delay: 0.15s; }
      .typing-dots span:nth-child(3) { animation-delay: 0.3s; }
      @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-6px); opacity: 1; }
      }
      .typing-label { color: #5a6a8a; font-size: 0.82rem; }

      /* ── Empty State ── */
      .empty-state {
        text-align: center; padding: 4rem 2rem;
        color: #3a4a6a;
      }
      .empty-state .icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
      .empty-state p { font-size: 0.95rem; line-height: 1.6; }
      .empty-state .hint { font-size: 0.82rem; margin-top: 1rem; color: #2a3a5a; }
      .empty-state .flow {
        display: flex; align-items: center; justify-content: center;
        gap: 0.5rem; margin-top: 1.5rem; flex-wrap: wrap;
      }
      .empty-state .flow-step {
        font-size: 0.72rem; padding: 0.2rem 0.6rem;
        border-radius: 50px; background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        color: #4a5a7a;
      }
      .empty-state .flow-step.jarvis {
        background: rgba(249, 202, 36, 0.08);
        border-color: rgba(249, 202, 36, 0.2);
        color: #f9ca24;
      }
      .empty-state .flow-arrow { color: #2a3a5a; font-size: 0.7rem; }

      /* ── Error ── */
      .error-msg {
        background: rgba(255, 71, 87, 0.1);
        border: 1px solid rgba(255, 71, 87, 0.3);
        border-radius: 12px; padding: 1rem 1.5rem;
        color: #ff6b7a; font-size: 0.9rem;
        animation: fadeSlide 0.3s ease-out;
      }

      /* ── Session counter ── */
      .session-info {
        display: flex; justify-content: flex-end; margin-bottom: 0.5rem;
      }
      .session-info span {
        font-size: 0.75rem; color: #3a4a6a;
        background: rgba(255,255,255,0.03);
        padding: 0.2rem 0.6rem; border-radius: 50px;
      }
    </style>
  </head><body>
    ${NAV_HTML}
    <div class="container">
      <div class="page-header">
        <h1>🤖 AI Council</h1>
        <p>8 agents. Led by Jarvis. Multi-model AI collaboration across Anthropic &amp; OpenAI.</p>
        <div class="model-info">
          <span class="model-badge opus">👑 Jarvis — Opus (Final Decision)</span>
          <span class="model-badge">♟️ Alpha — Sonnet 4.5</span>
          <span class="model-badge">🔬 Beta — GPT-4o</span>
          <span class="model-badge">⚡ Gamma — Haiku</span>
          <span class="model-badge">📊 Delta — Sonnet</span>
          <span class="model-badge">🎨 Epsilon — GPT-4o</span>
          <span class="model-badge">🔧 Zeta — Haiku</span>
          <span class="model-badge">🧬 Eta — Sonnet</span>
        </div>
      </div>

      <!-- Agent Roster -->
      <div class="roster" id="roster">
        ${COUNCIL_AGENTS.map(a => `
          <div class="agent-chip" id="chip-${a.id}" style="--agent-color: ${a.color}">
            <span class="dot" style="background: ${a.color}"></span>
            <span class="name">${a.icon} ${a.name}</span>
            <span class="role">${a.role}</span>
            <span class="model-tag">${a.modelLabel}</span>
          </div>
        `).join('')}
        <div class="roster-divider">→</div>
        <div class="agent-chip jarvis-chip" id="chip-jarvis" style="--agent-color: #f9ca24">
          <span class="dot" style="background: #f9ca24"></span>
          <span class="name" style="color: #f9ca24">👑 Jarvis</span>
          <span class="role">Chief of Staff</span>
          <span class="model-tag" style="color: #f9ca24">Opus</span>
        </div>
      </div>

      <!-- Input -->
      <div class="input-area">
        <input type="text" id="prompt" placeholder="Enter a challenge, question, or strategy for the council..." autocomplete="off" />
        <button class="btn-primary" id="submitBtn" onclick="submitPrompt()">Convene Council</button>
      </div>

      <!-- Feed -->
      <div id="feed">
        <div class="empty-state">
          <div class="icon">🏛️</div>
          <p>The council chamber is ready.<br>8 agents await your prompt — 7 collaborate, then Jarvis decides.</p>
          <div class="flow">
            <span class="flow-step">♟️ Alpha</span>
            <span class="flow-arrow">→</span>
            <span class="flow-step">🔬 Beta</span>
            <span class="flow-arrow">→</span>
            <span class="flow-step">⚡ Gamma</span>
            <span class="flow-arrow">→</span>
            <span class="flow-step">📊 Delta</span>
            <span class="flow-arrow">→</span>
            <span class="flow-step">🎨 Epsilon</span>
            <span class="flow-arrow">→</span>
            <span class="flow-step">🔧 Zeta</span>
            <span class="flow-arrow">→</span>
            <span class="flow-step">🧬 Eta</span>
            <span class="flow-arrow">→</span>
            <span class="flow-step jarvis">👑 Jarvis</span>
          </div>
          <p class="hint">Cost-optimized: Haiku for speed · Sonnet for depth · GPT-4o for diversity · Opus for decisions</p>
        </div>
      </div>
    </div>

    <script>
      const AGENTS = ${allAgentsJSON};
      const COUNCIL = AGENTS.filter(a => a.id !== 'jarvis');
      const JARVIS = AGENTS.find(a => a.id === 'jarvis');
      const feed = document.getElementById('feed');
      const promptInput = document.getElementById('prompt');
      const submitBtn = document.getElementById('submitBtn');
      let isRunning = false;
      let sessionCount = 0;

      function resetChips() {
        AGENTS.forEach(a => {
          const chip = document.getElementById('chip-' + a.id);
          if (chip) chip.classList.remove('active', 'done');
        });
      }

      function activateChip(agentId) {
        const chip = document.getElementById('chip-' + agentId);
        if (chip) chip.classList.add('active');
      }

      function doneChip(agentId) {
        const chip = document.getElementById('chip-' + agentId);
        if (chip) { chip.classList.remove('active'); chip.classList.add('done'); }
      }

      function addUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'msg user-msg';
        div.style = '--agent-color: #00d4ff';
        div.innerHTML =
          '<div class="msg-header">' +
            '<div class="msg-icon">👤</div>' +
            '<span class="msg-name" style="color: #00d4ff">You</span>' +
          '</div>' +
          '<div class="msg-body">' + escapeHtml(text) + '</div>';
        feed.appendChild(div);
        scrollToBottom();
      }

      function addTypingIndicator(agent) {
        const isJarvis = agent.id === 'jarvis';
        const div = document.createElement('div');
        div.className = 'typing-indicator' + (isJarvis ? ' jarvis-typing' : '');
        div.id = 'typing-' + agent.id;
        div.style = '--agent-color: ' + agent.color;
        div.innerHTML =
          '<div class="typing-dots"><span></span><span></span><span></span></div>' +
          '<span class="typing-label">' + agent.icon + ' ' + agent.name + ' (' + agent.role + ') is ' +
          (isJarvis ? 'making the final decision...' : 'thinking...') + '</span>';
        feed.appendChild(div);
        scrollToBottom();
      }

      function removeTypingIndicator(agentId) {
        const el = document.getElementById('typing-' + agentId);
        if (el) el.remove();
      }

      function addAgentMessage(agent, text) {
        const div = document.createElement('div');
        div.className = 'msg';
        div.style = '--agent-color: ' + agent.color;
        div.innerHTML =
          '<div class="msg-header">' +
            '<div class="msg-icon">' + agent.icon + '</div>' +
            '<span class="msg-name">' + agent.name + '</span>' +
            '<span class="msg-role">' + agent.role + '</span>' +
            '<span class="msg-model">' + agent.modelLabel + '</span>' +
          '</div>' +
          '<div class="msg-body">' + formatMarkdown(text) + '</div>';
        feed.appendChild(div);
        scrollToBottom();
      }

      function addPhaseDivider() {
        const div = document.createElement('div');
        div.className = 'phase-divider';
        div.innerHTML = '<span>👑 Jarvis — Final Decision</span>';
        feed.appendChild(div);
        scrollToBottom();
      }

      function addJarvisDecision(text) {
        const div = document.createElement('div');
        div.className = 'jarvis-card';
        div.innerHTML =
          '<div class="jarvis-header">' +
            '<span class="crown">👑</span>' +
            '<h3>Jarvis — Final Decision</h3>' +
            '<span class="jarvis-badge">Opus · Chief of Staff</span>' +
          '</div>' +
          '<div class="jarvis-body">' + formatMarkdown(text) + '</div>';
        feed.appendChild(div);
        scrollToBottom();
      }

      function addError(text) {
        const div = document.createElement('div');
        div.className = 'error-msg';
        div.textContent = text;
        feed.appendChild(div);
        scrollToBottom();
      }

      function scrollToBottom() {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }

      function escapeHtml(s) {
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
      }

      function formatMarkdown(text) {
        let html = escapeHtml(text);
        html = html.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
        html = html.replace(/^[-•] (.+)$/gm, '&nbsp;&nbsp;• $1');
        html = html.replace(/^(\\d+)\\. (.+)$/gm, '&nbsp;&nbsp;$1. $2');
        return html;
      }

      async function submitPrompt() {
        if (isRunning) return;
        const prompt = promptInput.value.trim();
        if (!prompt) return;

        isRunning = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Council in session...';
        promptInput.value = '';

        if (sessionCount === 0) {
          feed.innerHTML = '';
        } else {
          const sep = document.createElement('hr');
          sep.style.cssText = 'border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 2rem 0;';
          feed.appendChild(sep);
        }
        sessionCount++;

        const badge = document.createElement('div');
        badge.className = 'session-info';
        badge.innerHTML = '<span>Session #' + sessionCount + '</span>';
        feed.appendChild(badge);

        resetChips();
        addUserMessage(prompt);

        try {
          const res = await fetch('/api/council', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
          });

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\\n');
            buffer = lines.pop();

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const evt = JSON.parse(data);

                if (evt.type === 'thinking') {
                  const agent = AGENTS.find(a => a.id === evt.agentId);
                  if (agent) {
                    activateChip(agent.id);
                    addTypingIndicator(agent);
                  }
                } else if (evt.type === 'response') {
                  const agent = AGENTS.find(a => a.id === evt.agentId);
                  if (agent) {
                    removeTypingIndicator(agent.id);
                    doneChip(agent.id);
                    addAgentMessage(agent, evt.text);
                  }
                } else if (evt.type === 'phase') {
                  addPhaseDivider();
                } else if (evt.type === 'jarvis') {
                  removeTypingIndicator('jarvis');
                  doneChip('jarvis');
                  addJarvisDecision(evt.text);
                } else if (evt.type === 'error') {
                  addError(evt.text);
                }
              } catch (e) { /* skip malformed */ }
            }
          }
        } catch (err) {
          addError('Connection error: ' + err.message);
        }

        isRunning = false;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Convene Council';
      }

      promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          submitPrompt();
        }
      });
    </script>
    <script>document.getElementById('nav-council').classList.add('active');</script>
  </body></html>`);
});

// ─── Council API (SSE streaming) ─────────────────────────────────────────────
app.post('/api/council', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  // Check that at least one provider is configured
  if (!anthropic && !openai) {
    return res.status(500).json({ error: 'No API keys configured. Set ANTHROPIC_API_KEY and/or OPENAI_API_KEY.' });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const conversationHistory = [];

  try {
    // ── Phase 1: Council Agents (Alpha → Eta) ──
    for (const agent of COUNCIL_AGENTS) {
      send({ type: 'thinking', agentId: agent.id });

      const messages = [
        { role: 'system', content: agent.system },
        {
          role: 'user',
          content: conversationHistory.length === 0
            ? `User prompt: "${prompt.trim()}"`
            : `User prompt: "${prompt.trim()}"\n\nCouncil discussion so far:\n${conversationHistory.map(h => `[${h.name} — ${h.role}]: ${h.text}`).join('\n\n')}`,
        },
      ];

      try {
        const text = await callLLM(agent, messages);
        conversationHistory.push({ name: agent.name, role: agent.role, text });
        send({ type: 'response', agentId: agent.id, text });
      } catch (err) {
        const fallbackText = `(${agent.name} unavailable: ${err.message})`;
        conversationHistory.push({ name: agent.name, role: agent.role, text: fallbackText });
        send({ type: 'response', agentId: agent.id, text: fallbackText });
      }
    }

    // ── Phase 2: Jarvis Final Decision (Opus) ──
    send({ type: 'phase' });
    send({ type: 'thinking', agentId: 'jarvis' });

    const jarvisMessages = [
      { role: 'system', content: JARVIS.system },
      {
        role: 'user',
        content: `Original prompt: "${prompt.trim()}"\n\nFull council transcript:\n${conversationHistory.map(h => `[${h.name} — ${h.role}]: ${h.text}`).join('\n\n')}\n\nYou are Jarvis. You've heard everyone. Now make the call.`,
      },
    ];

    const jarvisText = await callLLM(JARVIS, jarvisMessages);
    send({ type: 'jarvis', text: jarvisText });

  } catch (err) {
    console.error('Council API error:', err.message);
    send({ type: 'error', text: 'AI error: ' + (err.message || 'Unknown error') });
  }

  res.write('data: [DONE]\n\n');
  res.end();
});

// ─── Stub Pages ──────────────────────────────────────────────────────────────
const stubPage = (title, navId) => `<!DOCTYPE html><html lang="en"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Mission Control</title>
  ${NAV_STYLE}
  <style>
    .coming-soon {
      text-align: center; padding: 6rem 2rem;
    }
    .coming-soon h1 {
      font-size: 2.5rem; font-weight: 800;
      background: linear-gradient(135deg, #00d4ff, #7b2ff7);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      margin-bottom: 1rem;
    }
    .coming-soon p { color: #5a6a8a; }
  </style>
</head><body>
  ${NAV_HTML}
  <div class="container"><div class="coming-soon">
    <h1>${title}</h1><p>Coming soon.</p>
  </div></div>
  <script>document.getElementById('${navId}').classList.add('active');</script>
</body></html>`;

app.get('/growth', (req, res) => res.send(stubPage('Growth', 'nav-growth')));
app.get('/pipeline', (req, res) => res.send(stubPage('Pipeline', 'nav-pipeline')));
app.get('/content', (req, res) => res.send(stubPage('Content', 'nav-content')));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({
  status: 'ok',
  agents: ALL_AGENTS.length,
  providers: {
    anthropic: !!anthropic,
    openai: !!openai,
  },
  models: ALL_AGENTS.map(a => ({ id: a.id, model: a.modelLabel, provider: a.provider })),
}));

app.listen(port, () => {
  console.log(`Mission Control running on port ${port}`);
  console.log(`Council: ${COUNCIL_AGENTS.length} agents + Jarvis (Chief of Staff)`);
  console.log(`Providers: Anthropic=${!!anthropic}, OpenAI=${!!openai}`);
});

module.exports = app;
