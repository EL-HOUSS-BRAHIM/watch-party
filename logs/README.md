# Service Log Archives

This directory is reserved for runtime log snapshots produced by the CI log collection workflow. The workflow clears any existing contents before gathering fresh logs so that each run captures a clean, current set of service logs.

Log files are named after the service they represent (for example, `backend.log`, `frontend.log`, `nginx.log`, etc.).
