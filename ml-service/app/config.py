"""
Configuration constants for the Blood Cell Classification ML service.
"""
from pathlib import Path

# Resolve paths relative to this file's location (ml-service/app/config.py -> ml-service/)
_SERVICE_DIR = Path(__file__).parent.parent

# Weight file storage directory
WEIGHTS_DIR = _SERVICE_DIR / "weights"

# Weight file names (must match what export_weights.py produces)
RESNET_WEIGHTS = "best_resnet50_bloodcells.pth"
EFFICIENTNET_WEIGHTS = "best_efficientnetb0_bloodcells.pth"

# Model aliases used in API endpoints -> weight filename mapping
MODEL_ALIASES = {
    "bccd": RESNET_WEIGHTS,
    "efficientnet": EFFICIENTNET_WEIGHTS,
}

# Image preprocessing constants (ImageNet normalization)
IMG_SIZE = 224
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# 8 blood cell classes (order matches model output logits)
CLASS_NAMES = [
    "basophil",
    "eosinophil",
    "erythroblast",
    "ig",
    "lymphocyte",
    "monocyte",
    "neutrophil",
    "platelet",
]

# Service port
PORT = 8000
