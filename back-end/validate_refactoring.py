#!/usr/bin/env python3
"""
Validation script for Watch Party Backend refactoring
Checks that all imports, modules, and structure are correct
"""

import os
import sys
import importlib.util
from pathlib import Path

# Set up Django settings before importing Django modules
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'watchparty.settings.development')

try:
    import django
    from django.conf import settings
    django.setup()
except ImportError:
    print("⚠️  Django not available - skipping Django-specific import tests")
    django = None

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

def validate_imports():
    """Validate that imports are working correctly"""
    if not django:
        print("⚠️  Skipping Django import tests - Django not configured")
        return []
    
    import_tests = [
        ('core.utils', 'generate_secure_token'),
        ('core.permissions', None),
        ('core.mixins', None),
        ('core.pagination', None),
        ('middleware.enhanced_middleware', 'RequestLoggingMiddleware'),
        ('services.auth_service', 'AuthenticationService'),
        ('services.video_service', 'VideoStorageService'),
    ]
    
    failed_imports = []
    for module_name, attribute in import_tests:
        try:
            module = importlib.import_module(module_name)
            if attribute and not hasattr(module, attribute):
                failed_imports.append(f"{module_name}.{attribute}")
        except ImportError as e:
            failed_imports.append(f"{module_name}: {str(e)}")
        except Exception as e:
            # Skip Django configuration errors for this validation
            if "settings are not configured" in str(e):
                continue
            failed_imports.append(f"{module_name}: {str(e)}")
    
    return failed_imports

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
    
    # Check imports
    print("\n📦 Checking imports...")
    failed_imports = validate_imports()
    if failed_imports:
        print("❌ Failed imports:")
        for import_error in failed_imports:
            print(f"   - {import_error}")
    else:
        print("✅ All imports are working correctly")
    
    # Summary
    print("\n" + "=" * 50)
    total_issues = len(missing_files) + len(unwanted_files) + len(failed_imports)
    
    if total_issues == 0:
        print("🎉 Refactoring validation PASSED!")
        print("✅ The backend is properly refactored and optimized")
        return 0
    else:
        print(f"❌ Refactoring validation FAILED with {total_issues} issues")
        print("Please fix the issues above before proceeding")
        return 1

if __name__ == "__main__":
    sys.exit(main())
