// Replacement JavaScript for /pipeline page
// Replaces localStorage with API calls

const kanbanFixScript = `
    <script>
      var tasks = [];
      var draggedId = null;
      var searchTerm = '';

      // Load tasks from API
      async function loadTasks() {
        try {
          const res = await fetch('/api/tasks');
          tasks = await res.json();
          renderBoard();
        } catch (err) {
          console.error('Error loading tasks:', err);
        }
      }

      // Save task to API (create or update)
      async function saveTaskToAPI(taskData, taskId) {
        try {
          if (taskId) {
            // Update existing task
            const res = await fetch(\`/api/tasks/\${taskId}\`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(taskData)
            });
            const updated = await res.json();
            const index = tasks.findIndex(t => t.id === taskId);
            if (index >= 0) tasks[index] = updated;
          } else {
            // Create new task
            const res = await fetch('/api/tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(taskData)
            });
            const newTask = await res.json();
            tasks.push(newTask);
          }
          renderBoard();
        } catch (err) {
          console.error('Error saving task:', err);
        }
      }

      // Delete task via API
      async function deleteTaskFromAPI(taskId) {
        try {
          await fetch(\`/api/tasks/\${taskId}\`, { method: 'DELETE' });
          tasks = tasks.filter(t => t.id !== taskId);
          renderBoard();
        } catch (err) {
          console.error('Error deleting task:', err);
        }
      }

      // Update task column (drag and drop)
      async function updateTaskColumn(taskId, newColumn) {
        try {
          await fetch(\`/api/tasks/\${taskId}\`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ column: newColumn })
          });
          const task = tasks.find(t => t.id === taskId);
          if (task) task.column = newColumn;
          renderBoard();
        } catch (err) {
          console.error('Error updating task column:', err);
        }
      }

      function renderBoard() {
        var cols = ['ideas', 'in-progress', 'review', 'done'];
        cols.forEach(function(col) {
          var container = document.getElementById('tasks-' + col);
          container.innerHTML = '';
          var colTasks = tasks.filter(function(t) {
            if (t.column !== col) return false;
            if (searchTerm && t.title.toLowerCase().indexOf(searchTerm) === -1 && (t.desc || '').toLowerCase().indexOf(searchTerm) === -1) return false;
            return true;
          });
          document.getElementById('count-' + col).textContent = colTasks.length;
          colTasks.forEach(function(task) {
            var card = document.createElement('div');
            card.className = 'task-card';
            card.draggable = true;
            card.dataset.id = task.id;
            card.ondragstart = function(e) { draggedId = task.id; card.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; };
            card.ondragend = function() { card.classList.remove('dragging'); draggedId = null; };
            card.ondblclick = function() { openModal(null, task.id); };

            var priorityColors = { urgent: '#ff4757', high: '#ffa502', medium: '#ffd32a', low: '#2ed573' };
            var pColor = priorityColors[task.priority] || '#5a6a8a';

            var dueStr = '';
            if (task.due) {
              var d = new Date(task.due + 'T00:00:00');
              dueStr = '<span class="due-tag">📅 ' + d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }) + '</span>';
            }

            var assigneeStr = '';
            if (task.assignee) {
              assigneeStr = '<span class="assignee-tag">👤 ' + task.assignee + '</span>';
            }

            card.innerHTML = '<div class="priority-bar" style="background:' + pColor + '"></div>' +
              '<div class="task-actions">' +
                '<button class="task-action-btn" onclick="event.stopPropagation();openModal(null,\\'' + task.id + '\\')">✏️</button>' +
                '<button class="task-action-btn delete" onclick="event.stopPropagation();deleteTaskById(\\'' + task.id + '\\')">🗑</button>' +
              '</div>' +
              '<div class="task-title">' + escHtml(task.title) + '</div>' +
              (task.desc ? '<div class="task-desc">' + escHtml(task.desc) + '</div>' : '') +
              '<div class="task-meta">' +
                '<span class="priority-tag priority-' + task.priority + '">' + task.priority + '</span>' +
                assigneeStr + dueStr +
              '</div>';
            container.appendChild(card);
          });
        });
      }

      function escHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

      function handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; var col = e.currentTarget; col.classList.add('drag-over'); }
      function handleDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
      function handleDrop(e, colName) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        if (!draggedId) return;
        updateTaskColumn(draggedId, colName);
      }

      function filterTasks() {
        searchTerm = document.getElementById('searchInput').value.toLowerCase();
        renderBoard();
      }

      function openModal(col, editId) {
        document.getElementById('modalOverlay').classList.add('active');
        if (editId) {
          var task = tasks.find(function(t) { return t.id === editId; });
          if (!task) return;
          document.getElementById('modalTitle').textContent = 'Edit Task';
          document.getElementById('taskId').value = task.id;
          document.getElementById('taskTitleInput').value = task.title;
          document.getElementById('taskDesc').value = task.desc || '';
          document.getElementById('taskPriority').value = task.priority;
          document.getElementById('taskAssignee').value = task.assignee || '';
          document.getElementById('taskDue').value = task.due || '';
          document.getElementById('taskColumn').value = task.column;
          document.getElementById('deleteBtn').style.display = 'block';
        } else {
          document.getElementById('modalTitle').textContent = 'New Task';
          document.getElementById('taskId').value = '';
          document.getElementById('taskTitleInput').value = '';
          document.getElementById('taskDesc').value = '';
          document.getElementById('taskPriority').value = 'medium';
          document.getElementById('taskAssignee').value = '';
          document.getElementById('taskDue').value = '';
          document.getElementById('taskColumn').value = col || 'ideas';
          document.getElementById('deleteBtn').style.display = 'none';
        }
        setTimeout(function() { document.getElementById('taskTitleInput').focus(); }, 100);
      }

      function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); }

      function saveTask() {
        var title = document.getElementById('taskTitleInput').value.trim();
        if (!title) return;
        var id = document.getElementById('taskId').value;
        var data = {
          title: title,
          desc: document.getElementById('taskDesc').value.trim(),
          priority: document.getElementById('taskPriority').value,
          assignee: document.getElementById('taskAssignee').value.trim(),
          due: document.getElementById('taskDue').value,
          column: document.getElementById('taskColumn').value,
        };
        saveTaskToAPI(data, id || null);
        closeModal();
      }

      function deleteTask() {
        var id = document.getElementById('taskId').value;
        if (id) { deleteTaskById(id); closeModal(); }
      }

      function deleteTaskById(id) {
        deleteTaskFromAPI(id);
      }

      // Initial load
      loadTasks();
    </script>
`;

module.exports = kanbanFixScript;
