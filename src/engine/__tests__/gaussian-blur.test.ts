import { describe, it, expect } from 'vitest'
import { createGaussianKernel, applyGaussianBlur } from '../gaussian-blur'

describe('createGaussianKernel', () => {
  it('반환된 커널의 합이 1.0에 수렴한다 (±0.001)', () => {
    const sizes = [3, 5, 7, 11, 15]
    for (const size of sizes) {
      const kernel = createGaussianKernel(size)
      const sum = kernel.reduce((a, b) => a + b, 0)
      expect(sum).toBeCloseTo(1.0, 3)
    }
  })

  it('커널 크기가 홀수임을 보장한다', () => {
    // 홀수 입력
    const kernel3 = createGaussianKernel(3)
    expect(kernel3.length).toBe(3)
    expect(kernel3.length % 2).toBe(1)

    const kernel7 = createGaussianKernel(7)
    expect(kernel7.length).toBe(7)
    expect(kernel7.length % 2).toBe(1)

    // 짝수 입력은 에러를 던진다 (구현이 짝수 거부)
    expect(() => createGaussianKernel(4)).toThrow()
    expect(() => createGaussianKernel(6)).toThrow()
  })

  it('size=3일 때 중앙값이 최대임을 확인한다', () => {
    const kernel = createGaussianKernel(3)
    expect(kernel).toHaveLength(3)

    const center = kernel[1]
    const left = kernel[0]
    const right = kernel[2]

    expect(center).toBeGreaterThan(left)
    expect(center).toBeGreaterThan(right)
  })

  it('size=1일 때 커널 합이 1.0이고 단일 값이 1.0이다', () => {
    const kernel = createGaussianKernel(1)
    expect(kernel).toHaveLength(1)
    expect(kernel[0]).toBeCloseTo(1.0, 5)
  })
})

describe('applyGaussianBlur', () => {
  it('출력 배열 길이가 입력과 동일하다', () => {
    const width = 10
    const height = 8
    const data = new Float32Array(width * height).fill(0.5)
    const result = applyGaussianBlur(data, width, height, 0.1)

    expect(result).toBeInstanceOf(Float32Array)
    expect(result).toHaveLength(width * height)
  })

  it('균일한 값의 배열에 블러를 적용하면 값이 유지된다', () => {
    const width = 20
    const height = 20
    const constValue = 0.7
    const data = new Float32Array(width * height).fill(constValue)
    const result = applyGaussianBlur(data, width, height, 0.1)

    // 균일한 배열은 블러 후에도 동일한 값이어야 한다
    for (let i = 0; i < result.length; i++) {
      expect(result[i]).toBeCloseTo(constValue, 5)
    }
  })

  it('blurRatio=0.01일 때도 오류 없이 동작한다 (최소 커널)', () => {
    const width = 50
    const height = 50
    const data = new Float32Array(width * height).fill(0.5)

    expect(() => {
      const result = applyGaussianBlur(data, width, height, 0.01)
      expect(result).toHaveLength(width * height)
    }).not.toThrow()
  })

  it('blurRatio=0.20일 때도 정상 동작한다 (최대 커널)', () => {
    const width = 30
    const height = 30
    const data = new Float32Array(width * height)
    // 중앙에 스파이크를 넣고 블러 후 주변으로 퍼지는지 확인
    data[15 * 30 + 15] = 1.0

    const result = applyGaussianBlur(data, width, height, 0.20)
    expect(result).toHaveLength(width * height)

    // 스파이크 위치의 값은 블러 후 감소해야 한다
    expect(result[15 * 30 + 15]).toBeLessThan(1.0)
    // 스파이크 인근 값은 0보다 커야 한다
    expect(result[14 * 30 + 15]).toBeGreaterThan(0)
  })
})
