

module.exports = { apps: [{}
    name: 'watch-party-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/watch-party-frontend',
    instances: 1,
    exec_mode: 'fork',
    env: {}
      NODE_ENV: 'production',
      PORT: 3000;
    },
    error_file: '/var/log/pm2/watch-party-frontend-error.log',
    out_file: '/var/log/pm2/watch-party-frontend-out.log',
    log_file: '/var/log/pm2/watch-party-frontend-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: []
      'node_modules',
      '.next',
      'logs'
    ],
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
