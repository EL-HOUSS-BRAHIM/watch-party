# Automated Testing Guide

This document outlines how to exercise the Watch Party backend test suites that were introduced as part of the Phase 5 remediation work.

## Prerequisites

* Install the testing dependencies (`pip install -r requirements/testing.txt`).
* Ensure `DJANGO_SETTINGS_MODULE` points to `config.settings.testing` before running tests. The helper scripts below configure this automatically.

## Running the Full Smoke Suite

Use the helper script that mirrors the intended CI configuration:

```bash
./scripts/development/run_tests.sh
```

The script applies migrations against the lightweight SQLite database and then executes the suite using the testing settings module.

## Targeting Specific Areas

Run the existing Django test cases when debugging database-backed behaviour:

```bash
python manage.py test apps/authentication.tests --settings=config.settings.testing
```

Execute only the API smoke tests added in Phase 5:

```bash
python manage.py test tests.api --settings=config.settings.testing
```

Exercise the Channels/WebSocket tests (requires the Channels testing utilities):

```bash
python manage.py test tests.websocket --settings=config.settings.testing
```

To focus on specific modules with pytest once the plugin is available, pass the desired paths:

```bash
DJANGO_SETTINGS_MODULE=config.settings.testing pytest tests/api tests/websocket
```

## Continuous Integration Usage

The `scripts/development/run_tests.sh` helper is designed for CI pipelines. Invoke it from the repository root to run migrations and execute the suite. The script accepts additional pytest arguments, allowing CI to collect coverage:

```bash
./scripts/development/run_tests.sh --cov
```

Integrating this command into the pipeline ensures that future pull requests are blocked when tests fail, keeping the backend healthy.
