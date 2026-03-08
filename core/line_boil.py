"""
Line Boil 핵심 엔진
- 이미지 전체에 저주파 displacement map 적용
- 색상 유지 + 투명 배경 보존
"""

import cv2
import numpy as np
from PIL import Image
import io


# ─── 프리셋 정의 ──────────────────────────────────────────
PRESETS = {
    "Preset 1 — Subtle (섬세)": {
        "frame_count": 3,
        "fps": 8,
        "strength": 1.0,
        "scale": 32,
        "blur_ratio": 0.02,
    },
    "Preset 2 — Soft (부드러움)": {
        "frame_count": 3,
        "fps": 8,
        "strength": 1.0,
        "scale": 32,
        "blur_ratio": 0.10,
    },
    "Preset 3 — Bold (역동적)": {
        "frame_count": 3,
        "fps": 8,
        "strength": 2.0,
        "scale": 16,
        "blur_ratio": 0.10,
    },
    "Custom (직접 설정)": None,
}


def apply_displacement(
    img_rgba: np.ndarray,
    strength: float,
    scale: int,
    blur_ratio: float,
) -> np.ndarray:
    """
    이미지 전체에 랜덤 displacement map 적용.
    - scale: 높을수록 큰 덩어리 단위로 변형 (부드러움)
    - blur_ratio: min(h,w) 대비 비율로 Gaussian blur 강도 결정
    """
    h, w = img_rgba.shape[:2]

    noise_h = max(h // scale, 4)
    noise_w = max(w // scale, 4)

    dx_small = (np.random.rand(noise_h, noise_w).astype(np.float32) * 2 - 1)
    dy_small = (np.random.rand(noise_h, noise_w).astype(np.float32) * 2 - 1)

    dx = cv2.resize(dx_small, (w, h), interpolation=cv2.INTER_CUBIC) * strength
    dy = cv2.resize(dy_small, (w, h), interpolation=cv2.INTER_CUBIC) * strength

    blur_size = max(int(min(h, w) * blur_ratio), 3)
    blur_k = blur_size if blur_size % 2 == 1 else blur_size + 1
    dx = cv2.GaussianBlur(dx, (blur_k, blur_k), 0)
    dy = cv2.GaussianBlur(dy, (blur_k, blur_k), 0)

    map_x, map_y = np.meshgrid(
        np.arange(w, dtype=np.float32),
        np.arange(h, dtype=np.float32),
    )
    map_x += dx
    map_y += dy

    return cv2.remap(
        img_rgba, map_x, map_y,
        interpolation=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(0, 0, 0, 0),
    )


def generate_gif(
    pil_image: Image.Image,
    frame_count: int,
    fps: int,
    strength: float,
    scale: int,
    blur_ratio: float,
    output_size: int | None = None,
) -> bytes:
    """
    PIL 이미지 → Line Boil GIF bytes 반환.

    Args:
        pil_image:    입력 이미지 (PIL.Image)
        frame_count:  생성할 프레임 수
        fps:          초당 프레임 수
        strength:     변위 강도 (픽셀 단위 최대 변위)
        scale:        노이즈 스케일 (높을수록 부드러운 변형)
        blur_ratio:   블러 비율 (이미지 최소 변 대비)
        output_size:  출력 이미지 가로 크기(px). None이면 원본 크기 유지

    Returns:
        GIF 파일 bytes
    """
    img = pil_image.convert("RGBA")

    if output_size is not None:
        orig_w, orig_h = img.size
        ratio = output_size / orig_w
        new_h = max(1, int(orig_h * ratio))
        img = img.resize((output_size, new_h), Image.LANCZOS)

    img_rgba = np.array(img)

    duration_ms = int(1000 / fps)
    frames = [
        Image.fromarray(apply_displacement(img_rgba, strength, scale, blur_ratio), mode="RGBA")
        for _ in range(frame_count)
    ]

    buf = io.BytesIO()
    frames[0].save(
        buf,
        format="GIF",
        save_all=True,
        append_images=frames[1:],
        loop=0,
        duration=duration_ms,
        disposal=2,
    )
    return buf.getvalue()
