#!/usr/bin/env python3
"""
PARSING ERROR FIXER - Fix specific syntax issues caused by previous script
"""

import os
import re
import sys

class ParsingErrorFixer:
    def __init__(self):
        self.fixes_applied = 0
        self.files_fixed = 0

    def fix_file(self, file_path: str) -> int:
        """Fix parsing errors in a file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            return 0

        original_content = content
        
        # Fix common parsing issues caused by previous script
        
        # Fix function bodies that got mangled
        content = re.sub(r'async \(\) => \{\}', r'async () => {', content)
        content = re.sub(r'= useCallback\(async \(\) => \{\}', r'= useCallback(async () => {', content)
        content = re.sub(r'function \w+\(\) \{\}', lambda m: m.group(0).replace('{}', '{'), content)
        
        # Fix try-catch blocks
        content = re.sub(r'try \{\}', r'try {', content)
        content = re.sub(r'catch \{\}', r'} catch {', content)
        content = re.sub(r'\} catch \{\}', r'} catch {', content)
        
        # Fix if statements
        content = re.sub(r'if \([^)]+\) \{\}', lambda m: m.group(0).replace('{}', '{'), content)
        
        # Fix object/array literals that got mangled
        content = re.sub(r'= \{\}\s*([a-zA-Z])', r'= { \1', content)
        content = re.sub(r'return \{\}', r'return {', content)
        
        # Fix JSX component definitions
        content = re.sub(r'export default function \w+\(\) \{\}', 
                         lambda m: m.group(0).replace('{}', '{'), content)
        
        # Fix incomplete function calls and definitions
        lines = content.split('\n')
        for i, line in enumerate(lines):
            # Fix incomplete functions
            if ') => {}' in line and not line.strip().endswith('{}'):
                lines[i] = line.replace('{}', '{')
            
            # Fix incomplete if/for/while statements
            if re.match(r'\s*(if|for|while|switch)\s*\([^)]*\)\s*\{\}', line):
                lines[i] = line.replace('{}', '{')
            
            # Fix incomplete try blocks
            if 'try {}' in line:
                lines[i] = line.replace('try {}', 'try {')
            
            # Fix empty export
            if line.strip() == 'export default function Loading() {}':
                lines[i] = 'export default function Loading() {'
        
        content = '\n'.join(lines)
        
        # Fix specific React patterns
        content = re.sub(r'useState\(\w+\) \{\}', lambda m: m.group(0).replace('{}', ''), content)
        content = re.sub(r'useEffect\(\(\) => \{\}', r'useEffect(() => {', content)
        
        # Fix closing braces that are missing
        lines = content.split('\n')
        brace_count = 0
        paren_count = 0
        
        for i, line in enumerate(lines):
            brace_count += line.count('{') - line.count('}')
            paren_count += line.count('(') - line.count(')')
            
            # If we have unmatched opening braces at the end of the file
            if i == len(lines) - 1 and brace_count > 0:
                lines.append('}' * brace_count)
        
        content = '\n'.join(lines)
        
        if content != original_content:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                self.fixes_applied += 1
                self.files_fixed += 1
                
                print(f"✅ {os.path.basename(file_path)}: parsing errors fixed")
                return 1
            except:
                return 0
        
        return 0

    def process_directory(self, directory: str):
        """Process all files with parsing errors"""
        for root, dirs, files in os.walk(directory):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git']]
            
            for file in files:
                if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
                    file_path = os.path.join(root, file)
                    self.fix_file(file_path)

def main():
    print("🔧 PARSING ERROR FIXER")
    print("="*40)
    
    fixer = ParsingErrorFixer()
    fixer.process_directory('.')
    
    print(f"\n📊 Results: {fixer.files_fixed} files fixed, {fixer.fixes_applied} total fixes")

if __name__ == '__main__':
    main()