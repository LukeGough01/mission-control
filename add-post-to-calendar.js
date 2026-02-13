// Quick script to add the post to Mission Control localStorage-based calendar
// This creates a JSON file that can be imported
const fs = require('fs');

const newPost = {
  id: 'post-' + Date.now(),
  date: '2026-02-13',
  type: 'LinkedIn Post',
  title: '5 interview mistakes that KILL your chances',
  status: 'Published',
  platform: 'LinkedIn',
  url: 'https://www.linkedin.com/feed/update/urn:li:activity:7427892385709281280/',
  notes: 'List format: 5 interview mistakes. Posted 11:53 AM AEST.',
  color: '#0A66C2' // LinkedIn blue
};

console.log('Content item for Mission Control:');
console.log(JSON.stringify(newPost, null, 2));

// Save to tracking file
const trackingFile = '/home/luke/.openclaw/workspace/content/published-posts.json';
let posts = [];
try {
  posts = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));
} catch (e) {
  // File doesn't exist yet
}
posts.push(newPost);
fs.writeFileSync(trackingFile, JSON.stringify(posts, null, 2));

console.log('\n✅ Added to published posts tracking file');
