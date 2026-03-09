import { describe, it, expect } from 'vitest'
import { remapFrame } from '../remap'

// jsdom 환경에서 ImageData를 직접 생성해 테스트
describe('remapFrame', () => {
  it('dx=dy=0이면 원본 픽셀과 동일한 결과를 반환한다', () => {
    const width = 4
    const height = 4
    const src = new ImageData(width, height)

    // 각 픽셀에 고유한 색상 설정
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        src.data[i] = x * 60         // R
        src.data[i + 1] = y * 60     // G
        src.data[i + 2] = 128        // B
        src.data[i + 3] = 255        // A
      }
    }

    const dx = new Float32Array(width * height).fill(0)
    const dy = new Float32Array(width * height).fill(0)

    const result = remapFrame(src, dx, dy)

    // dx=dy=0이면 원본과 동일해야 한다
    for (let i = 0; i < src.data.length; i++) {
      expect(result.data[i]).toBe(src.data[i])
    }
  })

  it('출력 ImageData의 width/height가 입력과 동일하다', () => {
    const width = 8
    const height = 6
    const src = new ImageData(width, height)
    const dx = new Float32Array(width * height).fill(0)
    const dy = new Float32Array(width * height).fill(0)

    const result = remapFrame(src, dx, dy)

    expect(result.width).toBe(width)
    expect(result.height).toBe(height)
    expect(result.data).toHaveLength(width * height * 4)
  })

  it('범위 밖 displacement에서 오류 없이 동작한다 (clamp 확인)', () => {
    const width = 4
    const height = 4
    const src = new ImageData(width, height)

    // 픽셀 초기화
    for (let i = 0; i < src.data.length; i += 4) {
      src.data[i] = 100
      src.data[i + 1] = 150
      src.data[i + 2] = 200
      src.data[i + 3] = 255
    }

    // 매우 큰 displacement (이미지 크기를 훨씬 초과)
    const dx = new Float32Array(width * height).fill(9999)
    const dy = new Float32Array(width * height).fill(9999)

    expect(() => {
      const result = remapFrame(src, dx, dy)
      expect(result).toBeInstanceOf(ImageData)
      expect(result.width).toBe(width)
      expect(result.height).toBe(height)
    }).not.toThrow()
  })

  it('알파 채널(투명도)이 보존된다', () => {
    const width = 4
    const height = 4
    const src = new ImageData(width, height)

    // 각 픽셀에 다른 알파 값 설정
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        src.data[i] = 255       // R
        src.data[i + 1] = 0     // G
        src.data[i + 2] = 0     // B
        src.data[i + 3] = 128   // A (반투명)
      }
    }

    const dx = new Float32Array(width * height).fill(0)
    const dy = new Float32Array(width * height).fill(0)

    const result = remapFrame(src, dx, dy)

    // 알파 채널이 128로 유지되어야 한다
    for (let i = 3; i < result.data.length; i += 4) {
      expect(result.data[i]).toBe(128)
    }
  })

  it('displacement map 크기 불일치 시 에러를 던진다', () => {
    const width = 4
    const height = 4
    const src = new ImageData(width, height)

    const dx = new Float32Array(10)  // 잘못된 크기
    const dy = new Float32Array(width * height)

    expect(() => remapFrame(src, dx, dy)).toThrow()
  })
})
