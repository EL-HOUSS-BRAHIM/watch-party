Deployment notes and automation

Key assets provided by the user:
- EC2 IP: 35.181.208.71
- Username: ubuntu
- RDS Endpoint: all-in-one.cj6w0queklir.eu-west-3.rds.amazonaws.com:5432
- Redis Primary: master.watch-party-valkey.2muo9f.euw3.cache.amazonaws.com:6379
- Redis Replica: replica.watch-party-valkey.2muo9f.euw3.cache.amazonaws.com:6379

Security note
- The repository currently contains a `.ssh/id_rsa` private key in the workspace. This is strongly discouraged in version control. Move private keys to a secure location (local ~/.ssh or a secrets manager) and remove them from the repository.

Provided automation scripts
- `scripts/deploy_to_ec2.sh` - SSHs to the server, clones/updates the repository, runs `deploy.sh` non-interactively and triggers post-deploy checks.
- `scripts/remote_post_deploy_check.sh` - Runs Django system checks, checks the health endpoint, optionally validates Redis connectivity and shows PM2 status.
- `scripts/manage_github_secrets.sh` - Wrapper around `gh` to list, set, delete, and view secret metadata for the repository.

Typical usage example
1. Make the helper scripts executable (once):
   chmod +x scripts/*.sh

2. Set any required secrets (recommended):
   ./scripts/manage_github_secrets.sh set DJANGO_SECRET_KEY --value "YOUR_SECRET"
   ./scripts/manage_github_secrets.sh set DATABASE_URL --value "postgres://..."

3. Deploy to EC2:
   ./scripts/deploy_to_ec2.sh --ip 35.181.208.71 --user ubuntu --key ~/.ssh/id_rsa --repo git@github.com:EL-HOUSS-BRAHIM/watch-party-backend.git --branch master --remote-dir /home/ubuntu/watch-party-backend

Notes and caveats
- `deploy.sh` is run on the remote server and expects root permissions for tasks like installing packages and configuring Nginx. The `deploy_to_ec2.sh` script runs `deploy.sh` without sudo — if root permissions are needed, run the deploy script as root, e.g. `sudo bash deploy.sh` or elevate within the remote commands.
- The scripts assume the server is reachable via SSH with the provided key and that the server has outbound access to git/github.
- Review and rotate any private keys that were previously checked in.
