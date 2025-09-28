#!/usr/bin/env python3
"""
Automated Lint Error Batch Fixer
Systematically fixes common ESLint errors across the frontend codebase
"""

import os
import re
import subprocess
import json
from typing import List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class LintError:
    line: int
    column: int
    message: str
    rule: str
    severity: str

@dataclass
class FileInfo:
    path: str
    errors: List[LintError]
    error_count: int

class LintBatchFixer:
    def __init__(self):
        self.frontend_dir = os.getcwd()
        self.fixed_files = []
        self.total_errors_fixed = 0
        
        # Common unused imports we've identified from manual fixes
        self.common_unused_imports = {
            # Lucide React icons
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
            
            # React/Next.js components  
            'Card', 'CardContent', 'CardDescription', 'CardHeader', 'CardTitle',
            'Alert', 'AlertDescription', 'ScrollArea', 'Progress', 'Skeleton',
            'Tabs', 'TabsContent', 'TabsList', 'TabsTrigger',
            
            # Date-fns functions
            'format', 'formatDistanceToNow', 'subDays', 'subMonths', 'startOfWeek',
            'endOfWeek', 'startOfMonth', 'endOfMonth', 'addDays', 'addMonths',
            
            # React hooks/utilities
            'useMemo', 'useRouter', 'useAuth'
        }

    def run(self):
        """Main execution function"""
        print("🚀 Starting Automated Lint Batch Fixer...\n")
        
        try:
            # Get current lint report
            lint_report = self.get_lint_report()
            print(f"📊 Found {lint_report['total_errors']} lint errors across {lint_report['file_count']} files\n")
            
            # Process files by error count (highest first)
            sorted_files = sorted(lint_report['files'], key=lambda x: x.error_count, reverse=True)
            
            batch_size = 3  # Process 3 files at a time for better control
            batch_count = 0
            
            for i in range(0, len(sorted_files), batch_size):
                batch = sorted_files[i:i + batch_size]
                batch_count += 1
                
                print(f"\n📦 Processing Batch {batch_count} ({len(batch)} files):")
                for file_info in batch:
                    print(f"  - {file_info.path} ({file_info.error_count} errors)")
                
                self.process_batch(batch)
                print(f"✅ Batch {batch_count} completed")
            
            self.print_summary()
            
        except Exception as e:
            print(f"❌ Error during batch processing: {str(e)}")
            raise

    def get_lint_report(self) -> Dict:
        """Get comprehensive lint error report"""
        print("📋 Analyzing current lint errors...")
        
        try:
            # Try npm run lint first
            result = subprocess.run(['npm', 'run', 'lint'], 
                                 capture_output=True, text=True, cwd=self.frontend_dir)
            
            # If npm run lint fails, try npx eslint directly
            if result.returncode != 0 and 'next: not found' in (result.stdout + result.stderr):
                print("📋 npm run lint failed, trying direct ESLint...")
                result = subprocess.run(['npx', 'eslint', '.', '--ext', '.ts,.tsx,.js,.jsx'], 
                                     capture_output=True, text=True, cwd=self.frontend_dir)
            
            output = result.stdout + result.stderr
            return self.parse_lint_output(output)
            
        except Exception as e:
            print(f"Error running lint: {e}")
            return {'total_errors': 0, 'file_count': 0, 'files': []}

    def parse_lint_output(self, output: str) -> Dict:
        """Parse ESLint output to extract file/error information"""
        lines = output.split('\n')
        files = []
        current_file = None
        total_errors = 0

        for line in lines:
            line = line.strip()
            
            # File path line (starts with ./ and doesn't contain Warning/Error)
            if line.startswith('./') and 'Warning:' not in line and 'Error:' not in line:
                if current_file:
                    files.append(current_file)
                
                current_file = FileInfo(
                    path=line,
                    errors=[],
                    error_count=0
                )
            
            # Error/warning line (starts with line:col)
            elif current_file and line and re.match(r'^\d+:\d+\s+', line):
                current_file.error_count += 1
                total_errors += 1
                
                # Parse error details
                match = re.match(r'^(\d+):(\d+)\s+(Warning|Error):\s+(.+?)\s+([@\w/-]+)$', line)
                if match:
                    current_file.errors.append(LintError(
                        line=int(match.group(1)),
                        column=int(match.group(2)),
                        severity=match.group(3),
                        message=match.group(4),
                        rule=match.group(5)
                    ))

        if current_file:
            files.append(current_file)

        return {
            'total_errors': total_errors,
            'file_count': len([f for f in files if f.error_count > 0]),
            'files': [f for f in files if f.error_count > 0]
        }

    def process_batch(self, batch: List[FileInfo]):
        """Process a batch of files"""
        for file_info in batch:
            self.process_file(file_info)

    def process_file(self, file_info: FileInfo):
        """Process individual file"""
        file_path = os.path.join(self.frontend_dir, file_info.path)
        
        if not os.path.exists(file_path):
            print(f"⚠️  File not found: {file_info.path}")
            return

        print(f"🔧 Fixing {file_info.path} ({file_info.error_count} errors)...")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        fixes_applied = 0
        
        # Apply fixes based on error rules
        for error in file_info.errors:
            before_fix = content
            
            if error.rule == '@typescript-eslint/no-unused-vars':
                content = self.fix_unused_variables(content, error)
            elif error.rule == '@typescript-eslint/no-explicit-any':
                content = self.fix_any_types(content, error)
            elif error.rule == 'react/no-unescaped-entities':
                content = self.fix_unescaped_entities(content, error)
            elif error.rule == '@next/next/no-img-element':
                content = self.fix_img_elements(content, error)
            elif error.rule == 'react-hooks/exhaustive-deps':
                content = self.fix_useeffect_deps(content, error)
            elif error.rule == '@typescript-eslint/no-require-imports':
                content = self.fix_require_imports(content, error)
            
            if content != before_fix:
                fixes_applied += 1
        
        # Write fixes back to file
        if fixes_applied > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            self.fixed_files.append({
                'path': file_info.path,
                'fixes_applied': fixes_applied,
                'original_error_count': file_info.error_count
            })
            self.total_errors_fixed += fixes_applied
            print(f"  ✅ Applied {fixes_applied} fixes to {os.path.basename(file_info.path)}")
        else:
            print(f"  ➡️  No automatic fixes available for {os.path.basename(file_info.path)}")

    def fix_unused_variables(self, content: str, error: LintError) -> str:
        """Fix unused variables and imports"""
        lines = content.split('\n')
        line_index = error.line - 1
        
        if line_index >= len(lines):
            return content
        
        line = lines[line_index]
        
        # Extract unused variable name from error message
        match = re.search(r"'([^']+)' is (defined but never used|assigned a value but never used)", error.message)
        if not match:
            return content
        
        unused_name = match.group(1)
        
        # Handle import statements
        if 'import' in line and '{' in line and '}' in line:
            updated_line = self.remove_from_destructured_import(line, unused_name)
            if updated_line != line:
                if updated_line.strip() == '' or 'REMOVE_LINE' in updated_line:
                    lines.pop(line_index)
                else:
                    lines[line_index] = updated_line
                return '\n'.join(lines)
        
        # Handle variable declarations with destructuring
        if ('const' in line or 'let' in line) and '{' in line and '}' in line:
            updated_line = self.remove_from_destructuring(line, unused_name)
            if updated_line != line:
                if updated_line.strip() == '' or 'REMOVE_LINE' in updated_line:
                    lines.pop(line_index)
                else:
                    lines[line_index] = updated_line
                return '\n'.join(lines)
        
        # Handle simple variable declarations
        if line.strip().startswith(f'const {unused_name}') or \
           line.strip().startswith(f'let {unused_name}') or \
           line.strip().startswith(f'var {unused_name}'):
            lines.pop(line_index)
            return '\n'.join(lines)
        
        return content

    def remove_from_destructured_import(self, line: str, unused_import: str) -> str:
        """Remove unused import from destructured import statement"""
        # Pattern to match the import in various positions
        patterns = [
            rf'\s*{unused_import}\s*,\s*',  # Middle: IconA, IconB, IconC -> IconA, IconC
            rf'\s*,\s*{unused_import}\s*',  # End: IconA, IconB -> IconA
            rf'{{\s*{unused_import}\s*}}',  # Only: { IconA } -> remove whole line
            rf'\s*{unused_import}\s*'       # Generic fallback
        ]
        
        for pattern in patterns:
            if re.search(pattern, line):
                result = re.sub(pattern, '', line)
                
                # Clean up double commas and spacing
                result = re.sub(r',\s*,', ',', result)
                result = re.sub(r'{\s*,', '{', result)
                result = re.sub(r',\s*}', '}', result)
                result = re.sub(r'{\s*}', '{}', result)
                
                # If empty braces, mark for removal
                if '{}' in result:
                    return 'REMOVE_LINE'
                
                return result
        
        return line

    def remove_from_destructuring(self, line: str, unused_var: str) -> str:
        """Remove unused variable from destructuring assignment"""
        return self.remove_from_destructured_import(line, unused_var)  # Same logic

    def fix_any_types(self, content: str, error: LintError) -> str:
        """Fix TypeScript any types"""
        lines = content.split('\n')
        line_index = error.line - 1
        
        if line_index >= len(lines):
            return content
        
        line = lines[line_index]
        
        # Common replacements
        replacements = [
            (r': any\b', ': unknown'),
            (r' as any\b', ' as Record<string, unknown>'),
            (r'\(any\)', '(unknown)'),
            (r'<any>', '<Record<string, unknown>>'),
            (r'any\[\]', 'unknown[]'),
            (r'Array<any>', 'Array<unknown>'),
        ]
        
        for pattern, replacement in replacements:
            new_line = re.sub(pattern, replacement, line)
            if new_line != line:
                lines[line_index] = new_line
                return '\n'.join(lines)
        
        return content

    def fix_unescaped_entities(self, content: str, error: LintError) -> str:
        """Fix unescaped entities in JSX"""
        lines = content.split('\n')
        line_index = error.line - 1
        
        if line_index >= len(lines):
            return content
        
        line = lines[line_index]
        
        # Entity replacements
        replacements = [
            ("'", "&apos;"),
            ('"', "&quot;"),
            ('&', "&amp;"),
            ('<', "&lt;"),
            ('>', "&gt;")
        ]
        
        # Only replace in JSX text content (simple heuristic)
        if '>' in line and '<' in line:
            for char, entity in replacements:
                if char in line:
                    # Simple replacement - more sophisticated JSX parsing would be better
                    line = line.replace(char, entity)
                    break
        
        lines[line_index] = line
        return '\n'.join(lines)

    def fix_img_elements(self, content: str, error: LintError) -> str:
        """Fix img elements by replacing with Next.js Image"""
        # Add Image import if not present
        if 'import Image from "next/image"' not in content:
            # Find first import line and add after it
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if line.startswith('import '):
                    lines.insert(i + 1, 'import Image from "next/image"')
                    content = '\n'.join(lines)
                    break
        
        # Replace img tags with Image components (simplified)
        img_pattern = r'<img\s+([^>]+)>'
        
        def replace_img(match):
            attrs = match.group(1)
            
            # Extract key attributes
            src_match = re.search(r'src=["\'](.*?)["\']', attrs)
            alt_match = re.search(r'alt=["\'](.*?)["\']', attrs)
            class_match = re.search(r'className=["\'](.*?)["\']', attrs)
            
            if src_match:
                result = f'<Image\n              src="{src_match.group(1)}"'
                if alt_match:
                    result += f'\n              alt="{alt_match.group(1)}"'
                result += '\n              fill'
                if class_match:
                    result += f'\n              className="{class_match.group(1)}"'
                result += '\n            />'
                return result
            
            return match.group(0)
        
        return re.sub(img_pattern, replace_img, content)

    def fix_useeffect_deps(self, content: str, error: LintError) -> str:
        """Fix useEffect dependency issues (simplified)"""
        # Add useCallback import if message mentions it
        if 'useCallback' in error.message and 'import { useCallback }' not in content:
            # Add useCallback to React imports
            react_import_pattern = r"import { ([^}]+) } from ['\"]react['\"]"
            match = re.search(react_import_pattern, content)
            if match:
                imports = match.group(1)
                if 'useCallback' not in imports:
                    new_imports = imports + ', useCallback'
                    content = re.sub(react_import_pattern, 
                                   f'import {{ {new_imports} }} from "react"', content)
        
        return content

    def fix_require_imports(self, content: str, error: LintError) -> str:
        """Fix require-style imports"""
        lines = content.split('\n')
        line_index = error.line - 1
        
        if line_index >= len(lines):
            return content
        
        line = lines[line_index]
        
        # Convert require to import
        require_pattern = r"const\s+(\w+)\s*=\s*require\(['\"](.*?)['\"]\)"
        match = re.search(require_pattern, line)
        
        if match:
            var_name = match.group(1)
            module_path = match.group(2)
            new_line = f'import {var_name} from "{module_path}"'
            lines[line_index] = new_line
            return '\n'.join(lines)
        
        return content

    def print_summary(self):
        """Print summary of fixes applied"""
        print('\n' + '='*60)
        print('📊 LINT BATCH FIXER SUMMARY')
        print('='*60)
        print(f"✅ Files processed: {len(self.fixed_files)}")
        print(f"🔧 Total errors fixed: {self.total_errors_fixed}")
        print("\nFiles fixed:")
        
        for file_info in self.fixed_files:
            print(f"  • {file_info['path']}: {file_info['fixes_applied']}/{file_info['original_error_count']} errors fixed")
        
        if self.fixed_files:
            print('\n🚀 Run `npm run lint` to see remaining errors')
            print('💡 Manual fixes may be needed for complex dependency or type issues')
        else:
            print('\n⚠️  No automatic fixes could be applied')
            print('💡 Manual intervention may be required for complex errors')

if __name__ == '__main__':
    fixer = LintBatchFixer()
    fixer.run()