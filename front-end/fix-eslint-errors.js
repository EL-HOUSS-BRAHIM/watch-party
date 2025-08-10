#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript and TSX files
function findFiles(dir, extensions = ['.tsx', '.ts']) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // Skip node_modules and .next directories
      if (!file.startsWith('.') && file !== 'node_modules') {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });

  return results;
}

// Function to fix common ESLint errors
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Fix unescaped entities
    const entityReplacements = [
      { from: /([^&])'([^s])/g, to: '$1&apos;$2' },
      { from: /([^&])"([^s])/g, to: '$1&quot;$2' },
      { from: /\s'/g, to: ' &apos;' },
      { from: /\s"/g, to: ' &quot;' },
      { from: /^'/g, to: '&apos;' },
      { from: /^"/g, to: '&quot;' }
    ];

    entityReplacements.forEach(replacement => {
      const newContent = content.replace(replacement.from, replacement.to);
      if (newContent !== content) {
        content = newContent;
        changed = true;
      }
    });

    // 2. Replace 'any' types with proper types
    const anyReplacements = [
      { from: /: any\[\]/g, to: ': unknown[]' },
      { from: /: any\s*=/g, to: ': unknown =' },
      { from: /: any\s*\)/g, to: ': unknown)' },
      { from: /: any\s*,/g, to: ': unknown,' },
      { from: /: any\s*;/g, to: ': unknown;' },
      { from: /: any\s*\|/g, to: ': unknown |' },
      { from: /\| any\s/g, to: '| unknown ' },
      { from: /<any>/g, to: '<unknown>' },
      { from: /\(.*?\): any\s*=>/g, to: '(params: unknown): unknown =>' },
      { from: /Function/g, to: '(...args: unknown[]) => unknown' }
    ];

    anyReplacements.forEach(replacement => {
      const newContent = content.replace(replacement.from, replacement.to);
      if (newContent !== content) {
        content = newContent;
        changed = true;
      }
    });

    // 3. Fix require imports
    const requireMatches = content.match(/const\s+\w+\s*=\s*require\(['"]([^'"]+)['"]\)/g);
    if (requireMatches) {
      requireMatches.forEach(match => {
        const importMatch = match.match(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/);
        if (importMatch) {
          const varName = importMatch[1];
          const modulePath = importMatch[2];
          const newImport = `import ${varName} from '${modulePath}'`;
          content = content.replace(match, newImport);
          changed = true;
        }
      });
    }

    // 4. Fix 'let' that should be 'const'
    const letConstRegex = /let\s+(\w+)\s*=\s*([^;]+);[\s\S]*?(?=let\s+\w+|const\s+\w+|function|class|export|$)/g;
    content = content.replace(letConstRegex, (match, varName, value) => {
      // Simple heuristic: if the variable is not reassigned in the same block, change to const
      const reassignmentRegex = new RegExp(`\\b${varName}\\s*=`, 'g');
      const assignments = match.match(reassignmentRegex);
      if (assignments && assignments.length === 1) {
        changed = true;
        return match.replace(/let\s+/, 'const ');
      }
      return match;
    });

    // 5. Remove unused imports (basic detection)
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
    importLines.forEach(line => {
      const importMatch = line.match(/import\s*{\s*([^}]+)\s*}\s*from/);
      if (importMatch) {
        const imports = importMatch[1].split(',').map(i => i.trim());
        const usedImports = imports.filter(imp => {
          const importName = imp.split(' as ')[0].trim();
          const regex = new RegExp(`\\b${importName}\\b`, 'g');
          const matches = content.match(regex);
          return matches && matches.length > 1; // More than just the import line
        });
        
        if (usedImports.length !== imports.length && usedImports.length > 0) {
          const newImportLine = line.replace(importMatch[1], usedImports.join(', '));
          content = content.replace(line, newImportLine);
          changed = true;
        } else if (usedImports.length === 0) {
          content = content.replace(line + '\n', '');
          changed = true;
        }
      }
    });

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('Starting ESLint error fixes...');

const projectRoot = process.cwd();
const files = findFiles(projectRoot);

let fixedCount = 0;
files.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} files out of ${files.length} total files.`);
console.log('Done! Run "npm run lint" to check remaining issues.');
