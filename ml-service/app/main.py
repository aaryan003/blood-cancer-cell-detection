"""
main.py — FastAPI application entry point.

Startup: Loads both ML models (bccd/ResNet50 and efficientnet/EfficientNet-B0) into
         app.state.models. If a model fails to load (e.g., missing weights), it is stored
         as None and the health check reports it as unavailable.

Endpoints:
    GET  /health  — Returns model load status. 200 if at least one model loaded, 503 if none.
    POST /predict — Accepts multipart image upload + model query param, returns inference result.
                    Supports model=both for side-by-side dual-model comparison.
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
    model: str = Query(default="bccd", description="Model: 'bccd', 'efficientnet', or 'both'"),
) -> JSONResponse:
    """
    Classify a blood cell image and return a cancer risk assessment.

    - **file**: Multipart image upload (JPEG, PNG, etc.)
    - **model**: Query parameter selecting the model — "bccd" (ResNet50), "efficientnet"
                 (EfficientNet-B0), or "both" for side-by-side dual-model comparison.

    Single-model response fields:
        prediction, confidence, model, cell_breakdown (8 classes),
        cell_type_summary (WBC/RBC/Platelets), gradcam_heatmap (base64 or null),
        processing_time_ms

    Dual-model response (model=both):
        comparison, results (bccd and efficientnet objects), total_processing_time_ms
    """
    # Validate model parameter
    valid_models = MODEL_NAMES + ["both"]
    if model not in valid_models:
        return JSONResponse(
            status_code=400,
            content={
                "error": "Invalid model",
                "detail": "Model must be 'bccd', 'efficientnet', or 'both'",
            },
        )

    # Read uploaded image bytes (done once regardless of single/dual mode)
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

    # -----------------------------------------------------------------------
    # Dual-model comparison path (model=both)
    # -----------------------------------------------------------------------
    if model == "both":
        models_state = getattr(app.state, "models", {})
        unavailable = [
            name for name in MODEL_NAMES
            if models_state.get(name) is None
        ]
        if unavailable:
            return JSONResponse(
                status_code=503,
                content={
                    "error": "Model not available",
                    "detail": (
                        f"The following models are not loaded: {unavailable}. "
                        "Run export_weights.py first."
                    ),
                },
            )

        try:
            bccd_result = predict(models_state["bccd"], image_bytes, model_type="bccd")
            efficientnet_result = predict(
                models_state["efficientnet"], image_bytes, model_type="efficientnet"
            )
        except (OSError, SyntaxError, ValueError) as exc:
            return JSONResponse(
                status_code=422,
                content={
                    "error": "Invalid image",
                    "detail": str(exc),
                },
            )
        except Exception as exc:  # noqa: BLE001
            logger.error("Comparison prediction failed: %s", exc, exc_info=True)
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Prediction failed",
                    "detail": str(exc),
                },
            )

        total_time = round(
            bccd_result["processing_time_ms"] + efficientnet_result["processing_time_ms"],
            2,
        )

        return JSONResponse(
            status_code=200,
            content={
                "comparison": True,
                "results": {
                    "bccd": {
                        "prediction": bccd_result["prediction"],
                        "confidence": bccd_result["confidence"],
                        "model": "bccd",
                        "cell_breakdown": bccd_result["cell_breakdown"],
                        "cell_type_summary": bccd_result["cell_type_summary"],
                        "gradcam_heatmap": bccd_result["gradcam_heatmap"],
                        "processing_time_ms": bccd_result["processing_time_ms"],
                    },
                    "efficientnet": {
                        "prediction": efficientnet_result["prediction"],
                        "confidence": efficientnet_result["confidence"],
                        "model": "efficientnet",
                        "cell_breakdown": efficientnet_result["cell_breakdown"],
                        "cell_type_summary": efficientnet_result["cell_type_summary"],
                        "gradcam_heatmap": efficientnet_result["gradcam_heatmap"],
                        "processing_time_ms": efficientnet_result["processing_time_ms"],
                    },
                },
                "total_processing_time_ms": total_time,
            },
        )

    # -----------------------------------------------------------------------
    # Single-model path
    # -----------------------------------------------------------------------

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

    # Run inference
    try:
        result = predict(model_instance, image_bytes, model_type=model)
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

    # Assemble response — add model name and new fields from updated predict()
    response = {
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "model": model,
        "cell_breakdown": result["cell_breakdown"],
        "cell_type_summary": result["cell_type_summary"],
        "gradcam_heatmap": result["gradcam_heatmap"],
        "processing_time_ms": result["processing_time_ms"],
    }

    return JSONResponse(status_code=200, content=response)


# ---------------------------------------------------------------------------
# Dev runner
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
