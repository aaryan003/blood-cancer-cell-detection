# Roadmap: Blood Cancer Cell Detection System

## Overview

Starting from an existing codebase with working auth and static frontend, this roadmap builds the full diagnostic pipeline: a Python ML microservice serving two pre-trained BCCD models, a complete backend API layer replacing stub endpoints, a frontend that pulls all data dynamically, and three Docker containers ready for deployment. Phases follow natural delivery order — schema before APIs, ML service before proxy, APIs before frontend connects to them.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Schema & Data Foundation** - Update Prisma schema for ML fields and seed the database with demo data
- [x] **Phase 2: ML Microservice — Core Inference** - FastAPI service loads both models and returns predictions with confidence scores (completed 2026-03-30)
- [x] **Phase 3: ML Microservice — Advanced Features** - Cell type breakdown, Grad-CAM heatmaps, and side-by-side model comparison (completed 2026-03-30)
- [x] **Phase 4: Backend API — Data Endpoints** - All Express endpoints for dashboard stats, diagnoses, reports, metrics, trends, hospitals, and audit logs (completed 2026-03-30)
- [x] **Phase 5: Backend API — ML Integration** - Proxy endpoint connecting Node.js backend to ML service and persisting predictions (completed 2026-03-31)
- [x] **Phase 6: Frontend — Static Data Removal** - Strip all hardcoded mock data and localStorage auth fallback from frontend (completed 2026-03-31)
- [x] **Phase 7: Frontend — Dynamic Dashboard** - Connect every dashboard component and upload page to live API endpoints (completed 2026-03-31)
- [ ] **Phase 8: Infrastructure** - Dockerfiles and Docker Compose for all three services with environment configuration

## Phase Details

### Phase 1: Schema & Data Foundation
**Goal**: Database schema supports all ML prediction fields and demo data exists to drive the dashboard
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. Prisma schema includes model selection field, cell type breakdown JSON, and heatmap URL on the Diagnosis model
  2. A ModelMetrics table exists and accepts performance metric records
  3. Running the seed script populates users, hospitals, patients, reports, uploads, diagnoses, and audit logs without errors
  4. The database can be queried and returns realistic demo records for all major tables
**Plans**: 2 plans

Plans:
- [x] 01-01: Update Prisma schema (Diagnosis model extensions + ModelMetrics table) and run migrations
- [x] 01-02: Write and run seed file with demo data across all tables

### Phase 2: ML Microservice — Core Inference
**Goal**: A running FastAPI service that loads both pre-trained BCCD models and returns classification predictions with confidence scores for a chosen model
**Depends on**: Phase 1
**Requirements**: ML-01, ML-02, ML-05
**Success Criteria** (what must be TRUE):
  1. The FastAPI service starts and both model weights load without error
  2. Sending an image to the prediction endpoint with model=bccd returns a cancer/non-cancer classification and a confidence score
  3. Sending an image with model=efficientnet returns a classification and confidence score from the EfficientNet variant
  4. The service responds to a health-check endpoint confirming both models are loaded
**Plans**: 2 plans

Plans:
- [ ] 02-01: Export model weights from Jupyter notebooks and set up FastAPI project structure
- [ ] 02-02: Implement prediction endpoints for both models with model selection parameter

### Phase 3: ML Microservice — Advanced Features
**Goal**: ML service returns cell type breakdown and Grad-CAM heatmap per prediction, and supports running both models simultaneously for comparison
**Depends on**: Phase 2
**Requirements**: ML-03, ML-04, ML-06
**Success Criteria** (what must be TRUE):
  1. A prediction response includes WBC, RBC, and Platelet counts or percentages as structured data
  2. A prediction response includes a Grad-CAM heatmap image (URL or base64) overlaid on the uploaded image
  3. Sending a request with model=both returns two side-by-side prediction results, one from each model
  4. Both results in a comparison request include their respective confidence scores and cell breakdowns
**Plans**: 2 plans

Plans:
- [ ] 03-01: Implement cell type breakdown extraction and include in prediction response
- [ ] 03-02: Implement Grad-CAM heatmap generation and attach to prediction response
- [ ] 03-03: Implement dual-model comparison endpoint that runs both models and returns combined result

### Phase 4: Backend API — Data Endpoints
**Goal**: All Express API endpoints return real data from the database for dashboard stats, diagnoses, reports, model metrics, audit logs, and trend/distribution charts
**Depends on**: Phase 1
**Requirements**: API-01, API-02, API-03, API-04, API-05, API-07, API-08
**Success Criteria** (what must be TRUE):
  1. GET /api/dashboard/stats returns aggregated total samples, detection rate, pending diagnoses, and model accuracy from the database
  2. GET /api/diagnoses returns paginated real diagnosis records from the database
  3. GET /api/reports returns paginated patient report records
  4. GET /api/metrics returns model performance data from the ModelMetrics table
  5. GET /api/audit-logs returns paginated user action records
  6. GET /api/trends and GET /api/hospitals return monthly aggregation and hospital distribution data respectively
