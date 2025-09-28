#!/usr/bin/env python3
"""
PRECISION SYNTAX FIXER - Fix specific remaining parsing errors
"""

import os
import re
import sys

class PrecisionSyntaxFixer:
    def __init__(self):
        self.fixes_applied = 0
        self.files_fixed = 0

    def fix_file_content(self, content: str) -> str:
        """Apply precise syntax fixes"""
        
        # Fix specific problematic patterns
        
        # Pattern: if (condition) {} \n statement \n }
        lines = content.split('\n')
        fixed_lines = []
        
        i = 0
        while i < len(lines):
            line = lines[i]
            
            # Fix pattern: if (...) {} followed by statements and }
            if re.match(r'\s*if\s*\([^)]+\)\s*\{\}', line) and i + 2 < len(lines):
                # Check if next lines are indented statements followed by }
                next_line = lines[i + 1].strip()
                closing_line = lines[i + 2].strip() if i + 2 < len(lines) else ""
                
                if next_line and closing_line == '}' and not next_line.startswith('}'):
                    # Fix the pattern
                    fixed_lines.append(line.replace('{}', '{'))
                    fixed_lines.append(lines[i + 1])
                    fixed_lines.append(lines[i + 2])
                    i += 3
                    continue
            
            # Fix function definitions that got mangled
            if re.match(r'\s*const\s+\w+\s*=\s*useCallback\(async\s*\(\)\s*=>\s*\{', line):
                # This is correct, keep as is
                fixed_lines.append(line)
            elif re.match(r'\s*const\s+\w+\s*=\s*useCallback\(async\s*\(\)\s*=>\s*\{\}', line):
                # Fix this pattern
                fixed_lines.append(line.replace('{}', '{'))
            else:
                fixed_lines.append(line)
            
            i += 1
        
        content = '\n'.join(fixed_lines)
        
        # Additional pattern fixes
        fixes = [
            # Fix incomplete try-catch
            (r'try\s*\{\s*\n\s*([^}]+)\s*\n\s*\}\s*catch\s*\{\}', r'try {\n\1\n} catch (error) {\n  // Handle error\n}'),
            
            # Fix incomplete if blocks
            (r'if\s*\(([^)]+)\)\s*\{\}\s*\n(\s+[^}][^\n]+)\n(\s*\})', r'if (\1) {\n\2\n\3'),
            
            # Fix array/object checks
            (r'if\s*\(Array\.isArray\([^)]+\)\)\s*\{\}\s*\n(\s+[^}][^\n]+)\n(\s*\})', r'if (Array.isArray(\1)) {\n\2\n\3'),
            
            # Fix function calls in conditions
            (r'if\s*\(([^)]+)\)\s*\{\}\s*\n(\s+[^}]+)\n(\s*\})', r'if (\1) {\n\2\n\3'),
        ]
        
        for pattern, replacement in fixes:
            content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)
        
        # Fix specific syntax errors
        content = re.sub(r'(\w+)\s*\{\}\s*\n(\s+)([^}][^\n]+)\n(\s*\})', r'\1 {\n\2\3\n\4}', content)
        
        return content

    def fix_file(self, file_path: str) -> int:
        """Fix a single file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                original_content = f.read()
        except:
            return 0

        fixed_content = self.fix_file_content(original_content)
        
        if fixed_content != original_content:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(fixed_content)
                
                self.fixes_applied += 1
                self.files_fixed += 1
                
                print(f"✅ {os.path.basename(file_path)}: precise syntax fixes applied")
                return 1
            except:
                return 0
        
        return 0

    def process_directory(self, directory: str):
        """Process all TypeScript/React files"""
        for root, dirs, files in os.walk(directory):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git']]
            
            for file in files:
                if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
                    file_path = os.path.join(root, file)
                    self.fix_file(file_path)

def main():
    print("🎯 PRECISION SYNTAX FIXER")
    print("="*40)
    
    fixer = PrecisionSyntaxFixer()
    fixer.process_directory('.')
    
    print(f"\n📊 Results: {fixer.files_fixed} files fixed")

if __name__ == '__main__':
    main()