"""
main.py — FastAPI application entry point.

Startup: Loads both ML models (bccd/ResNet50 and efficientnet/EfficientNet-B0) into
         app.state.models. If a model fails to load (e.g., missing weights), it is stored
         as None and the health check reports it as unavailable.

Endpoints:
    GET /health — Returns model load status. 200 if at least one model loaded, 503 if none.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.models import load_model

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

MODEL_NAMES = ["bccd", "efficientnet"]


# ---------------------------------------------------------------------------
# Lifespan context manager — loads models at startup, cleans up on shutdown
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Load both models into app.state.models at startup."""
    logger.info("Starting up Blood Cell Classification API ...")
    app.state.models = {}

    for name in MODEL_NAMES:
        try:
            model = load_model(name)
            app.state.models[name] = model
            logger.info("Model '%s' loaded OK.", name)
        except FileNotFoundError as exc:
            logger.warning("Model '%s' weights not found — %s", name, exc)
            app.state.models[name] = None
        except Exception as exc:  # noqa: BLE001
            logger.error("Failed to load model '%s': %s", name, exc, exc_info=True)
            app.state.models[name] = None

    loaded = [k for k, v in app.state.models.items() if v is not None]
    if loaded:
        logger.info("Startup complete. Loaded models: %s", loaded)
    else:
        logger.warning(
            "Startup complete but NO models loaded. "
            "Run 'python export_weights.py' to generate weight files."
        )

    yield  # Application runs here

    # Shutdown
    logger.info("Shutting down — releasing model references.")
    app.state.models.clear()


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Blood Cell Classification API",
    version="1.0.0",
    description=(
        "ML microservice that classifies blood cell images using ResNet50 (bccd) "
        "and EfficientNet-B0 models trained on the BCCD dataset."
    ),
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Health"])
async def health_check() -> JSONResponse:
    """
    Returns service health and model availability.

    - 200 OK if at least one model is loaded.
    - 503 Service Unavailable if no models are loaded.
    """
    models_state = getattr(app.state, "models", {})
    model_status = {name: (models_state.get(name) is not None) for name in MODEL_NAMES}

    any_loaded = any(model_status.values())
    status_text = "healthy" if any_loaded else "degraded"
    http_status = 200 if any_loaded else 503

    return JSONResponse(
        status_code=http_status,
        content={
            "status": status_text,
            "models": model_status,
        },
    )


# ---------------------------------------------------------------------------
# Dev runner
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
