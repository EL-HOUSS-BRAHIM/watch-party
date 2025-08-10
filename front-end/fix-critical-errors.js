const fs = require('fs');
const path = require('path');

// Critical errors to fix
const fixes = [
  // Fix unescaped entities
  {
    pattern: /([^&])'/g,
    replacement: '$1&apos;',
    description: 'Fix unescaped single quotes'
  },
  {
    pattern: /([^&])"/g,
    replacement: '$1&quot;',
    description: 'Fix unescaped double quotes'
  },
  {
    pattern: /\s'/g,
    replacement: ' &apos;',
    description: 'Fix unescaped quotes after spaces'
  },
  {
    pattern: /\s"/g,
    replacement: ' &quot;',
    description: 'Fix unescaped double quotes after spaces'
  },
  // Fix any types
  {
    pattern: /: any\b/g,
    replacement: ': unknown',
    description: 'Replace any with unknown'
  },
  {
    pattern: /<any>/g,
    replacement: '<unknown>',
    description: 'Replace generic any with unknown'
  },
  {
    pattern: /\bFunction\b/g,
    replacement: '(...args: unknown[]) => unknown',
    description: 'Replace Function type'
  }
];

// Files to process
const filesToFix = [
  'app/dashboard/quality/page.tsx',
  'components/social/enhanced-friend-search.tsx',
  'components/social/friend-requests-management.tsx',
  'components/social/friend-requests.tsx',
  'components/social/friends-manager.tsx',
  'components/store/store-rewards.tsx',
  'components/videos/video-management.tsx',
  'components/ui/command-palette.tsx',
  'components/ui/error-boundary.tsx',
  'components/video/video-upload.tsx'
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Apply fixes
  fixes.forEach(fix => {
    const newContent = content.replace(fix.pattern, fix.replacement);
    if (newContent !== content) {
      content = newContent;
      changed = true;
      console.log(`Applied: ${fix.description} in ${filePath}`);
    }
  });

  // Specific fixes for known patterns
  
  // Fix Don't, Can't, Won't etc.
  content = content.replace(/Don't/g, 'Don&apos;t');
  content = content.replace(/Can't/g, 'Can&apos;t');
  content = content.replace(/Won't/g, 'Won&apos;t');
  content = content.replace(/I'm/g, 'I&apos;m');
  content = content.replace(/You're/g, 'You&apos;re');
  content = content.replace(/We're/g, 'We&apos;re');
  content = content.replace(/They're/g, 'They&apos;re');
  content = content.replace(/It's/g, 'It&apos;s');
  content = content.replace(/That's/g, 'That&apos;s');
  content = content.replace(/There's/g, 'There&apos;s');

  // Remove unused imports (simple patterns)
  content = content.replace(/,?\s*Users\s*,?/g, ',');
  content = content.replace(/,?\s*AlertTriangle\s*,?/g, ',');
  content = content.replace(/,?\s*Volume2\s*,?/g, ',');
  content = content.replace(/,?\s*VolumeX\s*,?/g, ',');
  content = content.replace(/,?\s*Undo\s*,?/g, ',');
  content = content.replace(/,?\s*Filter\s*,?/g, ',');

  // Clean up double commas
  content = content.replace(/,,+/g, ',');
  content = content.replace(/,\s*}/g, '}');
  content = content.replace(/{\s*,/g, '{');

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }

  return false;
}

// Process files
console.log('Starting critical ESLint fixes...');
let fixedCount = 0;

filesToFix.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} files.`);
console.log('Critical fixes complete!');
