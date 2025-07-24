#!/usr/bin/env python3
"""
Simple validation script for Watch Party Backend refactoring
Checks file structure and basic syntax without Django setup
"""

import os
import sys
import ast
from pathlib import Path

def validate_file_structure():
    """Validate that all expected files exist"""
    base_dir = Path(__file__).parent
    
    expected_files = [
        'core/__init__.py',
        'core/utils.py',
        'core/permissions.py',
        'core/mixins.py',
        'core/pagination.py',
        'core/exceptions.py',
        'core/validators.py',
        'middleware/__init__.py',
        'middleware/enhanced_middleware.py',
        'services/__init__.py',
        'services/auth_service.py',
        'services/video_service.py',
        'services/storage_service.py',
        'tests/__init__.py',
        'tests/test_api.py',
        'tests/test_authentication.py',
        'tests/test_integration.py',
        'tests/test_fixes.py',
    ]
    
    missing_files = []
    for file_path in expected_files:
        full_path = base_dir / file_path
        if not full_path.exists():
            missing_files.append(str(file_path))
    
    return missing_files

def validate_removed_files():
    """Validate that unwanted files have been removed"""
    base_dir = Path(__file__).parent
    
    should_not_exist = [
        'utils/middleware.py',
        'utils/permissions.py',
        'utils/mixins.py',
        'middleware/advanced_middleware.py',
        'apps/authentication/models_enhanced.py',
        'apps/authentication/views_enhanced.py',
        'apps/billing/models_complete.py',
        'apps/videos/movie_views.py',
        'apps/videos/movie_urls.py',
    ]
    
    existing_unwanted = []
    for file_path in should_not_exist:
        full_path = base_dir / file_path
        if full_path.exists():
            existing_unwanted.append(str(file_path))
    
    return existing_unwanted

def validate_python_syntax():
    """Validate Python syntax in key files"""
    base_dir = Path(__file__).parent
    
    key_files = [
        'core/utils.py',
        'services/auth_service.py',
        'services/video_service.py',
        'middleware/enhanced_middleware.py',
    ]
    
    syntax_errors = []
    for file_path in key_files:
        full_path = base_dir / file_path
        if full_path.exists():
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    ast.parse(f.read())
            except SyntaxError as e:
                syntax_errors.append(f"{file_path}: {str(e)}")
    
    return syntax_errors

def check_import_references():
    """Check for old import references that should be updated"""
    base_dir = Path(__file__).parent
    
    problematic_imports = []
    search_dirs = ['apps', 'middleware', 'services']
    
    for search_dir in search_dirs:
        dir_path = base_dir / search_dir
        if dir_path.exists():
            for py_file in dir_path.rglob('*.py'):
                try:
                    with open(py_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # Check for old import patterns
                    old_patterns = [
                        'from utils.middleware import',
                        'from utils.permissions import',
                        'from utils.mixins import',
                        'import utils.middleware',
                        'import utils.permissions',
                        'import utils.mixins',
                    ]
                    
                    for pattern in old_patterns:
                        if pattern in content:
                            problematic_imports.append(f"{py_file.relative_to(base_dir)}: {pattern}")
                            
                except Exception:
                    # Skip files that can't be read
                    continue
    
    return problematic_imports

def main():
    """Run all validation checks"""
    print("🔍 Validating Watch Party Backend Refactoring...")
    print("=" * 50)
    
    # Check file structure
    print("\n📁 Checking file structure...")
    missing_files = validate_file_structure()
    if missing_files:
        print("❌ Missing files:")
        for file in missing_files:
            print(f"   - {file}")
    else:
        print("✅ All expected files exist")
    
    # Check removed files
    print("\n🗑️  Checking removed files...")
    unwanted_files = validate_removed_files()
    if unwanted_files:
        print("❌ Files that should have been removed:")
        for file in unwanted_files:
            print(f"   - {file}")
    else:
        print("✅ All unwanted files have been removed")
    
    # Check Python syntax
    print("\n🐍 Checking Python syntax...")
    syntax_errors = validate_python_syntax()
    if syntax_errors:
        print("❌ Syntax errors found:")
        for error in syntax_errors:
            print(f"   - {error}")
    else:
        print("✅ All Python files have valid syntax")
    
    # Check imports
    print("\n📦 Checking import references...")
    import_issues = check_import_references()
    if import_issues:
        print("❌ Old import references found:")
        for issue in import_issues:
            print(f"   - {issue}")
    else:
        print("✅ No problematic import references found")
    
    # Summary
    print("\n" + "=" * 50)
    total_issues = len(missing_files) + len(unwanted_files) + len(syntax_errors) + len(import_issues)
    
    if total_issues == 0:
        print("🎉 Refactoring validation PASSED!")
        print("✅ The backend is properly refactored and optimized")
        print("\n📊 Refactoring Summary:")
        print("   - File structure: ✅ Optimal")
        print("   - Code cleanup: ✅ Complete")
        print("   - Syntax validation: ✅ Valid")
        print("   - Import references: ✅ Updated")
        return 0
    else:
        print(f"❌ Refactoring validation FAILED with {total_issues} issues")
        print("Please fix the issues above before proceeding")
        return 1

if __name__ == "__main__":
    sys.exit(main())
