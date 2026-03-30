"""
export_weights.py — Generate weight files for the Blood Cell Classification ML service.

Downloads the blood-cells-image-dataset from Kaggle, quick-trains both ResNet50 and
EfficientNet-B0 with their classification heads for 1 epoch each, and saves checkpoint
files to ml-service/weights/.

Requirements (install separately before running):
    pip install kagglehub torch torchvision Pillow

Usage:
    python export_weights.py

Output:
    weights/best_resnet50_bloodcells.pth
    weights/best_efficientnetb0_bloodcells.pth
"""

import os
import sys
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import transforms
from torchvision.datasets import ImageFolder
from torchvision.models import (
    ResNet50_Weights,
    EfficientNet_B0_Weights,
    resnet50,
    efficientnet_b0,
)

# ---------------------------------------------------------------------------
# Constants (mirror app/config.py — no circular import needed here)
# ---------------------------------------------------------------------------
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

IMG_SIZE = 224
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
BATCH_SIZE = 32
NUM_EPOCHS = 1  # Quick training for weight generation

WEIGHTS_DIR = Path(__file__).parent / "weights"
RESNET_WEIGHTS_PATH = WEIGHTS_DIR / "best_resnet50_bloodcells.pth"
EFFICIENTNET_WEIGHTS_PATH = WEIGHTS_DIR / "best_efficientnetb0_bloodcells.pth"


# ---------------------------------------------------------------------------
# Dataset utilities
# ---------------------------------------------------------------------------

def find_images_dir(base_path: str) -> str:
    """
    Auto-detect the directory containing per-class image subdirectories.
    Mirrors the find_images_dir helper from the BCCD Jupyter notebooks.
    Looks for a folder whose immediate children are the 8 known class names
    (or a subset of them).
    """
    base = Path(base_path)
    known_classes = set(CLASS_NAMES)

    # BFS through directory tree looking for a folder whose subdirs include
    # at least 4 of the 8 known class names.
    for root, dirs, files in os.walk(base):
        subdirs = set(d.lower() for d in dirs)
        overlap = subdirs & known_classes
        if len(overlap) >= 4:
            return root

    # Fallback: return base path and let ImageFolder raise a descriptive error
    return str(base)


def get_transforms(train: bool = True) -> transforms.Compose:
    """Return image transforms matching the notebook training pipeline."""
    if train:
        return transforms.Compose([
            transforms.Resize((IMG_SIZE, IMG_SIZE)),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ])
    return transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])


# ---------------------------------------------------------------------------
# Model builders
# ---------------------------------------------------------------------------

def build_resnet50_export() -> nn.Module:
    """ResNet50 with 8-class head (pretrained ImageNet backbone)."""
    model = resnet50(weights=ResNet50_Weights.DEFAULT)
    model.fc = nn.Linear(2048, len(CLASS_NAMES))
    return model


def build_efficientnet_b0_export() -> nn.Module:
    """EfficientNet-B0 with 8-class head (pretrained ImageNet backbone)."""
    model = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)
    model.classifier[1] = nn.Linear(1280, len(CLASS_NAMES))
    return model


# ---------------------------------------------------------------------------
# Training helpers
# ---------------------------------------------------------------------------

def freeze_backbone(model: nn.Module, model_type: str) -> None:
    """Freeze all parameters except the classification head."""
    # Freeze all params first
    for param in model.parameters():
        param.requires_grad = False

    # Unfreeze the head
    if model_type == "resnet":
        for param in model.fc.parameters():
            param.requires_grad = True
    elif model_type == "efficientnet":
        for param in model.classifier.parameters():
            param.requires_grad = True


def get_trainable_params(model: nn.Module):
    return [p for p in model.parameters() if p.requires_grad]


def train_one_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    optimizer: optim.Optimizer,
    device: torch.device,
    epoch_label: str,
) -> float:
    """Train for one epoch, return average loss."""
    model.train()
    running_loss = 0.0
    total_batches = len(loader)

    for batch_idx, (images, labels) in enumerate(loader):
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()

        if (batch_idx + 1) % 10 == 0 or (batch_idx + 1) == total_batches:
            print(
                f"  [{epoch_label}] Batch {batch_idx + 1}/{total_batches} "
                f"| Loss: {running_loss / (batch_idx + 1):.4f}"
            )

    return running_loss / total_batches


def evaluate(
    model: nn.Module,
    loader: DataLoader,
    device: torch.device,
) -> float:
    """Evaluate model accuracy on a dataloader."""
    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)
            correct += (predicted == labels).sum().item()
            total += labels.size(0)

    return correct / total if total > 0 else 0.0


def save_checkpoint(model: nn.Module, path: Path) -> None:
    """Save checkpoint in the exact format used by the BCCD notebooks."""
    checkpoint = {
        "model_state_dict": model.state_dict(),
        "classes": CLASS_NAMES,
    }
    torch.save(checkpoint, path)
    print(f"  Checkpoint saved -> {path}")


