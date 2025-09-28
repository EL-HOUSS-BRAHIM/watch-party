#!/usr/bin/env python3
"""
Quick Lint Fixer - Simplified version for immediate use
Fixes common patterns based on our manual analysis
"""

import os
import re
import sys
from pathlib import Path

class QuickLintFixer:
    def __init__(self):
        self.fixes_applied = 0
        self.common_unused_imports = {
            'TrendingUp', 'TrendingDown', 'ArrowUp', 'ArrowDown', 'Eye', 'EyeOff',
            'Filter', 'Search', 'Calendar', 'Clock', 'Settings', 'MoreHorizontal', 
            'ChevronDown', 'ChevronRight', 'Plus', 'Edit', 'Trash2', 'Archive',
            'Download', 'Upload', 'Share2', 'Flag', 'Tag', 'Info', 'AlertTriangle',
            'CheckCircle', 'X', 'Heart', 'Star', 'Gift', 'Crown', 'Shield',
            'Video', 'Music', 'Camera', 'Mic', 'Volume2', 'Play', 'Pause',
            'Coffee', 'Mountain', 'Rocket', 'Snowflake', 'Sun', 'Moon', 'Leaf',
            'Gamepad2', 'Award', 'Target', 'Zap', 'Globe', 'Lock', 'Mail', 'Phone',
            'User', 'Users', 'UserPlus', 'BookOpen', 'FileText', 'Image', 'Paperclip',
            'RefreshCw', 'RotateCcw', 'Sparkles', 'Flame', 'Diamond', 'Gem',
            'Card', 'CardContent', 'CardDescription', 'CardHeader', 'CardTitle',
            'Alert', 'AlertDescription', 'ScrollArea', 'Progress', 'Skeleton',
            'format', 'formatDistanceToNow', 'subDays', 'subMonths', 'startOfWeek',
            'endOfWeek', 'startOfMonth', 'endOfMonth', 'addDays', 'addMonths',
            'useMemo', 'useRouter', 'useAuth'
        }

    def fix_file(self, file_path: str) -> int:
        """Fix a single file and return number of fixes applied"""
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            return 0

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        
        # Apply various fixes
        content = self.fix_unused_imports(content)
        content = self.fix_any_types(content)
        content = self.fix_unescaped_entities(content)
        content = self.fix_img_elements(content)
        content = self.add_missing_imports(content)
        
        if content != original_content:
            # Count lines changed as rough measure of fixes
            original_lines = original_content.split('\n')
            new_lines = content.split('\n')
            
            changes = 0
            for i, (old, new) in enumerate(zip(original_lines, new_lines)):
                if old != new:
                    changes += 1
            
            # Add any line count difference
            changes += abs(len(original_lines) - len(new_lines))
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ {os.path.basename(file_path)}: {changes} changes applied")
            return changes
        else:
            print(f"➡️  {os.path.basename(file_path)}: No changes needed")
            return 0

    def fix_unused_imports(self, content: str) -> str:
        """Remove unused imports based on common patterns"""
        lines = content.split('\n')
        
        for i, line in enumerate(lines):
            if 'import {' in line and 'from' in line:
                # Extract the imports between braces
                match = re.search(r'import\s*{\s*([^}]+)\s*}\s*from', line)
                if match:
                    imports = match.group(1)
                    imports_list = [imp.strip() for imp in imports.split(',')]
                    
                    # Filter out unused imports
                    used_imports = []
                    for imp in imports_list:
                        if imp not in self.common_unused_imports:
                            used_imports.append(imp)
                        else:
                            # Double-check by searching for usage in file
                            if f'<{imp}' in content or f'{imp}(' in content or f'{imp}.' in content:
                                used_imports.append(imp)
                    
                    # Rebuild the import line
                    if len(used_imports) != len(imports_list):
                        if used_imports:
                            new_imports = ', '.join(used_imports)
                            lines[i] = re.sub(r'{\s*[^}]+\s*}', f'{{ {new_imports} }}', line)
                        else:
                            # Remove entire line if no imports left
                            lines[i] = ''
        
        # Remove empty lines where imports were removed
        content = '\n'.join(line for line in lines if line.strip() or not line.startswith('import'))
        
        return content

    def fix_any_types(self, content: str) -> str:
        """Replace any types with better alternatives"""
        replacements = [
            (r': any\b', ': unknown'),
            (r' as any\b', ' as Record<string, unknown>'),
            (r'\(any\)', '(unknown)'),
            (r'<any>', '<Record<string, unknown>>'),
            (r'any\[\]', 'unknown[]'),
            (r'Array<any>', 'Array<unknown>'),
            (r'error: any\b', 'error: unknown'),
        ]
        
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
        
        return content

    def fix_unescaped_entities(self, content: str) -> str:
        """Fix unescaped entities in JSX"""
        # Simple replacement in strings that look like JSX content
        content = re.sub(r"([>].*?)'([^<]*[<])", r"\1&apos;\2", content)
        content = re.sub(r'([>].*?)"([^<]*[<])', r'\1&quot;\2', content)
        
        return content

    def fix_img_elements(self, content: str) -> str:
        """Replace img with Next.js Image"""
        # Add Image import if not present
        if '<img' in content and 'import Image from "next/image"' not in content:
            # Find the first import and add after it
            first_import = content.find('import')
            if first_import != -1:
                first_import_end = content.find('\n', first_import) + 1
                content = content[:first_import_end] + 'import Image from "next/image"\n' + content[first_import_end:]

        # Replace simple img patterns  
        content = re.sub(
            r'<img\s+src="([^"]+)"\s+alt="([^"]+)"\s+className="([^"]+)"\s*/>',
            r'<Image\n              src="\1"\n              alt="\2"\n              fill\n              className="\3"\n            />',
            content
        )
        
        return content

    def add_missing_imports(self, content: str) -> str:
        """Add missing imports based on usage"""
        lines = content.split('\n')
        
        # Check if useCallback is used but not imported
        if 'useCallback(' in content:
            for i, line in enumerate(lines):
                if 'import {' in line and 'from "react"' in line:
                    if 'useCallback' not in line:
                        # Add useCallback to React imports
                        line = line.replace('}', ', useCallback }')
                        lines[i] = line
                        break
        
        return '\n'.join(lines)

    def process_directory(self, directory: str):
        """Process all tsx/ts files in a directory"""
        directory = Path(directory)
        
        # Find all TypeScript/React files
        patterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']
        files = []
        
        for pattern in patterns:
            files.extend(directory.rglob(pattern))
        
        # Filter out node_modules and other exclusions
        files = [f for f in files if 'node_modules' not in str(f) and '.next' not in str(f)]
        
        print(f"🔍 Found {len(files)} files to process")
        
        total_fixes = 0
        processed_files = 0
        
        for file_path in sorted(files):
            fixes = self.fix_file(str(file_path))
            if fixes > 0:
                total_fixes += fixes
                processed_files += 1
        
        print(f"\n📊 Summary:")
        print(f"✅ Files with changes: {processed_files}")
        print(f"🔧 Total changes applied: {total_fixes}")

if __name__ == '__main__':
    fixer = QuickLintFixer()
    
    if len(sys.argv) > 1:
        # Process specific file or directory
        target = sys.argv[1]
        if os.path.isfile(target):
            fixer.fix_file(target)
        elif os.path.isdir(target):
            fixer.process_directory(target)
        else:
            print(f"❌ {target} is not a valid file or directory")
    else:
        # Process current directory
        fixer.process_directory('.')