#!/usr/bin/env node
/**
 * Migrate existing Kanban tasks to Supabase
 * Run once after setting up Supabase credentials
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const TASKS_FILE = path.join(__dirname, 'data/tasks.json');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env');
  console.error('   Add SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
  console.log('🚀 Starting migration to Supabase...\n');
  
  // Load existing tasks
  let tasks = [];
  if (fs.existsSync(TASKS_FILE)) {
    tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
    console.log(`📋 Found ${tasks.length} tasks to migrate\n`);
  } else {
    console.log('📋 No existing tasks found\n');
    return;
  }
  
  // Migrate each task
  let migrated = 0;
  let failed = 0;
  
  for (const task of tasks) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          id: task.id,
          title: task.title,
          description: task.desc || null,
          priority: task.priority,
          assignee: task.assignee || null,
          column: task.column,
          due_date: task.due || null,
          created_at: new Date(task.created).toISOString(),
          updated_at: new Date(task.updated || task.created).toISOString()
        }]);
      
      if (error) throw error;
      
      console.log(`✅ ${task.title}`);
      migrated++;
    } catch (error) {
      console.error(`❌ ${task.title}: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Migration complete:`);
  console.log(`   ✅ Migrated: ${migrated}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Total: ${tasks.length}`);
  
  if (migrated > 0) {
    // Backup original file
    const backupFile = TASKS_FILE + '.backup';
    fs.copyFileSync(TASKS_FILE, backupFile);
    console.log(`\n💾 Original tasks backed up to: ${backupFile}`);
    console.log(`   (Safe to delete data/tasks.json after verifying)`);
  }
}

migrate().catch(error => {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
});