**Plans**: 2 plans

Plans:
- [ ] 04-01: Implement dashboard stats and trend/distribution endpoints (API-01, API-07, API-08)
- [ ] 04-02: Implement diagnosis, reports, metrics, and audit log endpoints with pagination (API-02, API-03, API-04, API-05)

### Phase 5: Backend API — ML Integration
**Goal**: The Node.js backend can receive an uploaded image with a model selection, proxy it to the ML service, and persist the full prediction result in the database
**Depends on**: Phase 3, Phase 4
**Requirements**: API-06
**Success Criteria** (what must be TRUE):
  1. Uploading an image with a model selection via the backend API triggers a request to the ML microservice
  2. The prediction result (classification, confidence, cell breakdown, heatmap URL) is saved to the Diagnosis table in the database
  3. The backend returns the complete prediction result to the caller in a single response
  4. If the ML service is unavailable, the backend returns a clear error rather than hanging
**Plans**: 1 plan

Plans:
- [ ] 05-01-PLAN.md — Implement ML proxy endpoint in Express: forward upload to FastAPI, persist Diagnosis, return result to client

### Phase 6: Frontend — Static Data Removal
**Goal**: All hardcoded mock data and fake auth fallbacks are removed from the frontend codebase
**Depends on**: Phase 4
**Requirements**: FE-01, FE-02
**Success Criteria** (what must be TRUE):
  1. The DashboardOverview, DiagnosisResults, ModelMetrics, PatientReports, and AuditLogs components contain no hardcoded arrays or static values used as display data
  2. authService.ts does not fall back to localStorage mock data — authentication routes through the real backend only
  3. Loading the frontend without a backend connection shows loading states or error messages, not fake data
**Plans**: 2 plans

Plans:
- [ ] 06-01: Remove all static mock data from dashboard page components
- [ ] 06-02: Remove localStorage mock fallback from authService.ts and enforce real API auth

### Phase 7: Frontend — Dynamic Dashboard
**Goal**: Every dashboard page and the upload workflow display real-time data from the backend API, with proper loading and error states throughout
**Depends on**: Phase 5, Phase 6
**Requirements**: FE-03, FE-04, DASH-01, DASH-02, DASH-03, DASH-04
**Success Criteria** (what must be TRUE):
  1. The dashboard overview page shows live total samples, detection rate, pending diagnoses, and model accuracy pulled from the database
  2. The monthly detection trend graph renders real data points from the database
  3. The hospital distribution chart and prediction distribution pie chart display real database values
  4. The upload page presents a model selection control (dropdown or radio) for base BCCD, EfficientNet, or both
  5. After uploading an image, the prediction result page shows classification, confidence, cell breakdown, and heatmap from the live ML pipeline
**Plans**: 3 plans

Plans:
- [ ] 07-01: Connect DashboardOverview to API stats endpoint; wire trend, hospital, and prediction distribution charts to their API endpoints
- [ ] 07-02: Connect DiagnosisResults, ModelMetrics, PatientReports, and AuditLogs pages to their API endpoints with loading/error states
- [ ] 07-03: Add model selection UI to upload page and connect upload flow to backend ML proxy endpoint

### Phase 8: Infrastructure
**Goal**: All three services (frontend, backend, ML) can be built and run as Docker containers via Docker Compose with a single command
**Depends on**: Phase 7
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06
**Success Criteria** (what must be TRUE):
  1. docker build succeeds for each of the three Dockerfiles (frontend Nginx, backend Node.js, ML FastAPI) without errors
  2. docker compose up starts all three services and they communicate with each other correctly
  3. Environment variables for all services are defined in .env files with documented defaults — no secrets hardcoded in Dockerfiles or Compose files
  4. The full diagnostic workflow (upload image → ML prediction → dashboard display) works end-to-end in the containerized environment
**Plans**: 3 plans

Plans:
- [ ] 08-01-PLAN.md — Dockerfiles for frontend (multi-stage React+Nginx) and backend (Node.js/Express with Prisma)
- [ ] 08-02-PLAN.md — Dockerfile for ML service (Python/FastAPI with model weights)
- [ ] 08-03-PLAN.md — Docker Compose orchestration and .env configuration for all three services

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Schema & Data Foundation | 2/2 | Complete | 2026-03-30 |
| 2. ML Microservice — Core Inference | 2/2 | Complete   | 2026-03-30 |
| 3. ML Microservice — Advanced Features | 2/2 | Complete   | 2026-03-30 |
| 4. Backend API — Data Endpoints | 2/2 | Complete   | 2026-03-30 |
| 5. Backend API — ML Integration | 1/1 | Complete   | 2026-03-31 |
| 6. Frontend — Static Data Removal | 2/2 | Complete    | 2026-03-31 |
| 7. Frontend — Dynamic Dashboard | 3/3 | Complete    | 2026-03-31 |
| 8. Infrastructure | 1/3 | In Progress|  |
