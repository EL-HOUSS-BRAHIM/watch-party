"""
Management command to optimize database performance
"""

from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings
from .database_optimization import CUSTOM_DATABASE_INDEXES
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Optimize database performance by creating indexes and running maintenance'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-indexes',
            action='store_true',
            help='Create custom database indexes',
        )
        parser.add_argument(
            '--analyze-database',
            action='store_true',
            help='Run database analysis',
        )
        parser.add_argument(
            '--vacuum-database',
            action='store_true',
            help='Vacuum database (PostgreSQL only)',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Run all optimization tasks',
        )

    def handle(self, *args, **options):
        if options['all']:
            options['create_indexes'] = True
            options['analyze_database'] = True
            options['vacuum_database'] = True

        if options['create_indexes']:
            self.create_custom_indexes()

        if options['analyze_database']:
            self.analyze_database()

        if options['vacuum_database']:
            self.vacuum_database()

        self.stdout.write(
            self.style.SUCCESS('Database optimization completed successfully!')
        )

    def create_custom_indexes(self):
        """Create custom database indexes"""
        self.stdout.write('Creating custom database indexes...')
        
        with connection.cursor() as cursor:
            for index_config in CUSTOM_DATABASE_INDEXES:
                try:
                    model_path = index_config['model']
                    app_label, model_name = model_path.split('.')
                    
                    # Get table name from model
                    from django.apps import apps
                    model = apps.get_model(app_label, model_name)
                    table_name = model._meta.db_table
                    
                    # Build index SQL
                    fields = ', '.join(index_config['fields'])
                    index_name = index_config['name']
                    
                    sql = f"""
                    CREATE INDEX IF NOT EXISTS {index_name} 
                    ON {table_name} ({fields});
                    """
                    
                    cursor.execute(sql)
                    self.stdout.write(f'  ✓ Created index: {index_name}')
                    
                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(f'  ✗ Failed to create index {index_name}: {e}')
                    )

    def analyze_database(self):
        """Run database analysis"""
        self.stdout.write('Analyzing database...')
        
        with connection.cursor() as cursor:
            try:
                # PostgreSQL
                if 'postgresql' in settings.DATABASES['default']['ENGINE']:
                    cursor.execute('ANALYZE;')
                    self.stdout.write('  ✓ PostgreSQL analysis completed')
                
                # SQLite
                elif 'sqlite' in settings.DATABASES['default']['ENGINE']:
                    cursor.execute('ANALYZE;')
                    self.stdout.write('  ✓ SQLite analysis completed')
                
                else:
                    self.stdout.write('  ⚠ Database analysis not supported for this engine')
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Database analysis failed: {e}')
                )

    def vacuum_database(self):
        """Vacuum database (PostgreSQL/SQLite only)"""
        self.stdout.write('Vacuuming database...')
        
        with connection.cursor() as cursor:
            try:
                # PostgreSQL
                if 'postgresql' in settings.DATABASES['default']['ENGINE']:
                    cursor.execute('VACUUM ANALYZE;')
                    self.stdout.write('  ✓ PostgreSQL vacuum completed')
                
                # SQLite
                elif 'sqlite' in settings.DATABASES['default']['ENGINE']:
                    cursor.execute('VACUUM;')
                    self.stdout.write('  ✓ SQLite vacuum completed')
                
                else:
                    self.stdout.write('  ⚠ Vacuum not supported for this database engine')
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Database vacuum failed: {e}')
                )
