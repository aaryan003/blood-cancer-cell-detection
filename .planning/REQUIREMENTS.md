# Requirements: Blood Cancer Cell Detection System

**Defined:** 2026-03-30
**Core Value:** A doctor or lab technician can upload a blood cell image, select an ML model, and receive a classification prediction with confidence scores, cell type breakdown, and visual heatmap — all backed by real data from the database.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### ML Service

- [x] **ML-01**: FastAPI microservice that loads both BCCD models and exposes prediction endpoints
- [x] **ML-02**: Prediction returns classification (cancer/non-cancer) with confidence score
- [x] **ML-03**: Prediction returns cell type breakdown (WBC, RBC, Platelets counts/percentages)
- [x] **ML-04**: Prediction generates Grad-CAM heatmap visualization on uploaded image
- [x] **ML-05**: User can select which model to use (base BCCD or EfficientNet)
- [x] **ML-06**: Side-by-side model comparison when user selects both models

### Dashboard

- [ ] **DASH-01**: Dashboard overview shows real stats from database (total samples, detection rate, pending diagnoses, model accuracy)
- [ ] **DASH-02**: Monthly detection trend line graph populated from database
- [ ] **DASH-03**: Hospital distribution bar chart populated from database
- [ ] **DASH-04**: Prediction distribution pie chart (cancerous vs non-cancerous) from database

### Backend API

- [x] **API-01**: GET endpoint for dashboard statistics (aggregated from diagnosis/upload tables)
- [x] **API-02**: GET endpoint for diagnosis results with pagination
- [x] **API-03**: GET endpoint for patient reports with pagination
- [x] **API-04**: GET endpoint for model performance metrics
- [x] **API-05**: GET endpoint for audit logs with pagination
- [x] **API-06**: POST endpoint that proxies uploaded image to ML service and stores prediction result in database
- [x] **API-07**: GET endpoint for trend data (monthly detection aggregations)
- [x] **API-08**: GET endpoint for hospital distribution data

### Data & Schema

- [x] **DATA-01**: Update Prisma schema — add model selection field, cell type breakdown JSON, heatmap image URL to Diagnosis model
- [x] **DATA-02**: Add ModelMetrics table for tracking model performance metrics over time
- [x] **DATA-03**: Seed file with demo data — users, hospitals, patients, reports, uploads, diagnoses, audit logs

### Frontend Cleanup

- [ ] **FE-01**: Remove all hardcoded mock/static data from DashboardOverview, DiagnosisResults, ModelMetrics, PatientReports, AuditLogs
- [x] **FE-02**: Remove localStorage mock fallback from authService.ts
- [ ] **FE-03**: Connect all dashboard components to backend API endpoints with loading/error states
- [ ] **FE-04**: Upload page supports model selection (dropdown/radio for base BCCD vs EfficientNet vs both)

### Infrastructure

- [ ] **INFRA-01**: Dockerfile for frontend (multi-stage build, Nginx serving built React app)
- [ ] **INFRA-02**: Dockerfile for backend (Node.js/Express with Prisma)
- [ ] **INFRA-03**: Dockerfile for ML service (Python/FastAPI with model weights)
- [ ] **INFRA-04**: Docker Compose file for frontend + backend services
- [ ] **INFRA-05**: Docker Compose file for ML service (separate or combined)
- [ ] **INFRA-06**: Environment files (.env) configured for all 3 services with proper defaults

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Notifications

- **NOTF-01**: In-app notifications for diagnosis completion
- **NOTF-02**: Email notification when diagnosis is ready

### Advanced Analytics

- **ANLYT-01**: Export diagnosis reports as PDF
- **ANLYT-02**: Batch image upload and processing
- **ANLYT-03**: Historical accuracy tracking per hospital

### Admin

- **ADMIN-01**: Admin panel for user management
- **ADMIN-02**: Admin can view system-wide analytics
- **ADMIN-03**: Admin can manage hospital associations

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time WebSocket notifications | Not needed for v1 diagnosis workflow |
| OAuth/social login | Email/password with CAPTCHA is sufficient |
| Mobile app | Web-first platform |
| Model training/retraining from UI | Models are pre-trained, out of scope |
| Video/streaming analysis | Single image upload only |
| Multi-tenant SaaS features | Single deployment |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 1 | Pending |
| ML-01 | Phase 2 | Complete |
| ML-02 | Phase 2 | Complete |
| ML-05 | Phase 2 | Complete |
| ML-03 | Phase 3 | Complete |
| ML-04 | Phase 3 | Complete |
| ML-06 | Phase 3 | Complete |
| API-01 | Phase 4 | Complete |
| API-02 | Phase 4 | Complete |
| API-03 | Phase 4 | Complete |
| API-04 | Phase 4 | Complete |
| API-05 | Phase 4 | Complete |
| API-07 | Phase 4 | Complete |
| API-08 | Phase 4 | Complete |
| API-06 | Phase 5 | Complete |
| FE-01 | Phase 6 | Pending |
| FE-02 | Phase 6 | Complete |
| FE-03 | Phase 7 | Pending |
| FE-04 | Phase 7 | Pending |
| DASH-01 | Phase 7 | Pending |
| DASH-02 | Phase 7 | Pending |
| DASH-03 | Phase 7 | Pending |
| DASH-04 | Phase 7 | Pending |
| INFRA-01 | Phase 8 | Pending |
| INFRA-02 | Phase 8 | Pending |
| INFRA-03 | Phase 8 | Pending |
| INFRA-04 | Phase 8 | Pending |
| INFRA-05 | Phase 8 | Pending |
| INFRA-06 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0

---
*Requirements defined: 2026-03-30*
*Last updated: 2026-03-30 — traceability populated after roadmap creation*
