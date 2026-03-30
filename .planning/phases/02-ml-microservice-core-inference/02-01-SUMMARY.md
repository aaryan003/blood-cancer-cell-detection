---
phase: 02-ml-microservice-core-inference
plan: "01"
subsystem: ml-service
tags: [fastapi, pytorch, resnet50, efficientnet, model-serving, python]
dependency_graph:
  requires: []
  provides: [ml-service-scaffold, model-loader, health-endpoint, weight-export-script]
  affects: [02-02-prediction-endpoint]
tech_stack:
  added: [fastapi, uvicorn, torch, torchvision, Pillow, python-multipart]
  patterns: [lifespan-model-loading, checkpoint-format-matching, architecture-rebuild-from-state-dict]
key_files:
  created:
    - ml-service/requirements.txt
    - ml-service/.gitignore
    - ml-service/app/__init__.py
    - ml-service/app/config.py
    - ml-service/app/models.py
    - ml-service/app/main.py
    - ml-service/export_weights.py
  modified: []
decisions:
  - lifespan-over-on-event: Used FastAPI lifespan context manager instead of deprecated @app.on_event for model loading at startup
  - graceful-model-loading: Missing weights logs warning but does not crash — health endpoint returns 503 with degraded status
  - weights-only-false: torch.load uses weights_only=False because checkpoint dict contains non-tensor keys (classes list)
  - cpu-inference: Models loaded to CPU (map_location='cpu') — GPU not required for inference in this project context
metrics:
  duration: 8 min
  completed: 2026-03-30
  tasks_completed: 2
  files_created: 7
---

# Phase 02 Plan 01: ML Service Scaffold and Health Check Summary

FastAPI ML microservice foundation with ResNet50 and EfficientNet-B0 loading via lifespan, health check endpoint, and Kaggle-based weight export script matching notebook checkpoint format.

## What Was Built

### Task 1 — ML Service Project Structure, Export Script, and Dependencies (c8a91414)

Created the `ml-service/` directory with:

- **requirements.txt** — Pinned Python dependencies: fastapi, uvicorn[standard], torch, torchvision, Pillow, python-multipart (kagglehub noted as optional dev dependency for weight export)
- **.gitignore** — Excludes `weights/*.pth`, `__pycache__/`, `*.pyc`, `.venv/`
- **app/__init__.py** — Package marker
- **app/config.py** — All constants: CLASS_NAMES (8 cell types), MODEL_ALIASES (bccd->resnet, efficientnet->efficientnet), WEIGHTS_DIR (pathlib), IMG_SIZE=224, IMAGENET_MEAN/STD, PORT=8000
- **export_weights.py** — Full training script (280+ lines): downloads via kagglehub, auto-detects image directory with `find_images_dir()`, trains both models for 1 epoch with frozen backbone, saves checkpoints in exact notebook format `{"model_state_dict": ..., "classes": [...]}`

### Task 2 — Model Loader and FastAPI App with Health Check (427e7b0a)

- **app/models.py** — Architecture builders (`build_resnet50`, `build_efficientnet_b0`) with no pretrained weights, `load_model(name)` that reconstructs architecture and loads state_dict, `BUILDERS` dict for dispatch. Raises `FileNotFoundError` with actionable message if weights missing.
- **app/main.py** — FastAPI app with lifespan context manager loading both models at startup. `GET /health` returns `{"status": "healthy"|"degraded", "models": {"bccd": bool, "efficientnet": bool}}` — 200 if any model loaded, 503 if none.

## Verification Results

All checks passed:
- `python -c "from app.config import CLASS_NAMES; print(CLASS_NAMES)"` — 8 class names printed
- `python -c "from app.models import build_resnet50, build_efficientnet_b0"` — imports without error
- `build_resnet50().fc` — `Linear(in_features=2048, out_features=8, bias=True)`
- `build_efficientnet_b0().classifier[1]` — `Linear(in_features=1280, out_features=8, bias=True)`
- `/health` route registered in FastAPI app
- `python -m py_compile ml-service/export_weights.py` — syntax valid

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Notes

- torch/torchvision were not pre-installed in the system Python; dependency installation is expected as part of ml-service setup. Syntax verification confirmed files are correct before torch was available.
- The `weights/` directory is gitignored for `.pth` files but the directory itself is tracked (via `.gitignore` pattern `weights/*.pth`) so the directory structure exists in the repo.

## Commits

| Hash | Description |
|------|-------------|
| c8a91414 | feat(02-01): create ML service project structure, config, and export script |
| 427e7b0a | feat(02-01): implement model loader and FastAPI app with health check |

## Self-Check: PASSED

All 7 files verified present on disk. Both commits (c8a91414, 427e7b0a) confirmed in git history.
