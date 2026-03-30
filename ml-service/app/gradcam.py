"""
gradcam.py — Grad-CAM heatmap generation for visual explainability.

Grad-CAM (Gradient-weighted Class Activation Mapping) highlights the image
regions that most influenced the model's classification decision.

Provides:
    generate_gradcam(model, image_tensor, original_image_bytes, target_class_idx, model_type)
        -> base64-encoded JPEG string of the heatmap overlay

Reference: Selvaraju et al., "Grad-CAM: Visual Explanations from Deep Networks
via Gradient-based Localization" (ICCV 2017).
"""

import base64
import io
from typing import Optional

import matplotlib.cm as cm
import numpy as np
import torch
import torch.nn as nn
from PIL import Image


# ---------------------------------------------------------------------------
# Target layer resolution
# ---------------------------------------------------------------------------

def _get_target_layer(model: nn.Module, model_type: str) -> nn.Module:
    """
    Return the convolutional layer to hook for Grad-CAM.

    Args:
        model: Loaded PyTorch model in eval mode.
        model_type: "bccd" for ResNet50 or "efficientnet" for EfficientNet-B0.

    Returns:
        The target nn.Module layer.

    Raises:
        ValueError: If model_type is not recognised.
    """
    if model_type == "bccd":
        # ResNet50: last residual block of layer4
        return model.layer4[-1]
    elif model_type == "efficientnet":
        # EfficientNet-B0: last block of features sequence
        return model.features[-1]
    else:
        raise ValueError(
            f"Unknown model_type '{model_type}'. Expected 'bccd' or 'efficientnet'."
        )


# ---------------------------------------------------------------------------
# Grad-CAM
# ---------------------------------------------------------------------------

def generate_gradcam(
    model: nn.Module,
    image_tensor: torch.Tensor,
    original_image_bytes: bytes,
    target_class_idx: Optional[int] = None,
    model_type: str = "bccd",
) -> str:
    """
    Generate a Grad-CAM heatmap overlay for the given image.

    The function runs a forward + backward pass through the model to compute
    class-discriminative activation maps, then overlays the result on the
    original (non-preprocessed) image as a colour heatmap.

    All hooks are cleaned up in a try/finally block. The model is restored to
    eval mode with no leftover gradient state after the call returns.

    Args:
        model: PyTorch model in eval mode. Supported architectures: ResNet50,
               EfficientNet-B0.
        image_tensor: Preprocessed input tensor of shape (1, 3, H, W).
        original_image_bytes: Raw bytes of the original image file (JPEG/PNG).
                              Used to produce the final overlay at the correct
                              display resolution.
        target_class_idx: Index of the class to explain. If None, the
                          predicted class (argmax of logits) is used.
        model_type: Architecture identifier used to select the target layer.
                    "bccd" -> model.layer4[-1] (ResNet50)
                    "efficientnet" -> model.features[-1] (EfficientNet-B0)

    Returns:
        A data-URI string of the form "data:image/jpeg;base64,<b64>" containing
        the Grad-CAM heatmap blended over the original image. Suitable for
        direct use in an HTML <img src="..."> attribute.
    """
    # Storage for captured activations and gradients (populated by hooks)
    _activations: list = []
    _gradients: list = []

    def _save_activation(module, input, output):  # noqa: ARG001
        _activations.append(output.detach())

    def _save_gradient(module, grad_input, grad_output):  # noqa: ARG001
        _gradients.append(grad_output[0].detach())

    target_layer = _get_target_layer(model, model_type)

    # Register hooks — always removed in the finally block below
    forward_hook = target_layer.register_forward_hook(_save_activation)
    backward_hook = target_layer.register_full_backward_hook(_save_gradient)

    try:
        model.eval()

        # Clone tensor so we can enable gradients without modifying the caller's tensor
        inp = image_tensor.clone().requires_grad_(True)

        # Forward pass
        logits = model(inp)  # (1, num_classes)

        if target_class_idx is None:
            target_class_idx = int(torch.argmax(logits, dim=1).item())

        # Zero any existing gradients and backpropagate from target class score
        model.zero_grad()
        target_score = logits[0, target_class_idx]
        target_score.backward()

        # Retrieve captured tensors
        activations = _activations[0]  # (1, C, h, w)
        gradients = _gradients[0]      # (1, C, h, w)

        # Compute Grad-CAM weights: global average pool of gradients over spatial dims
        weights = gradients.mean(dim=(2, 3), keepdim=True)  # (1, C, 1, 1)

        # Weighted combination of activations
        cam = (weights * activations).sum(dim=1, keepdim=True)  # (1, 1, h, w)

        # Apply ReLU — only highlight regions that positively influence the class
        cam = torch.clamp(cam, min=0.0)

        # Normalise CAM to [0, 1]
        cam_min = cam.min()
        cam_max = cam.max()
        if cam_max - cam_min > 1e-8:
            cam = (cam - cam_min) / (cam_max - cam_min)
        else:
            cam = torch.zeros_like(cam)

        cam_np = cam.squeeze().cpu().numpy()  # (h, w), values in [0, 1]

    finally:
        # Always remove hooks to prevent memory leaks
        forward_hook.remove()
        backward_hook.remove()
        model.zero_grad()

    # -----------------------------------------------------------------------
    # Build heatmap overlay using PIL + matplotlib colormap (no cv2 needed)
    # -----------------------------------------------------------------------

    # Open the original image (full resolution, no ImageNet preprocessing)
    original_image = Image.open(io.BytesIO(original_image_bytes)).convert("RGB")
    orig_w, orig_h = original_image.size

    # Resize CAM to match original image dimensions
    cam_pil = Image.fromarray(np.uint8(cam_np * 255), mode="L")
    cam_pil = cam_pil.resize((orig_w, orig_h), resample=Image.BILINEAR)
    cam_resized = np.array(cam_pil) / 255.0  # Back to [0, 1]

    # Apply matplotlib 'jet' colormap -> RGBA float array in [0, 1]
    colormap = cm.get_cmap("jet")
    heatmap_rgba = colormap(cam_resized)         # (H, W, 4) float64
    heatmap_rgb = (heatmap_rgba[:, :, :3] * 255).astype(np.uint8)  # (H, W, 3) uint8

    heatmap_pil = Image.fromarray(heatmap_rgb, mode="RGB")

    # Blend heatmap over original image: alpha=0.4 for heatmap, 0.6 for original
    overlay = Image.blend(original_image, heatmap_pil, alpha=0.4)

    # Encode result as JPEG -> base64 data URI
    buffer = io.BytesIO()
    overlay.save(buffer, format="JPEG", quality=90)
    b64_bytes = base64.b64encode(buffer.getvalue()).decode("ascii")

    return f"data:image/jpeg;base64,{b64_bytes}"
