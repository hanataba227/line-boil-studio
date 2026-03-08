"""
Line Boil Studio — Streamlit 메인 앱
"""

import streamlit as st
from PIL import Image
import datetime
import io

from core.line_boil import generate_gif, PRESETS

# ─── 페이지 설정 ──────────────────────────────────────────
st.set_page_config(
    page_title="Line Boil Studio",
    page_icon="🎨",
    layout="wide",
)

PRESET_KEYS = list(PRESETS.keys())


# ─── 헬퍼 함수 ────────────────────────────────────────────
def _apply_preset(name: str):
    """프리셋 값을 slider_* session state에 반영."""
    p = PRESETS.get(name)
    if p:
        st.session_state.slider_frame_count = p["frame_count"]
        st.session_state.slider_fps         = p["fps"]
        st.session_state.slider_strength    = float(p["strength"])
        st.session_state.slider_scale       = p["scale"]
        st.session_state.slider_blur_ratio  = float(p["blur_ratio"])


def _detect_preset() -> str:
    """현재 slider_* 값이 어떤 프리셋과 일치하는지 반환. 없으면 Custom."""
    fc       = st.session_state.slider_frame_count
    fps      = st.session_state.slider_fps
    strength = st.session_state.slider_strength
    scale    = st.session_state.slider_scale
    blur     = st.session_state.slider_blur_ratio
    for name, p in PRESETS.items():
        if p is None:
            continue
        if (fc == p["frame_count"]
                and fps == p["fps"]
                and abs(strength - float(p["strength"])) < 0.01
                and scale == p["scale"]
                and abs(blur - float(p["blur_ratio"])) < 0.001):
            return name
    return "Custom (직접 설정)"


def on_slider_change():
    """슬라이더 변경 시 프리셋 자동 감지."""
    st.session_state.p_preset = _detect_preset()


# ─── 세션 초기화 (최초 1회) ───────────────────────────────
if "slider_frame_count" not in st.session_state:
    st.session_state.p_preset           = PRESET_KEYS[0]
    st.session_state.slider_output_size = 720
    _apply_preset(PRESET_KEYS[0])

# 프리셋 퀵-스위치 버튼 처리
if "_switch_preset" in st.session_state:
    target = st.session_state.pop("_switch_preset")
    st.session_state.p_preset = target
    _apply_preset(target)


# ─── 사이드바 ─────────────────────────────────────────────
with st.sidebar:
    st.header("⚙️ 설정")

    st.divider()
    st.subheader("🎛️ 프리셋")

    for pname in PRESET_KEYS:
        is_active = st.session_state.get("p_preset") == pname
        if st.button(
            pname,
            type="primary" if is_active else "secondary",
            use_container_width=True,
            key=f"sb_btn_{pname}",
        ):
            st.session_state["_switch_preset"] = pname
            st.rerun()

    st.divider()
    st.subheader("현재 파라미터")
    st.markdown(f"""
| 항목 | 값 |
|---|---|
| 프레임 수 | `{st.session_state.get('slider_frame_count', '-')}` |
| FPS | `{st.session_state.get('slider_fps', '-')}` |
| 변형 강도 | `{st.session_state.get('slider_strength', '-')}` |
| 변형 규모 | `{st.session_state.get('slider_scale', '-')}` |
| 블러 강도 | `{st.session_state.get('slider_blur_ratio', '-')}` |
| 출력 크기 | `{st.session_state.get('slider_output_size', '-')}px` |
""")
    st.caption("세부 수치는 오른쪽 화면에서 변경하세요.")


# ─── 메인 영역 ────────────────────────────────────────────
st.title("🎨 Line Boil Studio")
st.caption("이미지를 업로드해서 Line Boil(선 떨림) GIF를 만들어보세요.")

# ── 이미지 업로드 ─────────────────────────────────────────
uploaded = st.file_uploader(
    "🖼️ 이미지 업로드 (PNG / JPG)",
    type=["png", "jpg", "jpeg"],
    help="PNG 또는 JPG 이미지를 업로드하세요.",
)

