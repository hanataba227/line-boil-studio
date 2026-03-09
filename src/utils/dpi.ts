/**
 * DPI 계산 유틸리티
 *
 * PRD/02_DATA_MODEL.md의 DPI 계산 로직 기반.
 * 출력 크기가 4096px 초과 시 비율 유지하며 클램핑.
 */

const MAX_PX = 4096
const TARGET_DPI = 300

/**
 * 출력 이미지 크기 계산
 *
 * @param origW           원본 이미지 가로 픽셀
 * @param origH           원본 이미지 세로 픽셀
 * @param dpi             EXIF에서 파싱한 DPI (없으면 null)
 * @param preserveOriginalDpi true이면 DPI 변환 건너뜀
 * @returns               출력 { w, h } 픽셀 (4096px 클램핑 적용)
 */
export function calcOutputSize(
  origW: number,
  origH: number,
  dpi: number | null,
  preserveOriginalDpi: boolean,
): { w: number; h: number } {
  if (dpi !== null && dpi !== TARGET_DPI && !preserveOriginalDpi) {
    let w = (origW / dpi) * TARGET_DPI
    let h = (origH / dpi) * TARGET_DPI

    // 4096px 클램핑 (비율 유지)
    if (w > MAX_PX || h > MAX_PX) {
      const ratio = Math.min(MAX_PX / w, MAX_PX / h)
      w = Math.round(w * ratio)
      h = Math.round(h * ratio)
    } else {
      w = Math.round(w)
      h = Math.round(h)
    }

    return { w, h }
  }

  // DPI 정보 없거나 보존 활성 → 원본 크기 사용 (4096 클램핑만 적용)
  let w = origW
  let h = origH
  if (w > MAX_PX || h > MAX_PX) {
    const ratio = Math.min(MAX_PX / w, MAX_PX / h)
    w = Math.round(w * ratio)
    h = Math.round(h * ratio)
  }

  return { w, h }
}
