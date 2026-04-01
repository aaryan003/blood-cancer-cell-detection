---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 08-03-PLAN.md
last_updated: "2026-03-31T09:53:05.650Z"
last_activity: 2026-03-30 — POST /predict endpoint and inference pipeline implemented
progress:
  total_phases: 8
  completed_phases: 8
  total_plans: 17
  completed_plans: 17
  percent: 31
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-30)

**Core value:** A doctor or lab technician can upload a blood cell image, select an ML model, and receive a classification prediction with confidence scores, cell type breakdown, and visual heatmap — all backed by real data from the database.
**Current focus:** Phase 1 — Schema & Data Foundation

## Current Position

Phase: 2 of 8 (ML Microservice Core Inference)
Plan: 2 of 2 in current phase (COMPLETE)
Status: In progress — Phase 02 complete, ready for Phase 03
Last activity: 2026-03-30 — POST /predict endpoint and inference pipeline implemented

Progress: [██░░░░░░░░] 31%

## Performance Metrics

**Velocity:**
- Total plans completed: 2
- Average duration: 4 min
- Total execution time: 0.1 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-schema-data-foundation | 2 | 8 min | 4 min |

**Recent Trend:**
- Last 5 plans: 01-01 (3 min), 01-02 (2 min)
- Trend: On track

