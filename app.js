const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mission Control</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
          color: #e0e0e0;
          min-height: 100vh;
        }
        nav {
          background: rgba(20, 25, 45, 0.8);
          backdrop-filter: blur(10px);
          padding: 1rem 2rem;
          display: flex;
          gap: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        nav a {
          color: #8b9dc3;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        nav a:hover, nav a.active {
          color: #00d4ff;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }
        h1 {
          font-size: 3rem;
          background: linear-gradient(135deg, #00d4ff 0%, #7b2ff7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 2rem;
        }
        .card {
          background: rgba(30, 35, 55, 0.6);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 1.5rem;
        }
        .card h2 {
          color: #00d4ff;
          margin-bottom: 1rem;
        }
      </style>
    </head>
    <body>
      <nav>
        <a href="/" class="active">Home</a>
        <a href="/council">Council</a>
        <a href="/growth">Growth</a>
        <a href="/pipeline">Pipeline</a>
        <a href="/content">Content</a>
      </nav>
      <div class="container">
        <h1>Mission Control</h1>
        <div class="card">
          <h2>Welcome</h2>
          <p>Your fully executable AI-powered dashboard for business operations.</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/council', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI Council - Mission Control</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
          color: #e0e0e0;
          min-height: 100vh;
        }
        nav {
          background: rgba(20, 25, 45, 0.8);
          backdrop-filter: blur(10px);
          padding: 1rem 2rem;
          display: flex;
          gap: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        nav a {
          color: #8b9dc3;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        nav a:hover, nav a.active {
          color: #00d4ff;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        h1 {
          font-size: 2.5rem;
          background: linear-gradient(135deg, #00d4ff 0%, #7b2ff7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 2rem;
        }
        .room-container {
          background: rgba(30, 35, 55, 0.6);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }
        canvas {
          background: #1e2337;
          border-radius: 8px;
          display: block;
          margin: 0 auto 1.5rem;
          box-shadow: 0 8px 32px rgba(0, 212, 255, 0.2);
        }
        #chat {
          background: rgba(15, 20, 35, 0.8);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 1.5rem;
          max-height: 300px;
          overflow-y: auto;
        }
        #chat p {
          margin: 0.5rem 0;
          padding: 0.5rem;
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
          color: #b0c4de;
        }
        #chat p strong {
          color: #00d4ff;
        }
        .input-area {
          margin-top: 1rem;
          display: flex;
          gap: 0.5rem;
        }
        input {
          flex: 1;
          padding: 0.75rem 1rem;
          background: rgba(30, 35, 55, 0.8);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          color: #e0e0e0;
          font-size: 1rem;
        }
        button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #00d4ff 0%, #7b2ff7 100%);
          border: none;
          border-radius: 6px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        button:hover {
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <nav>
        <a href="/">Home</a>
        <a href="/council" class="active">Council</a>
        <a href="/growth">Growth</a>
        <a href="/pipeline">Pipeline</a>
        <a href="/content">Content</a>
      </nav>
      <div class="container">
        <h1>🤖 AI Council</h1>
        <div class="room-container">
          <canvas id="room" width="800" height="400"></canvas>
          <div id="chat"></div>
          <div class="input-area">
            <input type="text" id="prompt" placeholder="Enter a prompt for the council..." />
            <button onclick="submitPrompt()">Submit</button>
          </div>
        </div>
      </div>
      <script>
        const canvas = document.getElementById('room');
        const ctx = canvas.getContext('2d');
        
        // Draw pixel-art room
        ctx.fillStyle = '#1e2337';
        ctx.fillRect(0, 0, 800, 400);
        
        // Draw agents as colored squares with names
        const agents = [
          {name: 'Alpha', color: '#ff4757', x: 50, y: 150},
          {name: 'Beta', color: '#5352ed', x: 150, y: 150},
          {name: 'Gamma', color: '#20bf6b', x: 250, y: 150},
          {name: 'Delta', color: '#ffa502', x: 350, y: 150},
          {name: 'Epsilon', color: '#a29bfe', x: 450, y: 150},
          {name: 'Zeta', color: '#fd79a8', x: 550, y: 150},
          {name: 'Eta', color: '#00d2d3', x: 650, y: 150}
        ];
        
        agents.forEach(agent => {
          // Agent square
          ctx.fillStyle = agent.color;
          ctx.fillRect(agent.x, agent.y, 60, 60);
          // Agent name
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(agent.name, agent.x + 30, agent.y + 80);
        });
        
        // Chat functionality
        const chat = document.getElementById('chat');
        function addMessage(agent, text) {
          const p = document.createElement('p');
          p.innerHTML = '<strong>' + agent + ':</strong> ' + text;
          chat.appendChild(p);
          chat.scrollTop = chat.scrollHeight;
        }
        
        // Simulate initial collaboration
        addMessage('System', 'AI Council initialized. Enter a prompt to begin collaboration.');
        
        function submitPrompt() {
          const input = document.getElementById('prompt');
          const prompt = input.value.trim();
          if (!prompt) return;
          
          addMessage('User', prompt);
          input.value = '';
          
          // Simulate agent responses
          setTimeout(() => addMessage('Alpha', 'Analyzing prompt...'), 500);
          setTimeout(() => addMessage('Beta', 'Cross-referencing strategy...'), 1500);
          setTimeout(() => addMessage('Gamma', 'Research complete. Here are 3 key insights...'), 2500);
          setTimeout(() => addMessage('Delta', 'Implementation plan drafted.'), 3500);
          setTimeout(() => addMessage('Epsilon', 'Risk analysis: Low impact, high leverage.'), 4500);
          setTimeout(() => addMessage('Zeta', 'Content angle identified for YouTube.'), 5500);
          setTimeout(() => addMessage('Eta', 'Summary: Proceed with option B for fastest ROI.'), 6500);
        }
        
        // Enter key support
        document.getElementById('prompt').addEventListener('keypress', function(e) {
          if (e.key === 'Enter') submitPrompt();
        });
      </script>
    </body>
    </html>
  `);
});

// Stub pages for nav links
app.get('/growth', (req, res) => {
  res.send('<h1>Growth - Coming Soon</h1><a href="/">Back to Home</a>');
});

app.get('/pipeline', (req, res) => {
  res.send('<h1>Pipeline - Coming Soon</h1><a href="/">Back to Home</a>');
});

app.get('/content', (req, res) => {
  res.send('<h1>Content - Coming Soon</h1><a href="/">Back to Home</a>');
});

app.listen(port, () => {
  console.log('Mission Control running on port ' + port);
});
