---
phase: 03-ml-microservice-advanced-features
plan: "02"
subsystem: api
tags: [gradcam, fastapi, pytorch, inference, heatmap, dual-model, comparison]

# Dependency graph
requires:
  - phase: 03-ml-microservice-advanced-features
    provides: gradcam.py module with generate_gradcam() function and updated inference.py with cell_type_summary
  - phase: 02-ml-microservice-core-inference
    provides: predict() and run_inference() functions, /predict FastAPI endpoint
provides:
  - predict() returns gradcam_heatmap (base64 JPEG data URI or None) in response dict
  - /predict endpoint supports model=both for dual-model comparison
  - Comparison response includes two complete result objects with heatmaps and cell summaries
  - Single-model /predict responses now include cell_type_summary and gradcam_heatmap
affects: [frontend-integration, api-consumer, 04-backend-api]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Non-fatal Grad-CAM: wrapped in try/except so heatmap failure never crashes prediction"
    - "Dual-model comparison: model=both reads image once, runs both models, returns nested results dict"
    - "model_type propagation: passed from endpoint -> predict() -> generate_gradcam() for layer selection"

key-files:
  created: []
  modified:
    - ml-service/app/inference.py
    - ml-service/app/main.py

key-decisions:
  - "Grad-CAM errors are non-fatal: try/except returns None for heatmap so prediction still succeeds"
  - "Image bytes read once then passed to both models in comparison mode (no double upload)"
  - "run_inference() extended with predicted_idx field (backward-compatible) to avoid re-computing argmax in predict()"
  - "Comparison 503 check lists all unavailable models in the detail message for better diagnostics"

patterns-established:
  - "Non-fatal optional enrichment: wrap visual/expensive features in try/except with None fallback"
  - "Read-once, use-twice: upload bytes stored before branching into single vs dual paths"

requirements-completed: [ML-04, ML-06]

# Metrics
duration: 3min
completed: 2026-03-30
---

# Phase 3 Plan 02: Grad-CAM Integration and Dual-Model Comparison Summary

**Grad-CAM heatmap base64 overlay wired into every /predict response, plus model=both dual-model comparison returning two full result objects with confidence, cell breakdowns, and heatmaps**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-30T18:32:57Z
- **Completed:** 2026-03-30T18:35:30Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- predict() now accepts model_type parameter and calls generate_gradcam() with try/except fallback — heatmap failures never crash predictions
- run_inference() extended with predicted_idx (backward-compatible) to avoid recomputing argmax in the caller
- /predict endpoint accepts model=both, reads image bytes once, runs both bccd and efficientnet, returns nested comparison response
- Single-model /predict responses now include cell_type_summary and gradcam_heatmap (previously missing from response assembly)
- 503 response when model=both requested but one or more models unavailable, listing which models are missing

## Task Commits

Each task was committed atomically:

1. **Task 1: Integrate Grad-CAM heatmap into predict pipeline** - `51e21b5c` (feat)
2. **Task 2: Add dual-model comparison support to /predict endpoint** - `41c52e54` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `ml-service/app/inference.py` - Added model_type param to predict(), generate_gradcam() call with non-fatal fallback, gradcam_heatmap in return dict, predicted_idx in run_inference() return dict, logging import
- `ml-service/app/main.py` - Updated /predict to accept model=both, dual-model comparison path with both-model availability check, single-model path now includes cell_type_summary and gradcam_heatmap in response

## Decisions Made
- Grad-CAM errors wrapped in try/except and set to None: visual enrichment should never break the core prediction
- Image bytes read once before the single/dual branch (not re-read per model in comparison mode)
- run_inference() extended with predicted_idx rather than recomputing argmax in predict() — avoids duplicate work and makes the index available for Grad-CAM without a second argmax call
- 503 detail message lists all unavailable model names so callers know exactly what to fix

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ML microservice advanced features complete: every /predict response includes gradcam_heatmap (base64 or null) and cell_type_summary
- Dual-model comparison endpoint ready for frontend integration
- Phase 04 backend API can now call /predict and /predict?model=both to retrieve full enriched responses
- No blockers

---
*Phase: 03-ml-microservice-advanced-features*
*Completed: 2026-03-30*
