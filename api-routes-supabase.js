// Mission Control API Routes with Supabase (Vercel-compatible)
// Add these routes to app.js

const supabaseKanban = require('./supabase-kanban');

// GET /api/tasks - List all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await supabaseKanban.getTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks - Create new task
app.post('/api/tasks', async (req, res) => {
  try {
    const newTask = {
      id: 't' + Date.now(),
      title: req.body.title || 'Untitled',
      desc: req.body.desc || '',
      priority: req.body.priority || 'medium',
      assignee: req.body.assignee || '',
      column: req.body.column || 'ideas',
      due: req.body.due || ''
    };
    
    const task = await supabaseKanban.createTask(newTask);
    res.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /api/tasks/:id - Update task
app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.desc !== undefined) updates.desc = req.body.desc;
    if (req.body.priority !== undefined) updates.priority = req.body.priority;
    if (req.body.assignee !== undefined) updates.assignee = req.body.assignee;
    if (req.body.column !== undefined) updates.column = req.body.column;
    if (req.body.due !== undefined) updates.due = req.body.due;
    
    const task = await supabaseKanban.updateTask(req.params.id, updates);
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(404).json({ error: 'Task not found' });
  }
});

// DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await supabaseKanban.deleteTask(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(404).json({ error: 'Task not found' });
  }
});
