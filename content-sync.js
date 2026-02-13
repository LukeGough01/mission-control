// Content Sync System for Mission Control
// This creates a backend store that syncs with frontend localStorage

const fs = require('fs');
const path = require('path');

const CONTENT_FILE = path.join(__dirname, 'content-items.json');

class ContentStore {
  constructor() {
    this.items = this.load();
  }

  load() {
    try {
      return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
    } catch (e) {
      return [];
    }
  }

  save() {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(this.items, null, 2));
  }

  add(item) {
    const newItem = {
      id: 'c' + Date.now() + Math.random().toString(36).substr(2, 5),
      title: item.title,
      type: item.type || 'video',
      status: item.status || 'published',
      date: item.date || new Date().toISOString().split('T')[0],
      notes: item.notes || '',
      tags: item.tags || item.platform || '',
      url: item.url || '',
      created: Date.now()
    };
    this.items.push(newItem);
    this.save();
    return newItem;
  }

  getAll() {
    return this.items;
  }

  getRecent(days = 7) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return this.items.filter(i => i.created >= cutoff);
  }
}

module.exports = ContentStore;
