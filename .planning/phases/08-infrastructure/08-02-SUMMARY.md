---
phase: 08-infrastructure
plan: 02
subsystem: infra
tags: [docker, python, fastapi, pytorch, uvicorn]

requires:
  - phase: 02-ml-microservice-core-inference
    provides: FastAPI app entrypoint and requirements.txt

provides:
  - ml-service/Dockerfile containerizing Python/FastAPI/PyTorch inference service
  - ml-service/.dockerignore excluding dev-only files from build context

affects: [docker-compose, deployment, 08-infrastructure]

tech-stack:
  added: [python:3.11-slim Docker base image]
  patterns: [requirements.txt copied before app code for Docker layer caching, COPY weights/ for runtime model files]

key-files:
  created:
    - ml-service/Dockerfile
    - ml-service/.dockerignore
  modified: []

key-decisions:
  - "python:3.11-slim used (not alpine) because PyTorch has complex C dependencies that fail on musl/alpine"
  - "weights/ directory not ignored in .dockerignore — included in image; app handles missing weights gracefully with 503 degraded status"
  - "PYTHONUNBUFFERED=1 ensures uvicorn logs appear immediately in docker compose logs output"

patterns-established:
  - "Docker layer caching: COPY requirements.txt + pip install before COPY app/ to cache deps independently of code changes"
  - ".dockerignore excludes __pycache__, venv, export_weights.py (dev-only tooling)"

requirements-completed: [INFRA-03]

duration: 3min
completed: 2026-03-31
---

# Phase 8 Plan 02: ML Service Dockerfile Summary

**python:3.11-slim Dockerfile with gcc/PIL system deps, layer-cached pip install, and uvicorn CMD serving FastAPI on port 8000**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-31T09:10:00Z
- **Completed:** 2026-03-31T09:13:00Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Created ml-service/Dockerfile using python:3.11-slim with gcc, libglib2.0-0, libsm6, libxext6, libxrender-dev system deps for PIL/torch
- Structured Dockerfile for optimal layer caching (requirements.txt installed before app code copy)
- Created .dockerignore excluding __pycache__, venv, *.pyc, .git, .env, *.md, and export_weights.py

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ML service Dockerfile** - `0d99286a` (feat)

**Plan metadata:** (docs commit — see final commit)

## Files Created/Modified
- `ml-service/Dockerfile` - Containerizes FastAPI/PyTorch service; python:3.11-slim base, system deps, pip install, app/ + weights/ copy, uvicorn CMD
- `ml-service/.dockerignore` - Excludes __pycache__, venv, export_weights.py, *.pyc, .git, .env, *.md from Docker build context

## Decisions Made
- python:3.11-slim chosen over alpine: PyTorch C extensions require glibc (musl-based alpine incompatible)
- weights/ directory retained in image (not ignored): app handles missing .pth files gracefully at startup; users volume-mount or place weights before build
- PYTHONUNBUFFERED=1 set so container log output is not buffered

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ML service Dockerfile complete and ready for Docker Compose orchestration (plan 08-03)
- weights/ directory must have .pth files placed before building image, or volume-mounted at runtime for inference to succeed

---
*Phase: 08-infrastructure*
*Completed: 2026-03-31*
