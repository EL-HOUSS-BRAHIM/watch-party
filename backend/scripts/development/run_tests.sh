#!/usr/bin/env bash
# Run the Watch Party backend test suite with pytest.

set -o errexit
set -o nounset
set -o pipefail

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$REPO_ROOT"

export DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE:-config.settings.testing}

python manage.py migrate --noinput
pytest "$@"
