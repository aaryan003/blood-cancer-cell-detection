"""
inference.py — Image preprocessing, model inference, and cancer risk mapping.

Provides:
    preprocess_image(image_bytes)  — Convert raw image bytes to a normalized tensor
    run_inference(model, tensor)   — Run forward pass and return class probabilities
    map_cancer_risk(class, probs)  — Map cell-type prediction to cancer risk label
    predict(model, image_bytes)    — High-level: bytes -> full response dict

NOTE: The cancer risk mapping is rule-based and is intended for demo/academic purposes
only. It is NOT clinically validated and must not be used for medical decisions.
"""

import io
import logging
import time
from typing import Dict

import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms

from app.config import CLASS_NAMES, IMG_SIZE, IMAGENET_MEAN, IMAGENET_STD
from app.gradcam import generate_gradcam

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Cell types associated with cancer risk indicators
# Erythroblast: blast cells — elevated counts indicate acute leukemia
# IG (immature granulocytes): abnormal proliferation — marker of myeloid malignancies
# NOTE: For demo/academic use only. Not clinically validated.
# ---------------------------------------------------------------------------
_CANCEROUS_CLASSES = frozenset({"erythroblast", "ig"})

# ---------------------------------------------------------------------------
# Clinical cell type category mapping (8 classes -> 3 categories)
# WBC: White Blood Cells (6 classes — all leukocyte types)
# RBC: Red Blood Cells (erythroblast — nucleated RBC precursor)
# Platelets: thrombocytes
# ---------------------------------------------------------------------------
CELL_TYPE_CATEGORIES: dict = {
    "WBC": frozenset({"basophil", "eosinophil", "ig", "lymphocyte", "monocyte", "neutrophil"}),
    "RBC": frozenset({"erythroblast"}),
    "Platelets": frozenset({"platelet"}),
}


# ---------------------------------------------------------------------------
# Cell type aggregation
# ---------------------------------------------------------------------------

def aggregate_cell_types(cell_breakdown: dict) -> dict:
    """
    Group 8 individual blood cell class probabilities into 3 clinical categories.

    Categories:
        WBC (White Blood Cells): basophil, eosinophil, ig, lymphocyte, monocyte, neutrophil
        RBC (Red Blood Cells):   erythroblast
        Platelets:               platelet

    Args:
        cell_breakdown: Dict mapping each of the 8 class names to its probability.

    Returns:
        Dict with keys "WBC", "RBC", "Platelets" and their summed probabilities,
        each rounded to 4 decimal places. Values sum to approximately 1.0.
    """
    return {
        category: round(
            sum(cell_breakdown.get(cls, 0.0) for cls in classes),
            4,
        )
        for category, classes in CELL_TYPE_CATEGORIES.items()
    }


# ---------------------------------------------------------------------------
# Preprocessing
# ---------------------------------------------------------------------------

