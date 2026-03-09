/**
 * 가우시안 블러 커널 모듈
 *
 * 1D separable convolution (행→열 2-pass) 방식으로 Float32Array에 가우시안 블러를 적용한다.
 * 경계 처리: clamp (경계 픽셀 반복).
 */

/**
 * 1D 가우시안 커널 생성 (정규화 포함)
 * @param size 커널 크기 (홀수)
 */
export function createGaussianKernel(size: number): number[] {
  if (size < 1) {
    throw new Error(`createGaussianKernel: size(${size}) must be >= 1`)
  }
  if (size % 2 === 0) {
    throw new Error(`createGaussianKernel: size(${size}) must be odd`)
  }

  const half = Math.floor(size / 2)
  // sigma = size / 6 (표준 공식: 커널 크기의 약 1/6)
  const sigma = size / 6.0
  const sigma2 = 2 * sigma * sigma

  const kernel: number[] = []
  let sum = 0

  for (let i = -half; i <= half; i++) {
    const val = Math.exp(-(i * i) / sigma2)
    kernel.push(val)
    sum += val
  }

  // 정규화
  return kernel.map((v) => v / sum)
}

/**
 * Float32Array에 가우시안 블러 적용 (separable 2-pass)
 *
 * @param data      입력 데이터 (width * height)
 * @param width     데이터 너비
 * @param height    데이터 높이
 * @param blurRatio 블러 비율 (0.01–0.20); kernelSize = max(3, round(min(w,h) * blurRatio))
 * @returns         블러 적용된 Float32Array (새 배열)
 */
export function applyGaussianBlur(
  data: Float32Array,
  width: number,
  height: number,
  blurRatio: number,
): Float32Array {
  if (width <= 0 || height <= 0) {
    throw new Error(`applyGaussianBlur: width(${width}), height(${height}) must be positive`)
  }
  if (blurRatio <= 0) {
    throw new Error(`applyGaussianBlur: blurRatio(${blurRatio}) must be positive`)
  }

  // kernelSize 계산 및 홀수 보정
  let kernelSize = Math.max(3, Math.round(Math.min(width, height) * blurRatio))
  if (kernelSize % 2 === 0) {
    kernelSize += 1
  }

  const kernel = createGaussianKernel(kernelSize)
  const half = Math.floor(kernelSize / 2)

  // Pass 1: 수평 방향 (행)
  const hBlurred = new Float32Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let acc = 0
      for (let k = -half; k <= half; k++) {
        // clamp
        const sx = Math.max(0, Math.min(width - 1, x + k))
        acc += data[y * width + sx] * kernel[k + half]
      }
      hBlurred[y * width + x] = acc
    }
  }

  // Pass 2: 수직 방향 (열)
  const result = new Float32Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let acc = 0
      for (let k = -half; k <= half; k++) {
        // clamp
        const sy = Math.max(0, Math.min(height - 1, y + k))
        acc += hBlurred[sy * width + x] * kernel[k + half]
      }
      result[y * width + x] = acc
    }
  }

  return result
}
