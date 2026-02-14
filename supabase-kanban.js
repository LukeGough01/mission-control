// Supabase Kanban Integration for Mission Control
// Replaces local JSON storage with cloud database (Vercel-compatible)

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Create table SQL (run once in Supabase SQL editor):
/*
create table tasks (
  id text primary key,
  title text not null,
  description text,
  priority text default 'medium',
  assignee text,
  column text default 'ideas',
  due_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table tasks enable row level security;

-- Allow all operations (adjust for production)
create policy "Allow all operations"
  on tasks
  for all
  using (true)
  with check (true);
*/

async function getTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Transform to match existing format
  return data.map(task => ({
    id: task.id,
    title: task.title,
    desc: task.description || '',
    priority: task.priority,
    assignee: task.assignee || '',
    column: task.column,
    due: task.due_date || '',
    created: new Date(task.created_at).getTime(),
    updated: new Date(task.updated_at).getTime()
  }));
}

async function createTask(task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      id: task.id || 't' + Date.now(),
      title: task.title,
      description: task.desc,
      priority: task.priority || 'medium',
      assignee: task.assignee,
      column: task.column || 'ideas',
      due_date: task.due || null
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    title: data.title,
    desc: data.description || '',
    priority: data.priority,
    assignee: data.assignee || '',
    column: data.column,
    due: data.due_date || '',
    created: new Date(data.created_at).getTime(),
    updated: new Date(data.updated_at).getTime()
  };
}

async function updateTask(id, updates) {
  const updateData = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.desc !== undefined) updateData.description = updates.desc;
  if (updates.priority !== undefined) updateData.priority = updates.priority;
  if (updates.assignee !== undefined) updateData.assignee = updates.assignee;
  if (updates.column !== undefined) updateData.column = updates.column;
  if (updates.due !== undefined) updateData.due_date = updates.due || null;
  updateData.updated_at = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    title: data.title,
    desc: data.description || '',
    priority: data.priority,
    assignee: data.assignee || '',
    column: data.column,
    due: data.due_date || '',
    created: new Date(data.created_at).getTime(),
    updated: new Date(data.updated_at).getTime()
  };
}

async function deleteTask(id) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