def preprocess_image(image_bytes: bytes) -> torch.Tensor:
    """
    Decode raw image bytes and apply standard ImageNet preprocessing.

    Args:
        image_bytes: Raw bytes of an image file (JPEG, PNG, etc.)

    Returns:
        Tensor of shape (1, 3, IMG_SIZE, IMG_SIZE) ready for model input.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])

    tensor = transform(image)          # Shape: (3, H, W)
    return tensor.unsqueeze(0)         # Shape: (1, 3, H, W) — add batch dimension


# ---------------------------------------------------------------------------
# Inference
# ---------------------------------------------------------------------------

def run_inference(model: nn.Module, image_tensor: torch.Tensor) -> dict:
    """
    Run a forward pass through the model and return per-class probabilities.

    Args:
        model: PyTorch model in eval mode.
        image_tensor: Preprocessed tensor of shape (1, 3, H, W).

    Returns:
        dict with:
            predicted_class (str)   — name of the highest-probability class
            confidence (float)      — probability of the predicted class (0–1)
            cell_breakdown (dict)   — mapping of each class name to its probability
    """
    model.eval()

    with torch.no_grad():
        logits = model(image_tensor)                               # (1, num_classes)
        probs = F.softmax(logits, dim=1).squeeze(0)               # (num_classes,)

    prob_list = probs.tolist()

    cell_breakdown: Dict[str, float] = {
        name: round(prob, 4)
        for name, prob in zip(CLASS_NAMES, prob_list)
    }

    predicted_idx = int(torch.argmax(probs).item())
    predicted_class = CLASS_NAMES[predicted_idx]
    confidence = round(prob_list[predicted_idx], 4)

    return {
        "predicted_class": predicted_class,
        "predicted_idx": predicted_idx,
        "confidence": confidence,
        "cell_breakdown": cell_breakdown,
    }


# ---------------------------------------------------------------------------
# Cancer risk mapping
# ---------------------------------------------------------------------------

def map_cancer_risk(predicted_class: str, cell_breakdown: dict) -> dict:
    """
    Map a blood cell classification result to a binary cancer risk determination.

    Rules (for demo/academic purposes — NOT clinically validated):
      - "Cancerous" if:
          * The predicted class is erythroblast or ig, OR
          * The combined probability of erythroblast + ig exceeds 0.50
      - "Non-cancerous" otherwise.

    Cancer confidence is the sum of cancerous class probabilities when Cancerous,
    or 1 minus that sum when Non-cancerous.

    Args:
        predicted_class: The class with the highest model probability.
        cell_breakdown: Dict of {class_name: probability} for all 8 classes.

    Returns:
        dict with:
            prediction (str)   — "Cancerous" or "Non-cancerous"
            confidence (float) — probability associated with the risk label (0–1)
    """
    # Sum probability mass on cancerous indicator classes
    cancerous_prob = sum(
        cell_breakdown.get(cls, 0.0) for cls in _CANCEROUS_CLASSES
    )

    if predicted_class in _CANCEROUS_CLASSES or cancerous_prob > 0.5:
        label = "Cancerous"
        cancer_confidence = cancerous_prob
    else:
        label = "Non-cancerous"
        cancer_confidence = 1.0 - cancerous_prob

    return {
        "prediction": label,
        "confidence": round(cancer_confidence, 4),
    }


# ---------------------------------------------------------------------------
# High-level predict function
# ---------------------------------------------------------------------------

def predict(model: nn.Module, image_bytes: bytes, model_type: str = "bccd") -> dict:
    """
    End-to-end inference: raw image bytes -> full structured response.

    Measures total processing time including preprocessing, forward pass, and Grad-CAM.

    Args:
        model: Loaded PyTorch model in eval mode.
        image_bytes: Raw image file bytes.
        model_type: Architecture identifier for Grad-CAM layer selection.
                    "bccd" (ResNet50) or "efficientnet" (EfficientNet-B0).

    Returns:
        dict matching the API response format:
            prediction (str)           — "Cancerous" or "Non-cancerous"
            confidence (float)         — risk label confidence
            cell_breakdown (dict)      — per-class probabilities for all 8 classes
            cell_type_summary (dict)   — aggregated WBC/RBC/Platelets category percentages
            gradcam_heatmap (str|None) — base64 JPEG data URI of the heatmap overlay, or None on failure
            processing_time_ms (float) — wall-clock time in milliseconds
    """
    t_start = time.perf_counter()

    # Step 1: Preprocess
    tensor = preprocess_image(image_bytes)

    # Step 2: Run inference
    inference_result = run_inference(model, tensor)

    # Step 3: Map to cancer risk
    risk_result = map_cancer_risk(
        inference_result["predicted_class"],
        inference_result["cell_breakdown"],
    )

    # Step 4: Aggregate cell types into clinical categories
    cell_type_summary = aggregate_cell_types(inference_result["cell_breakdown"])

    # Step 5: Generate Grad-CAM heatmap — non-fatal, falls back to None on any error
    try:
        heatmap_base64 = generate_gradcam(
            model=model,
            image_tensor=tensor,
            original_image_bytes=image_bytes,
            target_class_idx=inference_result["predicted_idx"],
            model_type=model_type,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Grad-CAM generation failed for model_type='%s': %s — heatmap set to None.",
            model_type,
            exc,
        )
        heatmap_base64 = None

    t_end = time.perf_counter()
    processing_time_ms = round((t_end - t_start) * 1000, 2)

    return {
        "prediction": risk_result["prediction"],
        "confidence": risk_result["confidence"],
        "cell_breakdown": inference_result["cell_breakdown"],
        "cell_type_summary": cell_type_summary,
        "gradcam_heatmap": heatmap_base64,
        "processing_time_ms": processing_time_ms,
    }
