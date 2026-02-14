// Memory/Brain API Routes (Supabase version - Vercel compatible)
// Replace filesystem-based routes in app.js with these

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nmcrghqldrhgmjmceylf.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_TfHw6Hx5vaupkcgsFUN5ZA_Ty3_X2R8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper: Format date for relative display
function getRelativeDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return 'Last week';
  return null; // Will group by month
}

// GET /api/memory/list - List all documents
async function getMemoryList(req, res) {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform to frontend format
    const files = data.map(doc => ({
      filename: doc.path,
      type: doc.type,
      date: doc.type === 'memory' ? doc.filename.replace('.md', '') : null,
      size: doc.size,
      modified: doc.updated_at,
      label: doc.type === 'long-term' ? 'Long-Term Memory' : doc.filename.replace('.md', ''),
      relative: getRelativeDate(doc.updated_at),
      category: doc.category
    }));
    
    // Group files for sidebar
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: {}
    };
    
    files.forEach(file => {
      if (file.type !== 'memory') return; // Only group daily memory files
      
      const rel = file.relative;
      if (rel === 'Today') groups.today.push(file);
      else if (rel === 'Yesterday') groups.yesterday.push(file);
      else if (rel && rel.includes('days ago')) groups.thisWeek.push(file);
      else if (rel === 'Last week') groups.thisMonth.push(file);
      else {
        // Group by month
        const date = new Date(file.modified);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!groups.older[monthKey]) groups.older[monthKey] = [];
        groups.older[monthKey].push(file);
      }
    });
    
    // Get brain categories
    const brainFiles = files.filter(f => f.type === 'brain');
    const brainCategories = [...new Set(brainFiles.map(f => f.category))].filter(Boolean);
    
    res.json({
      total: files.length,
      files,
      groups,
      brainCategories
    });
  } catch (error) {
    console.error('Error fetching memory list:', error);
    res.status(500).json({ error: 'Failed to fetch memory list' });
  }
}

// GET /api/memory/read/:filename - Read document content
async function readMemoryDocument(req, res) {
  try {
    const filename = decodeURIComponent(req.params.filename);
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('path', filename)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Document not found' });
      }
      throw error;
    }
    
    res.json({
      content: data.content,
      size: data.size,
      modified: data.updated_at
    });
  } catch (error) {
    console.error('Error reading document:', error);
    res.status(500).json({ error: 'Failed to read document' });
  }
}

// POST /api/memory/append - Append to document (future feature)
async function appendToDocument(req, res) {
  try {
    const { filename, content } = req.body;
    
    // Fetch existing document
    const { data: existing, error: fetchError } = await supabase
      .from('documents')
      .select('content')
      .eq('path', filename)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    
    // Append new content
    const newContent = existing 
      ? existing.content + '\n\n' + content
      : content;
    
    // Update or insert
    const { error: upsertError } = await supabase
      .from('documents')
      .upsert({
        id: filename.replace(/\//g, '_').replace('.md', ''),
        path: filename,
        content: newContent,
        type: filename.includes('memory/') ? 'memory' : 'brain',
        filename: filename.split('/').pop(),
        size: newContent.length,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    
    if (upsertError) throw upsertError;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error appending to document:', error);
    res.status(500).json({ error: 'Failed to append content' });
  }
}

// Export route handlers
module.exports = {
  getMemoryList,
  readMemoryDocument,
  appendToDocument
};

// Usage in app.js:
// const memoryAPI = require('./memory-api-supabase');
// app.get('/api/memory/list', memoryAPI.getMemoryList);
// app.get('/api/memory/read/:filename', memoryAPI.readMemoryDocument);
// app.post('/api/memory/append', memoryAPI.appendToDocument);
