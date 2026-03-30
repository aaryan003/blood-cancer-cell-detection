"""
models.py — Model architecture builders and weight loading utilities.

Provides:
    build_resnet50()        — Recreate ResNet50 architecture with 8-class head
    build_efficientnet_b0() — Recreate EfficientNet-B0 architecture with 8-class head
    load_model(name)        — Load weights from .pth file into architecture, return eval-mode model
    BUILDERS                — Dict mapping model alias -> builder function
"""

import logging
from pathlib import Path
from typing import Callable, Dict

import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0, resnet50

from app.config import CLASS_NAMES, MODEL_ALIASES, WEIGHTS_DIR

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Architecture builders
# ---------------------------------------------------------------------------

def build_resnet50(num_classes: int = 8) -> nn.Module:
    """
    Create ResNet50 architecture with a custom classification head.
    No pretrained weights — architecture only (weights loaded separately).
    """
    model = resnet50(weights=None)
    model.fc = nn.Linear(2048, num_classes)
    return model


def build_efficientnet_b0(num_classes: int = 8) -> nn.Module:
    """
    Create EfficientNet-B0 architecture with a custom classification head.
    No pretrained weights — architecture only (weights loaded separately).
    """
    model = efficientnet_b0(weights=None)
    model.classifier[1] = nn.Linear(1280, num_classes)
    return model


# Mapping from API model alias -> builder function
BUILDERS: Dict[str, Callable[[], nn.Module]] = {
    "bccd": build_resnet50,
    "efficientnet": build_efficientnet_b0,
}


# ---------------------------------------------------------------------------
# Weight loading
# ---------------------------------------------------------------------------

def load_model(model_name: str) -> nn.Module:
    """
    Load a trained model from a .pth checkpoint file.

    Args:
        model_name: One of "bccd" (ResNet50) or "efficientnet" (EfficientNet-B0).

    Returns:
        The model in eval mode on CPU, ready for inference.

    Raises:
        ValueError: If model_name is not a known alias.
        FileNotFoundError: If the .pth weight file does not exist.
        RuntimeError: If the checkpoint cannot be loaded or is malformed.
    """
    if model_name not in MODEL_ALIASES:
        known = ", ".join(f'"{k}"' for k in MODEL_ALIASES)
        raise ValueError(
            f'Unknown model name "{model_name}". Known aliases: {known}'
        )

    weights_filename = MODEL_ALIASES[model_name]
    weights_path: Path = WEIGHTS_DIR / weights_filename

    if not weights_path.exists():
        raise FileNotFoundError(
            f"Weight file not found: {weights_path}\n"
            f'Run "python export_weights.py" from the ml-service directory to generate weights.'
        )

    logger.info("Loading model '%s' from %s ...", model_name, weights_path)

    # Load checkpoint dict — contains non-tensor keys like "classes", so weights_only=False
    checkpoint = torch.load(str(weights_path), map_location="cpu", weights_only=False)

    if "model_state_dict" not in checkpoint:
        raise RuntimeError(
            f"Checkpoint at {weights_path} is missing 'model_state_dict' key. "
            f"Keys present: {list(checkpoint.keys())}"
        )

    # Build architecture and load weights
    builder = BUILDERS[model_name]
    model = builder(num_classes=len(CLASS_NAMES))

    try:
        model.load_state_dict(checkpoint["model_state_dict"])
    except RuntimeError as exc:
        raise RuntimeError(
            f"Failed to load state_dict for model '{model_name}' from {weights_path}. "
            f"Architecture mismatch? Details: {exc}"
        ) from exc

    model.eval()
    logger.info("Model '%s' loaded successfully.", model_name)
    return model
