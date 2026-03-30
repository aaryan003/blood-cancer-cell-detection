"""
main.py — FastAPI application entry point.

Startup: Loads both ML models (bccd/ResNet50 and efficientnet/EfficientNet-B0) into
         app.state.models. If a model fails to load (e.g., missing weights), it is stored
         as None and the health check reports it as unavailable.

Endpoints:
    GET  /health  — Returns model load status. 200 if at least one model loaded, 503 if none.
    POST /predict — Accepts multipart image upload + model query param, returns inference result.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.inference import predict
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

# CORS middleware — allow all origins for development; restrict via Docker config in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.post("/predict", tags=["Inference"])
async def predict_endpoint(
    file: UploadFile,
    model: str = Query(default="bccd", description="Model to use: 'bccd' or 'efficientnet'"),
) -> JSONResponse:
    """
    Classify a blood cell image and return a cancer risk assessment.

    - **file**: Multipart image upload (JPEG, PNG, etc.)
    - **model**: Query parameter selecting the model — "bccd" (ResNet50) or "efficientnet" (EfficientNet-B0)

    Returns JSON with:
        prediction, confidence, model, cell_breakdown (8 classes), processing_time_ms
    """
    # Validate model parameter
    if model not in MODEL_NAMES:
        return JSONResponse(
            status_code=400,
            content={
                "error": "Invalid model",
                "detail": "Model must be 'bccd' or 'efficientnet'",
            },
        )

    # Check model availability
    models_state = getattr(app.state, "models", {})
    model_instance = models_state.get(model)
    if model_instance is None:
        return JSONResponse(
            status_code=503,
            content={
                "error": "Model not available",
                "detail": (
                    f"Model '{model}' failed to load. "
                    "Run export_weights.py first."
                ),
            },
        )

    # Read uploaded image bytes
    try:
        image_bytes = await file.read()
    except Exception as exc:  # noqa: BLE001
        return JSONResponse(
            status_code=422,
            content={
                "error": "Invalid image",
                "detail": str(exc),
            },
        )

    # Run inference
    try:
        result = predict(model_instance, image_bytes)
    except (OSError, SyntaxError, ValueError) as exc:
        # PIL/image format errors
        return JSONResponse(
            status_code=422,
            content={
                "error": "Invalid image",
                "detail": str(exc),
            },
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("Prediction failed for model '%s': %s", model, exc, exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": "Prediction failed",
                "detail": str(exc),
            },
        )

    # Assemble response — add model name to the inference result
    response = {
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "model": model,
        "cell_breakdown": result["cell_breakdown"],
        "processing_time_ms": result["processing_time_ms"],
    }

    return JSONResponse(status_code=200, content=response)


# ---------------------------------------------------------------------------
# Dev runner
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
