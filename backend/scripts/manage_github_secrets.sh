#!/usr/bin/env bash
set -euo pipefail

# manage_github_secrets.sh
# Simple wrapper around GitHub CLI (gh) to list, set, and delete repository secrets.
# Usage examples:
# ./scripts/manage_github_secrets.sh list
# ./scripts/manage_github_secrets.sh set SECRET_NAME --value "mysecret"
# ./scripts/manage_github_secrets.sh delete SECRET_NAME

REPO="EL-HOUSS-BRAHIM/watch-party-backend"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh (GitHub CLI) is required. Install and authenticate with 'gh auth login'"
  exit 2
fi

case "${1:-}" in
  list)
    gh secret list -R "$REPO"
    ;;
  set)
    NAME="$2"
    shift 2 || true
    # Value can be passed as --value "val" or read from stdin
    VALUE=""
    while [[ $# -gt 0 ]]; do
      case $1 in
        --value) VALUE="$2"; shift 2;;
        --file) VALUE=$(cat "$2"); shift 2;;
        *) echo "Unknown option: $1"; exit 3;;
      esac
    done
    if [ -z "$VALUE" ]; then
      echo "Enter secret value for $NAME (will be read from stdin):"
      read -r VALUE
    fi
    echo "Setting secret $NAME in repo $REPO"
    echo -n "$VALUE" | gh secret set "$NAME" -R "$REPO" --body -
    ;;
  delete)
    NAME="$2"
    echo "Deleting secret $NAME from repo $REPO"
    gh secret remove "$NAME" -R "$REPO"
    ;;
  view)
    NAME="$2"
    echo "(GitHub does not expose secret values). Showing metadata for $NAME"
    gh api repos/$REPO/actions/secrets/$NAME
    ;;
  *)
    echo "Usage: $0 {list|set|delete|view} [name] [--value VAL | --file path]"
    exit 1
    ;;
esac
