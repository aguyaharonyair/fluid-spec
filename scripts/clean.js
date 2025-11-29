#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');

console.log('Cleaning dist directory...');

if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
  console.log('  Removed dist/');
} else {
  console.log('  dist/ does not exist (already clean)');
}

console.log('Clean complete.');
