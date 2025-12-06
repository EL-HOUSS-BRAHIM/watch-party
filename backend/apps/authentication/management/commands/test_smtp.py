"""
Management command to test SMTP email sending
"""
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings


class Command(BaseCommand):
    help = 'Test SMTP configuration by sending a test email'

    def add_arguments(self, parser):
        parser.add_argument(
            '--to',
            type=str,
            default='bross.or.of@gmail.com',
            help='Email address to send test email to'
        )

    def handle(self, *args, **options):
        recipient = options['to']
        
        self.stdout.write('🔧 Testing SMTP configuration...\n')
        self.stdout.write(f'SMTP Host: {settings.EMAIL_HOST}')
        self.stdout.write(f'SMTP Port: {settings.EMAIL_PORT}')
        self.stdout.write(f'From Email: {settings.DEFAULT_FROM_EMAIL}\n')
        
        try:
            result = send_mail(
                subject='Test Email from Watch Party',
                message='This is a test email to verify SMTP configuration is working correctly. If you receive this, SMTP is properly configured!',
                from_email=f'Watch Party <{settings.DEFAULT_FROM_EMAIL}>',
                recipient_list=[recipient],
                fail_silently=False,
            )
            
            self.stdout.write(self.style.SUCCESS(f'\n✅ Email sent successfully to {recipient}!'))
            self.stdout.write(self.style.SUCCESS(f'Result: {result} email(s) sent'))
            self.stdout.write(self.style.SUCCESS('\n✨ SMTP is working correctly!'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Failed to send email: {e}'))
            self.stdout.write(self.style.ERROR('\nPlease check your SMTP configuration.'))
