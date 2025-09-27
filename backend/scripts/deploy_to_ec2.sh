#!/usr/bin/env bash
set -euo pipefail

# deploy_to_ec2.sh
# Usage example:
# ./scripts/deploy_to_ec2.sh \
#   --ip 35.181.208.71 \
#   --user ubuntu \
#   --key .ssh/id_rsa \
#   --repo git@github.com:EL-HOUSS-BRAHIM/watch-party-backend.git \
#   --branch master \
#   --remote-dir /home/ubuntu/watch-party-backend

show_usage() {
  cat <<EOF
Usage: $0 --ip IP --user USER --key SSH_KEY --repo GIT_REPO [--branch BRANCH] [--remote-dir REMOTE_DIR]

Description:
  Connects to an EC2 instance, clones or updates the repository, runs the project's remote deploy script
  (deploy.sh) on the server in non-interactive mode and runs post-deploy checks.

Environment variables:
  AUTO_CONFIRM=1    Skip interactive prompts on the remote deploy script
  RUN_ACTION=1      (optional) Which deploy action to run on the remote (see deploy.sh menu)

EOF
}

# Defaults
BRANCH="master"
REMOTE_DIR="/home/ubuntu/watch-party-backend"
GIT_REPO=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --ip) EC2_IP="$2"; shift 2;;
    --user) SSH_USER="$2"; shift 2;;
    --key) SSH_KEY="$2"; shift 2;;
    --repo) GIT_REPO="$2"; shift 2;;
    --branch) BRANCH="$2"; shift 2;;
    --remote-dir) REMOTE_DIR="$2"; shift 2;;
    -h|--help) show_usage; exit 0;;
    *) echo "Unknown arg: $1"; show_usage; exit 1;;
  esac
done

# Validate required args
: "${EC2_IP:?Missing --ip}"
: "${SSH_USER:?Missing --user}"
: "${SSH_KEY:?Missing --key}"
: "${GIT_REPO:?Missing --repo}"

# Ensure SSH key exists
if [ ! -f "$SSH_KEY" ]; then
  echo "SSH key not found: $SSH_KEY"
  exit 2
fi

chmod 600 "$SSH_KEY" || true

# Build remote command script
REMOTE_CMDS=$(cat <<'REMOTE'
set -euo pipefail

# Ensure git is present
if ! command -v git >/dev/null 2>&1; then
  echo "Installing git..."
  apt-get update -y
  apt-get install -y git
fi

mkdir -p "REPLACE_REMOTE_DIR"
cd "REPLACE_REMOTE_DIR"

if [ -d ".git" ]; then
  echo "Repository exists, fetching and resetting to origin/REPLACE_BRANCH"
  git fetch --all --prune
  git reset --hard origin/REPLACE_BRANCH
  git clean -fd
else
  echo "Cloning repository REPLACE_REPO (branch REPLACE_BRANCH)"
  # Try SSH clone first; if that fails and the repo looks like an SSH URL, try HTTPS fallback
  if git clone --depth 1 -b REPLACE_BRANCH REPLACE_REPO . 2>/tmp/git_clone_err.log; then
    echo "Cloned via primary URL"
  else
    echo "Primary clone failed, attempting HTTPS fallback if applicable"
    if echo "REPLACE_REPO" | grep -q "git@github.com:"; then
      HTTPS_URL=$(echo "REPLACE_REPO" | sed -e 's/git@github.com:/https:\/\/github.com\//')
      echo "Trying HTTPS clone: $HTTPS_URL"
      git clone --depth 1 -b REPLACE_BRANCH "$HTTPS_URL" . || { cat /tmp/git_clone_err.log || true; exit 5; }
    else
      cat /tmp/git_clone_err.log || true
      exit 5
    fi
  fi
fi

# Ensure python3 and venv exist
if ! command -v python3 >/dev/null 2>&1; then
  echo "Installing python3..."
  apt-get update -y
  apt-get install -y python3 python3-venv python3-pip
fi

# Run remote deploy script as root (deploy.sh expects root)
if [ -f "REPLACE_REMOTE_DIR/deploy.sh" ]; then
  echo "Running remote deploy script (deploy.sh)"
  # Use AUTO_CONFIRM=1 and RUN_ACTION if provided to allow non-interactive runs
  AUTO_CONFIRM=1
  RUN_ACTION_VAL=""
  if [ -n "REPLACE_RUN_ACTION" ]; then
    RUN_ACTION_VAL=REPLACE_RUN_ACTION
  fi

  # Use sudo if available, otherwise run directly and warn. Use 'sudo env' to preserve necessary env vars.
  if sudo -n true 2>/dev/null; then
    echo "Running deploy.sh with sudo and preserved env (AUTO_CONFIRM, RUN_ACTION)"
    sudo env AUTO_CONFIRM="$AUTO_CONFIRM" RUN_ACTION="$RUN_ACTION_VAL" bash "REPLACE_REMOTE_DIR/deploy.sh"
  else
    echo "Warning: sudo without password not available. Attempting to run deploy.sh directly (may fail due to permissions)."
    AUTO_CONFIRM="$AUTO_CONFIRM" RUN_ACTION="$RUN_ACTION_VAL" bash "REPLACE_REMOTE_DIR/deploy.sh"
  fi
else
  echo "deploy.sh not found in repository"
  exit 3
fi

# Run post-deploy checks if present
if [ -f "REPLACE_REMOTE_DIR/scripts/remote_post_deploy_check.sh" ]; then
  echo "Running remote post-deploy checks"
  bash "REPLACE_REMOTE_DIR/scripts/remote_post_deploy_check.sh"
else
  echo "No post-deploy check script found"
fi
REMOTE
)

# Replace placeholders
REMOTE_CMDS=${REMOTE_CMDS//REPLACE_REMOTE_DIR/$REMOTE_DIR}
REMOTE_CMDS=${REMOTE_CMDS//REPLACE_REPO/$GIT_REPO}
REMOTE_CMDS=${REMOTE_CMDS//REPLACE_BRANCH/$BRANCH}
# Allow optional RUN_ACTION
if [ -n "${RUN_ACTION:-}" ]; then
  REMOTE_CMDS=${REMOTE_CMDS//REPLACE_RUN_ACTION/$RUN_ACTION}
else
  REMOTE_CMDS=${REMOTE_CMDS//REPLACE_RUN_ACTION/}
fi

# Run the remote commands over SSH (expand REMOTE_CMDS locally so the actual commands are piped to remote bash)
echo "Connecting to $SSH_USER@$EC2_IP and deploying to $REMOTE_DIR"
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$EC2_IP" "bash -s" <<SSH_EOF
$REMOTE_CMDS
SSH_EOF

echo "Deployment finished."
