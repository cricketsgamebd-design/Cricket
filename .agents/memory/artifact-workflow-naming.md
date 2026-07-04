---
name: Artifact workflow naming
description: How to find/restart the correct workflow for a registered artifact's service
---

Registered artifacts (via the artifacts skill) get an auto-generated workflow per service in `artifact.toml`, but its name is not the artifact title or slug. The convention is `artifacts/<slug>: <service-name>` (e.g. `artifacts/cricket-champions: web`), where `<service-name>` comes from the `[[services]] name = "..."` entry in `artifact.toml`.

**Why:** Guessing plausible names (artifact title, slug, service name alone) all fail with `RUN_COMMAND_NOT_FOUND`. Manually creating a new workflow with `configureWorkflow` for an artifact-managed service also fails/duplicates, because it won't have the artifact's injected env vars (e.g. `PORT`, `BASE_PATH` from `[services.env]`), causing errors like "PORT environment variable is required but was not provided."

**How to apply:** Before calling `restart_workflow`, check `refresh_all_logs` or the initial environment snapshot for the exact pre-existing workflow name (format `artifacts/<slug>: <service-name>`), or read the artifact's `.replit-artifact/artifact.toml` to get the service `name`. Never hand-roll a `configureWorkflow` call for a service that's already declared in an artifact's `artifact.toml` — restart the existing one instead.
