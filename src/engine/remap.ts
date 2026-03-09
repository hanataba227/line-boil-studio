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
 * @returns       변형된 새 ImageData
 */
export function remapFrame(
  srcData: ImageData,
  dx: Float32Array,
  dy: Float32Array,
): ImageData {
  const { width, height } = srcData

  if (dx.length !== width * height || dy.length !== width * height) {
    throw new Error(
      `remapFrame: displacement map size mismatch. ` +
      `Expected ${width * height}, got dx=${dx.length}, dy=${dy.length}`,
    )
  }

  const output = new ImageData(width, height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x

      const srcX = x + dx[i]
      const srcY = y + dy[i]

      const [r, g, b, a] = bilinearSampleRGBA(srcData, srcX, srcY)

      const outIdx = i * 4
      output.data[outIdx] = r
      output.data[outIdx + 1] = g
      output.data[outIdx + 2] = b
      output.data[outIdx + 3] = a
    }
  }

  return output
}
