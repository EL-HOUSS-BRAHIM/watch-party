"""
Django management command to set up interactive features.
Creates initial interactive feature configurations.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from apps.interactive.models import InteractivePoll
from apps.parties.models import WatchParty


class Command(BaseCommand):
    help = 'Set up interactive features for watch parties'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--create-sample-poll',
            action='store_true',
            help='Create a sample interactive poll',
        )
        parser.add_argument(
            '--party-id',
            type=int,
            help='Party ID to create sample poll for',
        )
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Setting up interactive features...'))
        
        if options['create_sample_poll']:
            self.create_sample_poll(options.get('party_id'))
        
        self.stdout.write(
            self.style.SUCCESS('Successfully initialized interactive features!')
        )
    
    def create_sample_poll(self, party_id=None):
        """Create a sample interactive poll"""
        if party_id:
            try:
                party = WatchParty.objects.get(id=party_id)
            except WatchParty.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Party with ID {party_id} does not exist')
                )
                return
        else:
            # Get first available party
            party = WatchParty.objects.first()
            if not party:
                self.stdout.write(
                    self.style.ERROR('No watch parties found. Create a party first.')
                )
                return
        
        # Get party host as creator
        creator = party.host
        
        # Create sample poll
        poll = InteractivePoll.objects.create(
            creator=creator,
            party=party,
            question="How are you enjoying this movie so far?",
            poll_type='multiple_choice',
            options=[
                "Love it! 😍",
                "It's okay 👍",
                "Not my favorite 😐",
                "Let's watch something else 😴"
            ],
            expires_at=timezone.now() + timedelta(hours=1),
            is_published=True
        )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Created sample poll "{poll.question}" for party "{party.name}"'
            )
        )