# ---------------------------------------------------------------------------
# Main export routine
# ---------------------------------------------------------------------------

def export_model(
    model: nn.Module,
    model_type: str,
    model_label: str,
    train_loader: DataLoader,
    val_loader: DataLoader,
    device: torch.device,
    output_path: Path,
) -> None:
    """Train classification head for 1 epoch and save checkpoint."""
    print(f"\n{'='*60}")
    print(f"Exporting: {model_label}")
    print(f"{'='*60}")

    model = model.to(device)

    # Stage 1: Train classification head with frozen backbone
    print("\nStage 1 — Frozen backbone, training head only ...")
    freeze_backbone(model, model_type)
    trainable = get_trainable_params(model)
    print(f"  Trainable parameters: {sum(p.numel() for p in trainable):,}")

    optimizer = optim.Adam(trainable, lr=1e-3)
    criterion = nn.CrossEntropyLoss()

    train_one_epoch(model, train_loader, criterion, optimizer, device, f"{model_label} Stage1")

    val_acc = evaluate(model, val_loader, device)
    print(f"\nValidation accuracy after Stage 1: {val_acc * 100:.1f}%")

    save_checkpoint(model, output_path)
    print(f"{model_label} export complete.\n")


def main() -> None:
    print("Blood Cell Classification — Weight Export Script")
    print("=" * 60)

    # -----------------------------------------------------------------------
    # Download dataset via kagglehub
    # -----------------------------------------------------------------------
    try:
        import kagglehub  # type: ignore
    except ImportError:
        print(
            "ERROR: kagglehub is not installed.\n"
            "Install it with: pip install kagglehub\n"
            "Then re-run this script."
        )
        sys.exit(1)

    print("\nDownloading dataset from Kaggle ...")
    try:
        dataset_path = kagglehub.dataset_download("unclesamulus/blood-cells-image-dataset")
        print(f"Dataset path: {dataset_path}")
    except Exception as exc:
        print(f"ERROR: Failed to download dataset — {exc}")
        print(
            "Ensure you have a Kaggle API key configured at ~/.kaggle/kaggle.json\n"
            "or set KAGGLE_USERNAME and KAGGLE_KEY environment variables."
        )
        sys.exit(1)

    # -----------------------------------------------------------------------
    # Locate images directory
    # -----------------------------------------------------------------------
    images_dir = find_images_dir(dataset_path)
    print(f"Images directory detected: {images_dir}")

    # -----------------------------------------------------------------------
    # Build datasets and loaders
    # -----------------------------------------------------------------------
    train_transform = get_transforms(train=True)
    val_transform = get_transforms(train=False)

    try:
        full_dataset = ImageFolder(root=images_dir, transform=train_transform)
    except Exception as exc:
        print(f"ERROR: Could not load dataset from {images_dir} — {exc}")
        sys.exit(1)

    print(f"\nDataset classes found: {full_dataset.classes}")
    print(f"Total samples: {len(full_dataset)}")

    # 80/20 train/val split
    n_total = len(full_dataset)
    n_train = int(n_total * 0.8)
    n_val = n_total - n_train
    train_dataset, val_dataset = torch.utils.data.random_split(
        full_dataset, [n_train, n_val], generator=torch.Generator().manual_seed(42)
    )
    # Apply val transform to val split
    val_dataset.dataset.transform = val_transform  # type: ignore[attr-defined]

    train_loader = DataLoader(
        train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=2, pin_memory=True
    )
    val_loader = DataLoader(
        val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=2, pin_memory=True
    )

    print(f"Train samples: {n_train} | Val samples: {n_val}")
    print(f"Train batches: {len(train_loader)} | Val batches: {len(val_loader)}")

    # -----------------------------------------------------------------------
    # Device
    # -----------------------------------------------------------------------
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\nDevice: {device}")

    # -----------------------------------------------------------------------
    # Ensure weights directory exists
    # -----------------------------------------------------------------------
    WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)

    # -----------------------------------------------------------------------
    # Export ResNet50
    # -----------------------------------------------------------------------
    export_model(
        model=build_resnet50_export(),
        model_type="resnet",
        model_label="ResNet50",
        train_loader=train_loader,
        val_loader=val_loader,
        device=device,
        output_path=RESNET_WEIGHTS_PATH,
    )

    # -----------------------------------------------------------------------
    # Export EfficientNet-B0
    # -----------------------------------------------------------------------
    export_model(
        model=build_efficientnet_b0_export(),
        model_type="efficientnet",
        model_label="EfficientNet-B0",
        train_loader=train_loader,
        val_loader=val_loader,
        device=device,
        output_path=EFFICIENTNET_WEIGHTS_PATH,
    )

    print("\n" + "=" * 60)
    print("Export complete! Weight files generated:")
    print(f"  {RESNET_WEIGHTS_PATH}")
    print(f"  {EFFICIENTNET_WEIGHTS_PATH}")
    print("\nStart the ML service with:")
    print("  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")
    print("=" * 60)


if __name__ == "__main__":
    main()
