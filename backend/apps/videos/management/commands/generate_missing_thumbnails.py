"""
Management command to generate thumbnails for videos that don't have them
"""

from django.core.management.base import BaseCommand
from django.db.models import Q
from apps.videos.models import Video
from apps.videos.tasks import extract_gdrive_video_metadata
from celery import group


class Command(BaseCommand):
    help = 'Generate thumbnails for videos that do not have them'

    def add_arguments(self, parser):
        parser.add_argument(
            '--source-type',
            type=str,
            default=None,
            help='Filter by source type (gdrive, upload, url, etc.)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without actually doing it'
        )

    def handle(self, *args, **options):
        source_type = options.get('source_type')
        dry_run = options.get('dry_run', False)

        # Query videos without thumbnails (null or empty)
        query = Video.objects.filter(
            Q(thumbnail__isnull=True) | Q(thumbnail=''),
            status='ready'
        ).exclude(status='deleted')

        if source_type:
            query = query.filter(source_type=source_type)

        videos = list(query.all())
        
        # Debug output
        all_videos = Video.objects.filter(source_type=source_type) if source_type else Video.objects.all()
        self.stdout.write(f'DEBUG: Total videos with source_type={source_type}: {all_videos.count()}')
        self.stdout.write(f'DEBUG: Videos without thumbnails: {len(videos)}')

        if not videos:
            self.stdout.write(self.style.SUCCESS('No videos found without thumbnails'))
            return

        self.stdout.write(
            self.style.WARNING(
                f'Found {len(videos)} videos without thumbnails'
            )
        )

        if dry_run:
            self.stdout.write(self.style.NOTICE('DRY RUN - No changes will be made'))
            for video in videos:
                self.stdout.write(
                    f'  - {video.title} ({video.source_type}) [ID: {video.id}]'
                )
            return

        # Create Celery tasks for each video
        tasks = []
        for video in videos:
            if video.source_type == 'gdrive':
                # Use the existing gdrive metadata extraction task which now includes thumbnail generation
                tasks.append(extract_gdrive_video_metadata.s(str(video.id)))
                self.stdout.write(
                    f'Queued thumbnail generation for: {video.title} (Google Drive)'
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f'Skipping {video.title} - source type "{video.source_type}" not supported yet'
                    )
                )

        if tasks:
            # Execute tasks as a group
            job = group(tasks)
            result = job.apply_async()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'\nSuccessfully queued {len(tasks)} thumbnail generation tasks'
                )
            )
            self.stdout.write(
                f'Task group ID: {result.id}'
            )
        else:
            self.stdout.write(
                self.style.WARNING('No tasks were queued')
            )