# 프리셋 변경 등 rerun 후에도 이미지가 유지되도록 session_state에 캐싱
if uploaded is not None:
    st.session_state["_img_bytes"] = uploaded.read()
    st.session_state["_img_name"]  = uploaded.name
    st.session_state["_img_type"]  = uploaded.type

st.divider()

# ── 파라미터 패널 (슬라이더 key = slider_*, 전체 유일) ─────
with st.expander("📋 파라미터 설정", expanded=True):
    pc1, pc2, pc3 = st.columns(3)
    with pc1:
        st.slider(
            "프레임 수", 2, 12,
            key="slider_frame_count",
            on_change=on_slider_change,
            help="GIF를 구성하는 프레임 수. 많을수록 파일 크기 증가",
        )
        st.slider(
            "FPS (속도)", 1, 24,
            key="slider_fps",
            on_change=on_slider_change,
            help="초당 프레임 수. 높을수록 빠르게 넘어감",
        )
    with pc2:
        st.slider(
            "변형 강도", 0.1, 5.0, step=0.1,
            key="slider_strength",
            on_change=on_slider_change,
            help="픽셀 단위 최대 변위. 높을수록 많이 흔들림",
        )
        st.slider(
            "변형 규모 (Scale)", 4, 64, step=4,
            key="slider_scale",
            on_change=on_slider_change,
            help="높을수록 큰 덩어리로 부드럽게 변형. 낮을수록 자글자글",
        )
    with pc3:
        st.slider(
            "블러 강도 (Blur)", 0.01, 0.20, step=0.01,
            key="slider_blur_ratio",
            on_change=on_slider_change,
            help="변형 경계 부드러움. 높을수록 더 매끄럽게 이어짐",
        )
        st.number_input(
            "출력 크기 (가로 px)", 64, 2048, step=64,
            key="slider_output_size",
            help="출력 GIF 가로 크기. 원본 비율은 자동 유지",
        )

st.divider()

if "_img_bytes" not in st.session_state:
    st.info("⬆️ 위에서 이미지를 업로드하세요.")
    st.stop()

pil_image = Image.open(io.BytesIO(st.session_state["_img_bytes"]))
orig_w, orig_h = pil_image.size

col1, col2 = st.columns(2)
with col1:
    st.subheader("원본 이미지")
    st.image(pil_image, use_container_width=True)
    st.caption(f"{orig_w} × {orig_h}px · {st.session_state['_img_type']}")

if st.button("🔄 Line Boil GIF 생성", type="primary"):
    with st.spinner("GIF 생성 중..."):
        gif_bytes = generate_gif(
            pil_image=pil_image,
            frame_count=st.session_state.slider_frame_count,
            fps=st.session_state.slider_fps,
            strength=st.session_state.slider_strength,
            scale=st.session_state.slider_scale,
            blur_ratio=st.session_state.slider_blur_ratio,
            output_size=st.session_state.slider_output_size,
        )
    st.session_state["gif_bytes"] = gif_bytes
    st.session_state["gif_filename"] = (
        f"lineboil_{uploaded.name.rsplit('.', 1)[0]}"
        f"_{datetime.datetime.now().strftime('%H%M%S')}.gif"
    )

if "gif_bytes" in st.session_state:
    with col2:
        st.subheader("Line Boil GIF")
        st.image(st.session_state["gif_bytes"], use_container_width=True)
        st.caption(
            f"프리셋: {st.session_state.p_preset} · "
            f"프레임: {st.session_state.slider_frame_count} · "
            f"FPS: {st.session_state.slider_fps} · "
            f"강도: {st.session_state.slider_strength}"
        )

    st.divider()
    st.download_button(
        label="⬇️ GIF 다운로드",
        data=st.session_state["gif_bytes"],
        file_name=st.session_state["gif_filename"],
        mime="image/gif",
    )
