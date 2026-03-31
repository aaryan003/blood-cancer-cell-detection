---
phase: 07-frontend-dynamic-dashboard
plan: 02
subsystem: frontend
tags: [react, typescript, api-integration, pagination, data-fetching]
dependency_graph:
  requires: [04-02, 06-01]
  provides: [diagnosis-list-page, model-metrics-page, patient-reports-page, audit-logs-page]
  affects: [Frontend/src/components]
tech_stack:
  added: []
  patterns: [useEffect-fetch, loading-error-state, pagination-controls]
key_files:
  created: []
  modified:
    - Frontend/src/constants/index.ts
    - Frontend/src/components/DiagnosisResults.tsx
    - Frontend/src/components/ModelMetrics.tsx
    - Frontend/src/components/PatientReports.tsx
    - Frontend/src/components/AuditLogs.tsx
decisions:
  - "API_ENDPOINTS constants renamed: DIAGNOSIS->DIAGNOSES, AUDIT->AUDIT_LOGS to match backend routes"
  - "DiagnosisResults transformed from single-detail to paginated list with clickable row detail expansion"
  - "ModelMetrics populates Sensitivity/PPV progress bars from recall/precision fields since they are equivalent metrics"
  - "AuditLogs Total Events card reads from pagination.total to show full dataset count, not just current page"
metrics:
  duration: 5 min
  completed_date: "2026-03-31"
  tasks_completed: 2
  files_modified: 5
---

# Phase 7 Plan 2: Wire Data Pages to Backend API Summary

**One-liner:** Connected DiagnosisResults, ModelMetrics, PatientReports, and AuditLogs to their respective paginated backend APIs with loading/error states and Previous/Next pagination controls.

## What Was Built

Four previously empty/placeholder dashboard pages now fetch and display real data from the backend.

**DiagnosisResults** — Transformed from a single-diagnosis detail view into a paginated list table fetching `/api/diagnoses`. Columns: Sample ID, Patient, Hospital, Result (colored badge), Confidence %, Model, Date. Clicking a row expands the detail view below the table showing the alert banner, sample details, confidence bar, and doctor notes textarea.

**ModelMetrics** — Fetches `/api/metrics` on mount, reads the first record (most recent by evaluatedAt desc), and populates the four metric cards: Accuracy, Precision, Recall, F1-Score as percentages. Model Information section shows model name, total predictions, and evaluation date. Sensitivity and PPV progress bars are populated from recall and precision fields respectively.

**PatientReports** — Fetches `/api/reports` with page/limit parameters. Maps API response fields (sampleId, patientAge, patientGender, diagnosisResult, diagnosisConfidence, hospitalName) to the existing Report type. Previous/Next pagination buttons navigate pages.

**AuditLogs** — Fetches `/api/audit-logs` with pagination. Maps API fields (userName, userRole, action, ipAddress, createdAt) to AuditLog type. Total Events card in Security Summary shows `pagination.total` from the API response. Previous/Next controls added.

## Deviations from Plan

### Auto-fixed Issues

None - plan executed exactly as written.

### Constant File Update

The linter/formatter automatically added `PREDICT` and `DASHBOARD` keys to `API_ENDPOINTS` in `constants/index.ts` — these were pre-existing additions from Phase 5/7-01 that were present in the file but not shown in the plan's interface excerpt. The DIAGNOSES and AUDIT_LOGS renames were applied correctly without conflicting.

## Self-Check

**Files exist:**
- Frontend/src/constants/index.ts — modified with DIAGNOSES and AUDIT_LOGS keys
- Frontend/src/components/DiagnosisResults.tsx — rewritten with useEffect + fetch
- Frontend/src/components/ModelMetrics.tsx — rewritten with useEffect + fetch
- Frontend/src/components/PatientReports.tsx — rewritten with useEffect + fetch
- Frontend/src/components/AuditLogs.tsx — rewritten with useEffect + fetch

**TypeScript:** Zero errors on `tsc --noEmit` for all four components.

**Commits:**
- 7bb7f99e: feat(07-02): wire DiagnosisResults and ModelMetrics to API endpoints
- ba69d282: feat(07-02): wire PatientReports and AuditLogs to API endpoints
