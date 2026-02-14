// Shorts Generator Page Template
// Add this route after the /pipeline route in app.js

const shortsPageHTML = `<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shorts Generator -- Mission Control</title>
    ${NAV_STYLE}
    <style>
      .page-header h1 { font-size: 2.2rem; font-weight: 800; background: linear-gradient(135deg, #00d4ff 0%, #7b2ff7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .page-header p { color: #5a6a8a; margin-top: 0.3rem; }

      .generator-card {
        background: rgba(12, 15, 30, 0.7); backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
        padding: 2rem; margin-bottom: 2rem;
      }
      .generator-card h2 { color: #c0d0e8; font-size: 1.3rem; margin-bottom: 1.5rem; }
      
      .upload-zone {
        border: 2px dashed rgba(0, 212, 255, 0.3);
        border-radius: 16px;
        padding: 3rem;
        text-align: center;
        background: rgba(0, 212, 255, 0.02);
        cursor: pointer;
        transition: all 0.3s;
      }
      .upload-zone:hover { border-color: rgba(0, 212, 255, 0.6); background: rgba(0, 212, 255, 0.05); }
      .upload-zone.drag-over { border-color: #00d4ff; background: rgba(0, 212, 255, 0.1); }
      .upload-icon { font-size: 3rem; margin-bottom: 1rem; }
      .upload-text { color: #c0d0e8; font-size: 1.1rem; margin-bottom: 0.5rem; }
      .upload-hint { color: #5a6a8a; font-size: 0.85rem; }

      .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
      .form-group label { display: block; color: #5a6a8a; font-size: 0.85rem; margin-bottom: 0.5rem; font-weight: 600; }
      .form-group input, .form-group select { 
        width: 100%; padding: 0.75rem; background: rgba(10, 12, 25, 0.8); 
        border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; 
        color: #e0e0e0; font-size: 0.9rem; font-family: inherit;
      }
      .form-group input:focus, .form-group select:focus { 
        outline: none; border-color: rgba(0, 212, 255, 0.5); 
      }

      .btn { padding: 0.8rem 1.75rem; border: none; border-radius: 12px; font-weight: 600; font-size: 0.9rem; cursor: pointer; font-family: inherit; transition: all 0.3s; }
      .btn-primary { background: linear-gradient(135deg, #00d4ff 0%, #7b2ff7 100%); color: white; }
      .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0, 212, 255, 0.4); }
      .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

      .progress { background: rgba(10, 12, 25, 0.8); border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem; display: none; }
      .progress.active { display: block; }
      .progress-bar { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-bottom: 1rem; }
      .progress-fill { height: 100%; background: linear-gradient(90deg, #00d4ff 0%, #7b2ff7 100%); width: 0%; transition: width 0.3s; }
      .progress-text { color: #c0d0e8; font-size: 0.9rem; }

      .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
      .short-card {
        background: rgba(12, 15, 30, 0.7); backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;
        padding: 1rem; transition: all 0.3s;
      }
      .short-card:hover { transform: translateY(-4px); border-color: rgba(0, 212, 255, 0.3); }
      .short-preview { width: 100%; aspect-ratio: 9/16; background: #000; border-radius: 12px; margin-bottom: 0.75rem; }
      .short-info { color: #c0d0e8; font-size: 0.85rem; margin-bottom: 0.5rem; }
      .short-actions { display: flex; gap: 0.5rem; }
      .short-actions button { flex: 1; padding: 0.5rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #c0d0e8; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; }
      .short-actions button:hover { background: rgba(0, 212, 255, 0.1); border-color: rgba(0, 212, 255, 0.3); }
    </style>
  </head><body>
    ${NAV_BAR}
    <div class="page-content">
      <div class="page-header">
        <h1>🎬 Shorts Generator</h1>
        <p>Transform long-form videos into viral vertical clips</p>
      </div>

      <!-- Upload Section -->
      <div class="generator-card">
        <h2>1. Upload Video</h2>
        <div class="upload-zone" id="uploadZone" onclick="document.getElementById('fileInput').click()">
          <div class="upload-icon">📹</div>
          <div class="upload-text">Click to upload or drag & drop</div>
          <div class="upload-hint">MP4, MOV, or any video format</div>
          <input type="file" id="fileInput" accept="video/*" style="display:none" onchange="handleFileSelect(event)" />
        </div>

        <!-- Generate Options -->
        <div class="form-grid" id="optionsPanel" style="display:none">
          <div class="form-group">
            <label>Number of Clips</label>
            <input type="number" id="numClips" value="3" min="1" max="10" />
          </div>
          <div class="form-group">
            <label>Clip Duration (seconds)</label>
            <input type="number" id="duration" value="45" min="15" max="90" />
          </div>
          <div class="form-group">
            <label>Quality</label>
            <select id="quality">
              <option value="high">High (Best for uploads)</option>
              <option value="medium">Medium (Faster)</option>
              <option value="low">Low (Preview)</option>
            </select>
          </div>
        </div>

        <button class="btn btn-primary" id="generateBtn" style="display:none; margin-top:1.5rem" onclick="generateShorts()">
          Generate Shorts
        </button>

        <!-- Progress -->
        <div class="progress" id="progress">
          <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
          <div class="progress-text" id="progressText">Processing...</div>
        </div>
      </div>

      <!-- Gallery Section -->
      <div class="generator-card" id="gallerySection" style="display:none">
        <h2>📂 Generated Shorts</h2>
        <div class="gallery" id="gallery"></div>
      </div>
    </div>

    <script>
      let selectedFile = null;

      // Drag and drop
      const uploadZone = document.getElementById('uploadZone');
      uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
      });
      uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
      });
      uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          handleFile(files[0]);
        }
      });

      function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) handleFile(file);
      }

      function handleFile(file) {
        if (!file.type.startsWith('video/')) {
          alert('Please select a video file');
          return;
        }
        
        selectedFile = file;
        document.querySelector('.upload-text').textContent = '✅ ' + file.name;
        document.querySelector('.upload-hint').textContent = 'File size: ' + (file.size / 1024 / 1024).toFixed(1) + ' MB';
        document.getElementById('optionsPanel').style.display = 'grid';
        document.getElementById('generateBtn').style.display = 'block';
      }

      async function generateShorts() {
        if (!selectedFile) return;

        const numClips = document.getElementById('numClips').value;
        const duration = document.getElementById('duration').value;
        const quality = document.getElementById('quality').value;

        // Show progress
        document.getElementById('progress').classList.add('active');
        document.getElementById('generateBtn').disabled = true;

        // Upload file
        const formData = new FormData();
        formData.append('video', selectedFile);
        formData.append('numClips', numClips);
        formData.append('duration', duration);
        formData.append('quality', quality);

        try {
          updateProgress(10, 'Uploading video...');
          
          const res = await fetch('/api/shorts/generate', {
            method: 'POST',
            body: formData
          });

          if (!res.ok) throw new Error('Generation failed');

          updateProgress(50, 'Processing video...');

          const result = await res.json();

          updateProgress(100, 'Complete!');

          // Show gallery
          displayShorts(result.shorts);

          setTimeout(() => {
            document.getElementById('progress').classList.remove('active');
            document.getElementById('generateBtn').disabled = false;
          }, 2000);

        } catch (err) {
          alert('Error: ' + err.message);
          document.getElementById('progress').classList.remove('active');
          document.getElementById('generateBtn').disabled = false;
        }
      }

      function updateProgress(percent, text) {
        document.getElementById('progressFill').style.width = percent + '%';
        document.getElementById('progressText').textContent = text;
      }

      function displayShorts(shorts) {
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';

        shorts.forEach((short, i) => {
          const card = document.createElement('div');
          card.className = 'short-card';
          card.innerHTML = \`
            <video class="short-preview" src="/api/shorts/download/\${short.filename}" controls></video>
            <div class="short-info">
              <strong>Clip \${i + 1}</strong><br>
              Start: \${short.start}s | Duration: \${short.duration}s
            </div>
            <div class="short-actions">
              <button onclick="downloadShort('\${short.filename}')">⬇️ Download</button>
              <button onclick="copyLink('\${short.filename}')">🔗 Copy Link</button>
            </div>
          \`;
          gallery.appendChild(card);
        });

        document.getElementById('gallerySection').style.display = 'block';
      }

      function downloadShort(filename) {
        window.location.href = '/api/shorts/download/' + filename;
      }

      function copyLink(filename) {
        const link = window.location.origin + '/api/shorts/download/' + filename;
        navigator.clipboard.writeText(link);
        alert('Link copied to clipboard!');
      }

      // Load existing shorts on page load
      fetch('/api/shorts/list')
        .then(res => res.json())
        .then(shorts => {
          if (shorts.length > 0) displayShorts(shorts);
        });
    </script>
    <script>document.getElementById('nav-shorts') && document.getElementById('nav-shorts').classList.add('active');</script>
  </body></html>`;

// Route handler
app.get('/shorts', (req, res) => {
  res.send(shortsPageHTML);
});
