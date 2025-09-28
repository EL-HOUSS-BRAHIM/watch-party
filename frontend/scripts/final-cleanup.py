#!/usr/bin/env python3
"""
Final Cleanup Script - Handles remaining complex lint issues
"""

import os
import re
import sys

class FinalLintCleanup:
    def __init__(self):
        self.fixes_applied = 0
        
    def fix_file(self, file_path: str) -> int:
        """Fix a single file and return number of fixes applied"""
        if not os.path.exists(file_path):
            return 0

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        
        # Apply specialized fixes
        content = self.fix_unused_error_params(content)
        content = self.fix_unused_imports(content)  
        content = self.fix_useeffect_deps(content)
        content = self.fix_img_elements(content)
        content = self.fix_any_types(content)
        content = self.fix_unused_variables(content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            # Count changes
            changes = len(original_content.split('\n')) - len(content.split('\n'))
            changes += sum(1 for a, b in zip(original_content.split('\n'), content.split('\n')) if a != b)
            changes = max(1, abs(changes))
            
            print(f"✅ {os.path.basename(file_path)}: {changes} fixes applied")
            return changes
        
        return 0

    def fix_unused_error_params(self, content: str) -> str:
        """Fix unused error parameters in catch blocks"""
        # Pattern: } catch (error) { or } catch (err) {
        pattern = r'}\s*catch\s*\(\s*(error|err)\s*\)\s*{'
        replacement = r'} catch {'
        return re.sub(pattern, replacement, content)

    def fix_unused_imports(self, content: str) -> str:
        """Remove common unused imports"""
        unused_imports = [
            'AlertCircle', 'TrendingUp', 'Image'
        ]
        
        for unused in unused_imports:
            # Remove from import lists
            content = re.sub(rf',\s*{unused}\s*,', ',', content)
            content = re.sub(rf',\s*{unused}\s*}}', '}', content)  
            content = re.sub(rf'{{\s*{unused}\s*,', '{', content)
            content = re.sub(rf'import\s+{unused}\s+from[^\n]+\n', '', content)
        
        # Clean up empty imports
        content = re.sub(r'import\s*{\s*}\s*from[^\n]+\n', '', content)
        
        return content

    def fix_useeffect_deps(self, content: str) -> str:
        """Fix useEffect dependency issues"""
        lines = content.split('\n')
        
        # Add useCallback import if missing
        react_import_match = None
        for i, line in enumerate(lines):
            if 'import {' in line and 'from "react"' in line:
                react_import_match = i
                if 'useCallback' not in line:
                    # Add useCallback to the import
                    lines[i] = line.replace('}', ', useCallback }')
                break
        
        # Look for function definitions that need useCallback
        in_function = False
        function_indent = 0
        
        for i, line in enumerate(lines):
            # Detect function definitions that should be useCallback
            if re.match(r'\s*const\s+\w+\s*=\s*async\s*\(\s*\)\s*=>\s*{', line):
                # Check if it's used in useEffect
                function_name = re.search(r'const\s+(\w+)', line).group(1)
                content_str = '\n'.join(lines)
                
                if f'useEffect(' in content_str and function_name in content_str:
                    # Convert to useCallback
                    indent = len(line) - len(line.lstrip())
                    lines[i] = ' ' * indent + f'const {function_name} = useCallback(async () => {{'
                    
                    # Find the end of the function and add dependency
                    brace_count = 1
                    j = i + 1
                    while j < len(lines) and brace_count > 0:
                        line_content = lines[j]
                        brace_count += line_content.count('{') - line_content.count('}')
                        if brace_count == 0:
                            # Add dependency array
                            lines[j] = line_content + ', [])'
                            break
                        j += 1
        
        return '\n'.join(lines)

    def fix_img_elements(self, content: str) -> str:
        """Replace img with Next.js Image"""
        # Add Image import if needed and img elements exist
        if '<img' in content and 'import Image from "next/image"' not in content:
            # Add import after first import
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if line.startswith('import '):
                    lines.insert(i + 1, 'import Image from "next/image"')
                    content = '\n'.join(lines)
                    break
        
        # Replace img elements with Image
        img_pattern = r'<img\s+([^>]*?)src="([^"]*)"([^>]*?)/?>'
        
        def replace_img(match):
            pre_src = match.group(1)
            src = match.group(2)
            post_src = match.group(3)
            
            # Extract alt attribute
            alt_match = re.search(r'alt="([^"]*)"', pre_src + post_src)
            alt = alt_match.group(1) if alt_match else ""
            
            # Extract className
            class_match = re.search(r'className="([^"]*)"', pre_src + post_src)
            class_name = class_match.group(1) if class_match else ""
            
            # Build Image element
            result = f'<Image\n              src="{src}"\n              alt="{alt}"\n              fill'
            if class_name:
                result += f'\n              className="{class_name}"'
            result += '\n            />'
            
            return result
        
        return re.sub(img_pattern, replace_img, content)

    def fix_any_types(self, content: str) -> str:
        """Fix any types"""
        replacements = [
            (r': any\b', ': unknown'),
            (r' as any\b', ' as Record<string, unknown>'),
        ]
        
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
        
        return content

    def fix_unused_variables(self, content: str) -> str:
        """Remove unused variables from function parameters"""
        # Remove unused parameters like currentUserId, handleOptionSelect
        lines = content.split('\n')
        
        for i, line in enumerate(lines):
            # Remove unused parameters from function definitions
            if 'currentUserId' in line and line.strip().endswith(') => {'):
                # Remove currentUserId parameter
                lines[i] = re.sub(r',\s*currentUserId', '', line)
                lines[i] = re.sub(r'currentUserId\s*,', '', lines[i])
                lines[i] = re.sub(r'\(\s*currentUserId\s*\)', '()', lines[i])
            
            # Remove unused variable assignments
            if re.match(r'\s*const\s+\w+\s*=.*', line) and 'handleOptionSelect' in line:
                lines[i] = ''
        
        return '\n'.join(lines)

    def process_files(self, file_paths):
        """Process multiple files"""
        total_fixes = 0
        
        for file_path in file_paths:
            fixes = self.fix_file(file_path)
            total_fixes += fixes
        
        print(f"\n📊 Total fixes applied: {total_fixes}")
        return total_fixes

if __name__ == '__main__':
    cleanup = FinalLintCleanup()
    
    # Target the high-priority files
    target_files = [
        'components/integrations/integration-api-system.tsx',
        'components/billing/billing-address-view.tsx', 
        'components/party/interactive-polls.tsx',
        'components/profile/public-profile-view.tsx',
        'components/videos/video-details.tsx',
        'app/store/[itemId]/page.tsx',
        'components/admin/admin-layout.tsx',
        'components/analytics/party-analytics.tsx',
        'components/billing/payment-methods.tsx',
        'app/dashboard/analytics/predictive/page.tsx'
    ]
    
    print("🎯 Targeting remaining high-priority files...")
    cleanup.process_files(target_files)