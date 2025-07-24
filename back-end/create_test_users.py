"""
Simple script to create test users for development
"""

import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'watchparty.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()

def create_test_users():
    # Create demo user for testing
    demo_user, created = User.objects.get_or_create(
        username='demo@example.com',
        defaults={
            'email': 'demo@example.com',
            'password': make_password('demo123'),
            'first_name': 'Demo',
            'last_name': 'User',
            'is_active': True
        }
    )
    
    if created:
        print(f'✅ Created demo user: demo@example.com / demo123')
    else:
        print(f'ℹ️ Demo user already exists')
    
    # Create admin user
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@watchparty.dev',
            'password': make_password('admin123'),
            'first_name': 'Admin',
            'last_name': 'User',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True
        }
    )
    
    if created:
        print(f'✅ Created admin user: admin@watchparty.dev / admin123')
    else:
        print(f'ℹ️ Admin user already exists')
    
    # Create test users
    for i in range(1, 11):  # Create 10 test users
        username = f'user{i}'
        email = f'user{i}@watchparty.dev'
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'password': make_password('password123'),
                'first_name': f'User',
                'last_name': f'{i}',
                'is_active': True
            }
        )
        
        if created:
            print(f'✅ Created user: {email} / password123')
        else:
            print(f'ℹ️ User {username} already exists')

if __name__ == '__main__':
    create_test_users()
    print('\n🎯 Test users ready!')
    print('📝 Login credentials:')
    print('   Demo: demo@example.com / demo123 (for testing)')
    print('   Admin: admin@watchparty.dev / admin123')
    print('   Users: user1@watchparty.dev / password123')
    print('          user2@watchparty.dev / password123')
    print('          ... (user1 through user10)')
