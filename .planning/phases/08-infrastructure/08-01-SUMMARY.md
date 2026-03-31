---
phase: 08-infrastructure
plan: 01
subsystem: infra
tags: [docker, nginx, node, react, vite, prisma, multi-stage-build]

# Dependency graph
requires:
  - phase: 07-frontend-dynamic-dashboard
    provides: React app with Vite build system ready for containerization
  - phase: 05-backend-api-ml-integration
    provides: Express server with Prisma, runs on port 3001
provides:
  - Frontend/Dockerfile for multi-stage React/Nginx container build
  - Frontend/nginx.conf with SPA fallback and /api/ reverse proxy
  - Backend/Dockerfile for Node.js/Express container with Prisma client generation
  - .dockerignore files for both services
affects: [08-infrastructure-02-compose, any deployment pipeline]

# Tech tracking
tech-stack:
  added: [Docker multi-stage builds, Nginx alpine, node:18-alpine]
  patterns: [multi-stage Docker build for React/Nginx, Prisma generate at Docker build time, relative API URL via VITE_API_URL build arg]

key-files:
  created:
    - Frontend/Dockerfile
    - Frontend/nginx.conf
    - Frontend/.dockerignore
    - Backend/Dockerfile
    - Backend/.dockerignore
  modified: []

key-decisions:
  - "VITE_API_URL build arg defaults to /api so frontend uses relative paths; Nginx proxies /api/ to backend:3001 — avoids hardcoding container hostnames in React bundle"
  - "Backend uses npm ci (all deps) not --omit=dev because server.js has import 'dotenv/config' which is a devDependency; Docker env vars supply values at runtime"
  - "prisma/ copied before src/ in Backend Dockerfile for Docker layer cache optimization — only src changes don't invalidate prisma generate layer"
  - "CMD uses JSON array form ['node', 'src/server.js'] for proper signal handling in container"

patterns-established:
  - "Multi-stage Docker build: builder stage with node:18-alpine, serve stage with nginx:alpine — separates build tools from runtime image"
  - "Nginx SPA pattern: try_files $uri $uri/ /index.html for React Router support"
  - ".dockerignore excludes node_modules, dist, .env.*, database files, and ML models to minimize build context"

requirements-completed: [INFRA-01, INFRA-02]

# Metrics
duration: 2min
completed: 2026-03-31
---

# Phase 8 Plan 01: Dockerfiles for Frontend and Backend Summary

**Multi-stage Dockerfile for React/Nginx frontend and Node.js/Express backend with Prisma generate, plus Nginx reverse proxy config for SPA routing and API proxying**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-31T09:45:36Z
- **Completed:** 2026-03-31T09:47:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Frontend Dockerfile builds React app with Vite (node:18-alpine) then serves static files via nginx:alpine on port 80
- nginx.conf handles SPA fallback routing and proxies /api/ calls to the backend container at backend:3001
- Backend Dockerfile installs all Node.js deps, generates Prisma client from schema, copies source, and runs on port 3001
- Both .dockerignore files minimize build contexts by excluding node_modules, SQLite db files, .env, and ML model artifacts

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Frontend Dockerfile and Nginx config** - `b1403e45` (feat)
2. **Task 2: Create Backend Dockerfile** - `c94975a7` (feat)

**Plan metadata:** (docs commit pending)

## Files Created/Modified

- `Frontend/Dockerfile` - Multi-stage build: node:18-alpine for Vite build, nginx:alpine for static serving
- `Frontend/nginx.conf` - Nginx config with SPA try_files fallback and /api/ reverse proxy to backend:3001
- `Frontend/.dockerignore` - Excludes node_modules, dist, .env files from build context
- `Backend/Dockerfile` - node:18-alpine, npm ci, prisma generate, copy src, run server.js on port 3001
- `Backend/.dockerignore` - Excludes node_modules, SQLite db files, .env, generated/, ML_Models/

## Decisions Made

- **VITE_API_URL build arg:** Defaults to `/api` so React calls relative paths. Nginx then proxies to backend container. This avoids baking container hostnames into the React JS bundle (which would break if hostname changes).
- **npm ci (all deps) for Backend:** `server.js` uses `import 'dotenv/config'` but dotenv is a devDependency. Using `npm ci` without `--omit=dev` ensures dotenv is available. In production Docker Compose will inject env vars directly, so dotenv loading empty file is harmless.
- **Layer cache ordering in Backend Dockerfile:** `COPY prisma ./prisma` and `RUN npx prisma generate` appear before `COPY src ./src` so that changing application code does not invalidate the prisma generate layer.
- **CMD exec form:** `CMD ["node", "src/server.js"]` uses JSON array (exec form) for proper SIGTERM signal handling in Docker.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Verification grep `grep -q "node src/server.js"` in the plan's `<verify>` block does not match `CMD ["node", "src/server.js"]` (exec form with quotes/comma). This is a verification script issue only — the Dockerfile content is correct per plan spec. Manual verification confirms the file is correct.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Frontend and Backend Dockerfiles are ready for Docker Compose orchestration (Phase 08-02)
- Next plan should add docker-compose.yml referencing these Dockerfiles with volume mounts for SQLite persistence and ML model weights
- No blockers

---
*Phase: 08-infrastructure*
*Completed: 2026-03-31*