*Updated after each plan completion*
| Phase 01-schema-data-foundation P01 | 3 min | 2 tasks | 1 files |
| Phase 01-schema-data-foundation P02 | 2 min | 2 tasks | 2 files |
| Phase 02-ml-microservice-core-inference P01 | 8 | 2 tasks | 7 files |
| Phase 02-ml-microservice-core-inference P02 | 7 min | 2 tasks | 2 files |
| Phase 03-ml-microservice-advanced-features P01 | 3 | 2 tasks | 3 files |
| Phase 03-ml-microservice-advanced-features P02 | 3 | 2 tasks | 2 files |
| Phase 04-backend-api-data-endpoints P01 | 2 min | 2 tasks | 4 files |
| Phase 04-backend-api-data-endpoints P02 | 1 | 2 tasks | 13 files |
| Phase 05-backend-api-ml-integration P01 | 10 | 2 tasks | 4 files |
| Phase 06-frontend-static-data-removal P02 | 3 | 2 tasks | 1 files |
| Phase 06-frontend-static-data-removal P01 | 3 | 2 tasks | 5 files |
| Phase 07-frontend-dynamic-dashboard P03 | 3 | 2 tasks | 2 files |
| Phase 07-frontend-dynamic-dashboard P01 | 5 | 1 tasks | 2 files |
| Phase 07-frontend-dynamic-dashboard P02 | 5 | 2 tasks | 5 files |
| Phase 08-infrastructure P02 | 3 | 1 tasks | 2 files |
| Phase 08-infrastructure P01 | 2 | 2 tasks | 5 files |
| Phase 08-infrastructure P03 | 2 | 2 tasks | 5 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Flask/FastAPI for ML serving: Node.js cannot run Python natively; microservice allows independent scaling
- 3 Docker containers: Frontend (Nginx), Backend (Node.js), ML Service (Python/FastAPI)
- Grad-CAM heatmaps: Visual explainability helps doctors trust model predictions
- Side-by-side comparison: Lets users evaluate which model performs better per image
- Seed file for demo data: Needed to demonstrate dashboard without real patients
- [Phase 01-schema-data-foundation]: Optional fields on Diagnosis extensions for backward compatibility with existing records
- [Phase 01-schema-data-foundation]: DATABASE_URL in .env fixed from PostgreSQL to SQLite file path to match schema provider
- [Phase 01-schema-data-foundation]: ModelMetrics uses evaluatedAt+createdAt timestamps to support time-series evaluation records
- [Phase 01-schema-data-foundation P02]: Deterministic static dates used in seed script instead of Date.now() for reproducible runs
- [Phase 01-schema-data-foundation P02]: 22% cancerous ratio (5/23) chosen to reflect realistic clinical distribution
- [Phase 02-ml-microservice-core-inference]: FastAPI lifespan context manager used over deprecated @app.on_event for model loading at startup
- [Phase 02-ml-microservice-core-inference]: Models load gracefully at startup — missing weights log warning but do not crash; /health returns 503 degraded status if no models available
- [Phase 02-ml-microservice-core-inference]: torch.load uses weights_only=False because checkpoint dict contains non-tensor keys (classes list)
- [Phase 02-ml-microservice-core-inference P02]: Cancer risk mapping uses erythroblast+ig as cancerous indicators (demo/academic only, not clinically validated)
- [Phase 02-ml-microservice-core-inference P02]: Cancer confidence = sum of cancerous class probs when Cancerous, 1 minus that sum when Non-cancerous
- [Phase 02-ml-microservice-core-inference P02]: CORS allow_origins=["*"] at FastAPI layer; production restriction deferred to Docker/nginx
- [Phase 03-ml-microservice-advanced-features]: PIL used for image resize/blend instead of cv2 to avoid opencv dependency in Grad-CAM
- [Phase 03-ml-microservice-advanced-features]: CELL_TYPE_CATEGORIES uses frozenset values consistent with existing _CANCEROUS_CLASSES pattern
- [Phase 03-ml-microservice-advanced-features]: Grad-CAM errors are non-fatal: wrapped in try/except so heatmap failure returns None without crashing prediction
- [Phase 03-ml-microservice-advanced-features]: model=both reads image bytes once then passes to both models in comparison mode to avoid double upload overhead
- [Phase 04-backend-api-data-endpoints]: JavaScript-side groupBy for trends because SQLite lacks native date-trunc groupBy support in Prisma
- [Phase 04-backend-api-data-endpoints]: Promise.all for parallel Prisma queries in getStats() to reduce response latency
- [Phase 04-backend-api-data-endpoints]: Metrics endpoint has no pagination (small dataset) — returns all records as flat array
- [Phase 04-backend-api-data-endpoints]: Pagination limit clamped to max 100 per request to prevent large query abuse
- [Phase 05-backend-api-ml-integration]: Node 18 built-in fetch/FormData/Blob used for ML proxy — no additional HTTP client dependency needed
- [Phase 05-backend-api-ml-integration]: model=both comparison response persists only bccd result as primary Diagnosis record
- [Phase 05-backend-api-ml-integration]: FastAPI 503 mapped to local 502 Bad Gateway; AbortError/TimeoutError map to 504
- [Phase 06-frontend-static-data-removal]: Mock fallback removal: auth network failures now surface as explicit error responses rather than silently succeeding via localStorage
- [Phase 06-frontend-static-data-removal]: Stats/metrics cards initialized with '--' placeholder values so layout renders with icons but no fake numbers
- [Phase 06-frontend-static-data-removal]: DiagnosisResults uses nullable useState with early return to show empty state card rather than rendering broken JSX
- [Phase 07-frontend-dynamic-dashboard]: PREDICT endpoint added to API_ENDPOINTS constants for consistent URL management
- [Phase 07-frontend-dynamic-dashboard]: FormData POST without explicit Content-Type header so browser sets multipart boundary automatically
- [Phase 07-frontend-dynamic-dashboard]: Prediction pie chart derived from stats.totalSamples and detectionRate to avoid extra API endpoint
- [Phase 07-frontend-dynamic-dashboard]: Loading/error gates at component root so all charts wait for consistent data snapshot
- [Phase 07-frontend-dynamic-dashboard]: API_ENDPOINTS constants renamed: DIAGNOSIS->DIAGNOSES, AUDIT->AUDIT_LOGS to match backend routes
- [Phase 07-frontend-dynamic-dashboard]: DiagnosisResults transformed from single-detail view to paginated list with clickable row expansion
- [Phase 08-infrastructure]: python:3.11-slim used (not alpine) because PyTorch has complex C dependencies that fail on musl/alpine
- [Phase 08-infrastructure]: weights/ directory not ignored in .dockerignore — included in image; app handles missing weights gracefully with 503 degraded status
- [Phase 08-infrastructure]: PYTHONUNBUFFERED=1 ensures uvicorn logs appear immediately in docker compose logs output
- [Phase 08-infrastructure]: VITE_API_URL build arg defaults to /api so frontend uses relative paths; Nginx proxies /api/ to backend:3001 — avoids hardcoding container hostnames in React bundle
- [Phase 08-infrastructure]: Backend uses npm ci (all deps) not --omit=dev because server.js has import 'dotenv/config' which is a devDependency; Docker env vars supply values at runtime
- [Phase 08-infrastructure]: prisma/ copied before src/ in Backend Dockerfile for Docker layer cache optimization — only src changes do not invalidate prisma generate layer
- [Phase 08-infrastructure]: ML_SERVICE_URL uses Docker DNS service name (ml-service:8000) not IP for inter-container connectivity
- [Phase 08-infrastructure]: VITE_API_URL=/api as build arg so React bundle uses relative paths; Nginx proxies /api/ to backend:3001
- [Phase 08-infrastructure]: backend-data named volume mounts to /app/prisma for SQLite persistence across container restarts

### Pending Todos

None yet.

### Blockers/Concerns

- ML model weights must be exported from Jupyter notebooks before Phase 2 begins
- SQLite used for development; schema design should not assume Postgres-specific features

## Session Continuity

Last session: 2026-03-31T09:52:08.041Z
Stopped at: Completed 08-03-PLAN.md
Resume file: None
