/**
 * Displacement Map 생성 모듈
 *
 * 저해상도 랜덤 노이즈를 생성한 뒤 bilinear 보간으로 원본 해상도로 업스케일하고,
 * strength 계수를 곱해 픽셀 단위 최대 변위(dx, dy)를 반환한다.
 * 가우시안 블러는 gaussian-blur.ts의 applyGaussianBlur()에서 별도 적용한다.
 */

/**
 * 배열에서 bilinear 보간 샘플링
 * @param arr  1D 배열 (row-major)
 * @param w    배열의 너비
 * @param h    배열의 높이
 * @param x    샘플링할 x 좌표 (실수)
 * @param y    샘플링할 y 좌표 (실수)
 */
export function bilinearSample(
  arr: Float32Array,
  w: number,
  h: number,
  x: number,
  y: number,
): number {
  // clamp 좌표
  const x0 = Math.max(0, Math.min(w - 1, Math.floor(x)))
  const x1 = Math.max(0, Math.min(w - 1, x0 + 1))
  const y0 = Math.max(0, Math.min(h - 1, Math.floor(y)))
  const y1 = Math.max(0, Math.min(h - 1, y0 + 1))

  const tx = x - Math.floor(x)
  const ty = y - Math.floor(y)

  const v00 = arr[y0 * w + x0]
  const v10 = arr[y0 * w + x1]
  const v01 = arr[y1 * w + x0]
  const v11 = arr[y1 * w + x1]

  return (
    v00 * (1 - tx) * (1 - ty) +
    v10 * tx * (1 - ty) +
    v01 * (1 - tx) * ty +
    v11 * tx * ty
  )
}

export interface DisplacementMap {
  dx: Float32Array
  dy: Float32Array
}

/**
 * Displacement Map 생성
 *
 * @param width    출력 이미지 너비 (px)
 * @param height   출력 이미지 높이 (px)
 * @param scale    노이즈 공간 크기 (클수록 변위가 넓은 영역에 분포)
 * @param strength 픽셀 단위 최대 변위
 * @returns        { dx, dy } — 각각 width * height 크기의 Float32Array
 */
export function generateDisplacementMap(
  width: number,
  height: number,
  scale: number,
  strength: number,
): DisplacementMap {
  if (width <= 0 || height <= 0) {
    throw new Error(`generateDisplacementMap: width(${width}), height(${height}) must be positive`)
  }
  if (scale <= 0) {
    throw new Error(`generateDisplacementMap: scale(${scale}) must be positive`)
  }

  const noiseH = Math.ceil(height / scale)
  const noiseW = Math.ceil(width / scale)

  // 저해상도 랜덤 노이즈 생성 (dx, dy 별도)
  const lowResDx = new Float32Array(noiseH * noiseW)
  const lowResDy = new Float32Array(noiseH * noiseW)
  for (let i = 0; i < noiseH * noiseW; i++) {
    lowResDx[i] = Math.random()
    lowResDy[i] = Math.random()
  }

  // 원본 해상도로 bilinear 업스케일 후 strength 곱하기
  const dx = new Float32Array(width * height)
  const dy = new Float32Array(width * height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // 저해상도 좌표로 변환
      const nx = (x / width) * (noiseW - 1)
      const ny = (y / height) * (noiseH - 1)

      const sampledDx = bilinearSample(lowResDx, noiseW, noiseH, nx, ny)
      const sampledDy = bilinearSample(lowResDy, noiseW, noiseH, nx, ny)

      // (noise - 0.5) * 2 * strength
      dx[y * width + x] = (sampledDx - 0.5) * 2 * strength
      dy[y * width + x] = (sampledDy - 0.5) * 2 * strength
    }
  }

  return { dx, dy }
}
