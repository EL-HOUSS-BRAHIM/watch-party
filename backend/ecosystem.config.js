module.exports = {
  apps: [
    {
      name: 'watchparty-django',
      script: './start-django.sh',
      cwd: '/opt/watch-party-backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: '/var/log/watchparty/pm2_django.log',
      out_file: '/var/log/watchparty/pm2_django_out.log',
      error_file: '/var/log/watchparty/pm2_django_error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'watchparty-daphne',
      script: './start-daphne.sh',
      cwd: '/opt/watch-party-backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      log_file: '/var/log/watchparty/pm2_daphne.log',
      out_file: '/var/log/watchparty/pm2_daphne_out.log',
      error_file: '/var/log/watchparty/pm2_daphne_error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'watchparty-celery-worker',
      script: './start-celery-worker.sh',
      cwd: '/opt/watch-party-backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      log_file: '/var/log/watchparty/pm2_celery_worker.log',
      out_file: '/var/log/watchparty/pm2_celery_worker_out.log',
      error_file: '/var/log/watchparty/pm2_celery_worker_error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'watchparty-celery-beat',
      script: './start-celery-beat.sh',
      cwd: '/opt/watch-party-backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      log_file: '/var/log/watchparty/pm2_celery_beat.log',
      out_file: '/var/log/watchparty/pm2_celery_beat_out.log',
      error_file: '/var/log/watchparty/pm2_celery_beat_error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
