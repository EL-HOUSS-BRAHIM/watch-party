"""
Management command to seed comprehensive test data for development
This creates users, parties, videos, chat messages, and more for testing
"""

import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from faker import Faker

User = get_user_model()

# Import available models (checking actual model names)
try:
    from apps.users.models import Friendship, UserActivity
except ImportError:
    Friendship = None
    UserActivity = None

try:
    from apps.parties.models import WatchParty, PartyParticipant, PartyInvitation
except ImportError:
    WatchParty = None
    PartyParticipant = None 
    PartyInvitation = None

try:
    from apps.videos.models import Video
except ImportError:
    Video = None

try:
    from apps.chat.models import Message
except ImportError:
    try:
        from apps.chat.models import ChatMessage
    except ImportError:
        Message = None
        ChatMessage = None

try:
    from apps.notifications.models import Notification
except ImportError:
    Notification = None


class Command(BaseCommand):
    help = 'Seed comprehensive test data for development environment'
    
    def __init__(self):
        super().__init__()
        self.fake = Faker()
        self.users = []
        self.parties = []
        self.videos = []
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=15,
            help='Number of users to create (default: 15)'
        )
        parser.add_argument(
            '--videos',
            type=int,
            default=10,
            help='Number of videos to create (default: 10)'
        )
        parser.add_argument(
            '--parties',
            type=int,
            default=8,
            help='Number of parties to create (default: 8)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding'
        )
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🌱 Starting development data seeding...'))
        
        if options['clear']:
            self.clear_existing_data()
        
        self.create_test_users(options['users'])
        if Video:
            self.create_test_videos(options['videos'])
        if WatchParty:
            self.create_test_parties(options['parties'])
        
        self.stdout.write(self.style.SUCCESS('✅ Development data seeding completed!'))
        self.print_summary()
    
    def clear_existing_data(self):
        """Clear existing test data"""
        self.stdout.write('🧹 Clearing existing data...')
        
        # Clear data if models exist
        if Message or ChatMessage:
            try:
                if Message:
                    Message.objects.all().delete()
                if ChatMessage:
                    ChatMessage.objects.all().delete()
            except:
                pass
        
        if PartyParticipant:
            PartyParticipant.objects.all().delete()
        if PartyInvitation:
            PartyInvitation.objects.all().delete()
        if WatchParty:
            WatchParty.objects.all().delete()
        if Video:
            Video.objects.all().delete()
        if Friendship:
            Friendship.objects.all().delete()
        if Notification:
            Notification.objects.all().delete()
            
        # Keep superusers, delete regular users
        User.objects.filter(is_superuser=False).delete()
        
        self.stdout.write(self.style.WARNING('Data cleared.'))
    
    def create_test_users(self, count):
        """Create test users"""
        self.stdout.write(f'👥 Creating {count} test users...')
        
        # Create a test admin user if none exists
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
            self.users.append(admin_user)
            self.stdout.write(f'Created admin user: admin@watchparty.dev / admin123')
        
        # Create regular test users
        for i in range(count):
            username = f'user{i+1}'
            email = f'user{i+1}@watchparty.dev'
            
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'password': make_password('password123'),
                    'first_name': self.fake.first_name(),
                    'last_name': self.fake.last_name(),
                    'is_active': True
                }
            )
            
            if created:
                self.users.append(user)
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created/verified {len(self.users)} users'))
    
    def create_test_videos(self, count):
        """Create test videos"""
        if not Video:
            self.stdout.write(self.style.WARNING('⚠️ Video model not available, skipping videos'))
            return
            
        self.stdout.write(f'🎥 Creating {count} test videos...')
        
        video_sources = ['upload', 'youtube', 'vimeo', 'url']
        
        for i in range(count):
            source = random.choice(video_sources)
            
            if source == 'youtube':
                video_url = f'https://www.youtube.com/watch?v=dQw4w9WgXcQ{i}'
            elif source == 'vimeo':
                video_url = f'https://vimeo.com/{123456789 + i}'
            else:
                video_url = f'https://example.com/video{i}.mp4'
            
            # Check what fields Video model actually has
            video_data = {
                'title': f'{self.fake.catch_phrase()} - Video {i+1}',
                'url': video_url,
            }
            
            # Add optional fields if they exist
            try:
                video = Video(**video_data)
                # Try to set additional fields
                if hasattr(video, 'description'):
                    video.description = self.fake.text(max_nb_chars=300)
                if hasattr(video, 'source'):
                    video.source = source
                if hasattr(video, 'duration'):
                    video.duration = random.randint(300, 7200)
                if hasattr(video, 'uploaded_by') and self.users:
                    video.uploaded_by = random.choice(self.users)
                if hasattr(video, 'thumbnail_url'):
                    video.thumbnail_url = f'https://via.placeholder.com/640x360?text=Video{i+1}'
                if hasattr(video, 'is_public'):
                    video.is_public = random.choice([True, False])
                
                video.save()
                self.videos.append(video)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error creating video {i+1}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(self.videos)} videos'))
    
    def create_test_parties(self, count):
        """Create test watch parties"""
        if not WatchParty or not self.videos or not self.users:
            self.stdout.write(self.style.WARNING('⚠️ Cannot create parties - missing requirements'))
            return
            
        self.stdout.write(f'🎉 Creating {count} test watch parties...')
        
        for i in range(count):
            host = random.choice(self.users)
            video = random.choice(self.videos)
            
            party_data = {
                'title': f'{self.fake.catch_phrase()} - Party {i+1}',
                'host': host,
                'video': video,
            }
            
            try:
                party = WatchParty(**party_data)
                
                # Set additional fields if they exist
                if hasattr(party, 'description'):
                    party.description = self.fake.text(max_nb_chars=200)
                if hasattr(party, 'scheduled_start'):
                    party.scheduled_start = timezone.now() + timedelta(
                        days=random.randint(-3, 7),
                        hours=random.randint(-12, 12)
                    )
                if hasattr(party, 'max_participants'):
                    party.max_participants = random.randint(5, 25)
                if hasattr(party, 'visibility'):
                    party.visibility = random.choice(['public', 'friends', 'private'])
                
                party.save()
                self.parties.append(party)
                
                # Add participants if model exists
                if PartyParticipant:
                    # Add 2-6 random participants
                    participant_count = min(random.randint(2, 6), len(self.users)-1)
                    participants = random.sample([u for u in self.users if u != host], participant_count)
                    
                    for participant in participants:
                        try:
                            PartyParticipant.objects.create(
                                party=party,
                                user=participant,
                                role='participant',
                                is_active=random.choice([True, False])
                            )
                        except Exception:
                            pass
                            
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error creating party {i+1}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(self.parties)} watch parties'))
    
    def print_summary(self):
        """Print summary of created data"""
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('📊 SEEDING SUMMARY'))
        self.stdout.write('='*50)
        self.stdout.write(f'👥 Users: {User.objects.count()}')
        
        if Video:
            self.stdout.write(f'🎥 Videos: {Video.objects.count()}')
        if WatchParty:
            self.stdout.write(f'🎉 Watch Parties: {WatchParty.objects.count()}')
        if PartyParticipant:
            self.stdout.write(f'👫 Party Participants: {PartyParticipant.objects.count()}')
            
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('🎯 Test Data Ready for Development!'))
        self.stdout.write('='*50)
        self.stdout.write('📝 Test Credentials:')
        self.stdout.write('   Admin: admin@watchparty.dev / admin123')
        self.stdout.write('   User1: user1@watchparty.dev / password123')
        self.stdout.write('   User2: user2@watchparty.dev / password123')
        self.stdout.write('   ... (pattern continues for all users)')
        self.stdout.write('='*50)
