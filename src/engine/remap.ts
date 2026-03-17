/**
 * 픽셀 리매핑 모듈
 *
 * Displacement Map(dx, dy)을 이용해 원본 ImageData의 각 픽셀을
 * 새 좌표에서 bilinear 보간 샘플링하여 변형된 ImageData를 반환한다.
 * - RGBA 4채널 모두 처리
 * - 범위 밖 좌표는 clamp (0 ~ width-1, 0 ~ height-1)
 * - 알파 채널 보존
 */

/**
 * ImageData에서 bilinear 보간 RGBA 샘플링
 *
 * @param srcData 원본 ImageData
 * @param x       샘플링할 x 좌표 (실수, clamp 적용됨)
 * @param y       샘플링할 y 좌표 (실수, clamp 적용됨)
 * @returns       [r, g, b, a] 각 0–255
 */
export function bilinearSampleRGBA(
  srcData: ImageData,
  x: number,
  y: number,
): [number, number, number, number] {
  const { width, height, data } = srcData

  // clamp
  const cx = Math.max(0, Math.min(width - 1, x))
  const cy = Math.max(0, Math.min(height - 1, y))

  const x0 = Math.max(0, Math.min(width - 1, Math.floor(cx)))
  const x1 = Math.max(0, Math.min(width - 1, x0 + 1))
  const y0 = Math.max(0, Math.min(height - 1, Math.floor(cy)))
  const y1 = Math.max(0, Math.min(height - 1, y0 + 1))

  const tx = cx - x0
  const ty = cy - y0

  const idx00 = (y0 * width + x0) * 4
  const idx10 = (y0 * width + x1) * 4
  const idx01 = (y1 * width + x0) * 4
  const idx11 = (y1 * width + x1) * 4

  const result: [number, number, number, number] = [0, 0, 0, 0]
  for (let c = 0; c < 4; c++) {
    result[c] = Math.round(
      data[idx00 + c] * (1 - tx) * (1 - ty) +
      data[idx10 + c] * tx * (1 - ty) +
      data[idx01 + c] * (1 - tx) * ty +
      data[idx11 + c] * tx * ty,
    )
  }

  return result
}

/**
 * Displacement Map 적용 → 변형된 ImageData 반환
 *
 * @param srcData 원본 ImageData
 * @param dx      x축 변위 배열 (width * height)
 * @param dy      y축 변위 배열 (width * height)
 * @param output  재사용할 ImageData (생략 시 새로 생성)
 * @returns       변형된 ImageData
 */
export function remapFrame(
  srcData: ImageData,
  dx: Float32Array,
  dy: Float32Array,
  output?: ImageData,
): ImageData {
  const { width, height } = srcData

  if (dx.length !== width * height || dy.length !== width * height) {
    throw new Error(
      `remapFrame: displacement map size mismatch. ` +
      `Expected ${width * height}, got dx=${dx.length}, dy=${dy.length}`,
    )
  }

  const out = output ?? new ImageData(width, height)
  const src = srcData.data
  const dst = out.data
  const wMax = width - 1
  const hMax = height - 1
  const w4 = width * 4

  for (let y = 0; y < height; y++) {
    const yOff = y * width
    for (let x = 0; x < width; x++) {
      const i = yOff + x

      // 브랜치리스 clamp
      let cx = x + dx[i]
      let cy = y + dy[i]
      cx = cx < 0 ? 0 : cx > wMax ? wMax : cx
      cy = cy < 0 ? 0 : cy > hMax ? hMax : cy

      const x0 = cx | 0
      const y0 = cy | 0
      const x1 = x0 < wMax ? x0 + 1 : wMax
      const y1 = y0 < hMax ? y0 + 1 : hMax

      const tx = cx - x0
      const ty = cy - y0
      const tx1 = 1 - tx
      const ty1 = 1 - ty

      const w00 = tx1 * ty1
      const w10 = tx * ty1
      const w01 = tx1 * ty
      const w11 = tx * ty

      const r0 = y0 * w4
      const r1 = y1 * w4
      const c0 = x0 * 4
      const c1 = x1 * 4
      const idx00 = r0 + c0
      const idx10 = r0 + c1
      const idx01 = r1 + c0
      const idx11 = r1 + c1

      const outIdx = i * 4
      dst[outIdx]     = (src[idx00] * w00 + src[idx10] * w10 + src[idx01] * w01 + src[idx11] * w11 + 0.5) | 0
      dst[outIdx + 1] = (src[idx00 + 1] * w00 + src[idx10 + 1] * w10 + src[idx01 + 1] * w01 + src[idx11 + 1] * w11 + 0.5) | 0
      dst[outIdx + 2] = (src[idx00 + 2] * w00 + src[idx10 + 2] * w10 + src[idx01 + 2] * w01 + src[idx11 + 2] * w11 + 0.5) | 0
      dst[outIdx + 3] = (src[idx00 + 3] * w00 + src[idx10 + 3] * w10 + src[idx01 + 3] * w01 + src[idx11 + 3] * w11 + 0.5) | 0
    }
  }

  return out
}
