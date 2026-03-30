# Blood Cancer Cell Detection System

## What This Is

A web-based blood cancer cell detection platform where doctors and lab technicians upload blood cell images and receive AI-powered diagnostic predictions. The system offers two ML models (a base BCCD model and an EfficientNet variant), letting users choose which model to run — or compare both side-by-side. The dashboard displays fully dynamic data from backend APIs and the database — no static/mock data.

## Core Value

A doctor or lab technician can upload a blood cell image, select an ML model, and receive a classification prediction with confidence scores, cell type breakdown, and visual heatmap — all backed by real data from the database.

## Requirements

### Validated

- ✓ User signup/login with CAPTCHA and bcrypt password hashing — existing
- ✓ Role-based user model (ADMIN, DOCTOR, LAB_TECH, HOSPITAL) — existing
- ✓ Secure file upload with validation (extension, MIME, size, malicious signature detection) — existing
- ✓ Prisma ORM with User, Hospital, Patient, Report, Upload, Diagnosis, AuditLog models — existing
- ✓ Rate limiting and security headers (Helmet, CORS) — existing
- ✓ Frontend routing with protected dashboard layout — existing
- ✓ Recharts-based charting components in dashboard — existing (currently static data)

### Active

- [ ] Replace all static/mock data in frontend with dynamic API-driven data
- [ ] Flask/FastAPI ML microservice serving both BCCD models for inference
- [ ] Image upload → model selection → prediction pipeline (classification + confidence)
- [ ] Cell type breakdown (WBC, RBC, Platelets) in prediction results
- [ ] Grad-CAM/attention heatmap visualization on uploaded images
- [ ] Side-by-side model comparison when user selects both models
- [ ] Dynamic dashboard overview with real stats from database (total samples, detection rate, pending, accuracy)
- [ ] Dynamic trend graphs (monthly detection rates) from database
- [ ] Dynamic hospital distribution chart from database
- [ ] Dynamic prediction distribution pie chart from database
- [ ] Backend API endpoints for dashboard stats, diagnosis results, reports, metrics, audit logs
- [ ] Diagnosis results page pulling real prediction data from database
- [ ] Model metrics page showing real model performance data
- [ ] Patient reports page with real report data from database
- [ ] Audit logs page with real user action logs from database
- [ ] Database seed file with demo data (users, hospitals, patients, reports, diagnoses, audit logs)
- [ ] Docker Compose for frontend (Nginx)
- [ ] Docker Compose for backend (Node.js)
- [ ] ML service as separate Docker container (Python/FastAPI)
- [ ] New database tables/fields as needed for model metrics, predictions, cell breakdowns
- [ ] Environment file configuration for all services

### Out of Scope

- Real-time WebSocket notifications — not needed for v1 diagnosis workflow
- OAuth/social login — email/password with CAPTCHA is sufficient
- Mobile app — web-first platform
- Model training/retraining from the UI — models are pre-trained
- Video/streaming analysis — single image upload only
- Multi-tenant SaaS features — single deployment

## Context

- **Existing codebase:** React 18 + TypeScript frontend (Vite), Express.js backend, Prisma ORM with SQLite
- **ML Models:** Two Jupyter notebooks in `Backend/ML_Models/` — `BCCD_MODEL.ipynb` (base model) and `BCCD_MODEL_EFFICIENTNET.ipynb` (EfficientNet variant). Models are pre-trained with weights exportable from the notebooks. Dataset links are embedded in the notebook code.
- **Current state:** Frontend dashboard pages exist but display hardcoded mock data. Backend has auth and upload endpoints working. Diagnosis, reports, metrics, and audit endpoints are defined but not fully implemented.
- **Architecture:** The ML models are Python-based, requiring a separate Flask/FastAPI microservice. The Node.js backend will proxy requests to the ML service. Three Docker containers: Frontend (Nginx serving built React), Backend (Node.js/Express), ML Service (Python/FastAPI).
- **Database:** Prisma schema already has Diagnosis model with `result`, `confidence`, and `metadata` (JSON) fields — extensible for cell breakdown and heatmap data.

## Constraints

- **Tech stack**: Must keep React + Express + Prisma stack for frontend/backend; Python only for ML service
- **ML inference**: Must use Flask or FastAPI as a separate microservice (not subprocess)
- **Docker**: Three separate containers — frontend, backend, ML service
- **Data**: Zero static/mock data in production frontend — everything from API
- **Database**: SQLite for development, schema must support all dynamic dashboard data
- **Models**: Two pre-trained models, user chooses which to run

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Flask/FastAPI for ML serving | Node.js backend can't run Python models natively; microservice allows independent scaling | — Pending |
| 3 Docker containers | Clean separation of concerns; each service can be built/deployed independently | — Pending |
| Seed file for demo data | Need realistic data to demonstrate dashboard without real patients | — Pending |
| Grad-CAM heatmaps | Visual explainability helps doctors trust and understand model predictions | — Pending |
| Side-by-side model comparison | Lets users evaluate which model performs better on their specific images | — Pending |

---
*Last updated: 2026-03-30 after initialization*
