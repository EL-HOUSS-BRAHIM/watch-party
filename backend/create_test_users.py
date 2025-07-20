"""
Simple script to create test users for development
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()

def create_test_users():
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
    print('   Admin: admin@watchparty.dev / admin123')
    print('   Users: user1@watchparty.dev / password123')
    print('          user2@watchparty.dev / password123')
    print('          ... (user1 through user10)')
