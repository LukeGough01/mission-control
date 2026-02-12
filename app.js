const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Welcome to Mission Control');
});

app.get('/council', (req, res) => {
  res.send(`
    <html>
      <head><title>AI Council</title></head>
      <body>
        <h1>AI Council Pixel-Art Room</h1>
        <canvas id="room" width="800" height="600"></canvas>
        <div id="chat"></div>
        <script>
          const canvas = document.getElementById('room');
          const ctx = canvas.getContext('2d');
          // Simple pixel art room
          ctx.fillStyle = '#ccc';
          ctx.fillRect(0, 0, 800, 600);
          // Draw agents as colored squares with names
          const agents = [
            {name: 'Alpha', color: 'red', x: 50, y: 50},
            {name: 'Beta', color: 'blue', x: 150, y: 50},
            {name: 'Gamma', color: 'green', x: 250, y: 50},
            {name: 'Delta', color: 'yellow', x: 350, y: 50},
            {name: 'Epsilon', color: 'purple', x: 450, y: 50},
            {name: 'Zeta', color: 'orange', x: 550, y: 50},
            {name: 'Eta', color: 'pink', x: 650, y: 50}
          ];
          agents.forEach(agent => {
            ctx.fillStyle = agent.color;
            ctx.fillRect(agent.x, agent.y, 50, 50);
            ctx.fillStyle = 'black';
            ctx.fillText(agent.name, agent.x, agent.y + 60);
          });
          // Collaboration flow
          const chat = document.getElementById('chat');
          function addMessage(agent, text) {
            const p = document.createElement('p');
            p.textContent = \`${agent}: ${text}\`;
            chat.appendChild(p);
          }
          // Simulate collaboration
          addMessage('Alpha', 'Let\'s start the meeting.');
          setTimeout(() => addMessage('Beta', 'I have a strategy.'), 1000);
          setTimeout(() => addMessage('Gamma', 'Research complete.'), 2000);
          setTimeout(() => addMessage('Delta', 'Implementing now.'), 3000);
          // Add more as needed
        </script>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
