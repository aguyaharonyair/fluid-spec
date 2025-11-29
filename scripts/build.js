#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building TypeScript files...');

// Compile TypeScript
try {
  execSync('npx tsc', { stdio: 'inherit' });
} catch (error) {
  console.error('TypeScript compilation failed');
  process.exit(1);
}

console.log('Creating CJS and ESM variants...');

const distPath = path.join(__dirname, '..', 'dist');

// Function to recursively process all .js files
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js')) {
      // Read the file
      let content = fs.readFileSync(filePath, 'utf8');

      // Remove any existing shebang
      if (content.startsWith('#!')) {
        content = content.replace(/^#!.*\n/, '');
      }

      // For CLI file, add shebang only once
      if (file === 'cli.js') {
        content = '#!/usr/bin/env node\n' + content;
      }

      // Rename to .mjs (ESM format) and .cjs (CommonJS)
      const mjsPath = filePath.replace('.js', '.mjs');
      const cjsPath = filePath.replace('.js', '.cjs');

      // Transform require() calls - handles different quote types and spacing
      const transformRequires = (content, extension) => {
        return content.replace(
          /\brequire\s*\(\s*(['"`])(\.[^'"`]+)\1\s*\)/g,
          (match, quote, modulePath) => {
            if (!modulePath.startsWith('.')) return match;
            return `require(${quote}${modulePath}${extension}${quote})`;
          }
        );
      };

      // For CJS, update require paths to include .cjs extension
      const cjsContent = transformRequires(content, '.cjs');

      // Write MJS (with .mjs extensions for imports)
      const mjsContent = transformRequires(content, '.mjs');

      // Validate transformation if file contains relative imports
      const hasRelativeImports = /\brequire\s*\(\s*(['"`])\.[^'"`]/.test(content);
      if (hasRelativeImports && cjsContent === content) {
        console.warn(`Warning: ${filePath} contains relative imports but transformation may have failed`);
      }

      fs.writeFileSync(mjsPath, mjsContent);
      fs.writeFileSync(cjsPath, cjsContent);

      // Remove original .js file
      fs.unlinkSync(filePath);
    }
  });
}

processDirectory(distPath);

// Make CLI executable
const cliPath = path.join(distPath, 'cli.cjs');
if (fs.existsSync(cliPath)) {
  fs.chmodSync(cliPath, '755');
  console.log('CLI made executable');
}

console.log('Build complete!');
