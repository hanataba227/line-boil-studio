import { describe, it, expect } from 'vitest'
import { calcOutputSize } from '../dpi'

describe('calcOutputSize', () => {
  it('dpi=null이면 원본 크기를 반환한다', () => {
    const result = calcOutputSize(800, 600, null, false)
    expect(result.w).toBe(800)
    expect(result.h).toBe(600)
  })

  it('preserveOriginalDpi=true이면 원본 크기를 반환한다', () => {
    // dpi=72이지만 preserveOriginalDpi=true이므로 원본 크기 반환
    const result = calcOutputSize(800, 600, 72, true)
    expect(result.w).toBe(800)
    expect(result.h).toBe(600)
  })

  it('dpi=72일 때 300/72 배율로 확대한다', () => {
    const origW = 720
    const origH = 540
    const result = calcOutputSize(origW, origH, 72, false)

    // 예상: 720/72*300 = 3000, 540/72*300 = 2250
    expect(result.w).toBe(3000)
    expect(result.h).toBe(2250)
  })

  it('dpi=300이면 원본 크기를 반환한다', () => {
    // dpi === TARGET_DPI(300)이므로 변환 없이 원본 크기 반환
    const result = calcOutputSize(1200, 900, 300, false)
    expect(result.w).toBe(1200)
    expect(result.h).toBe(900)
  })

  it('결과가 4096px를 초과하면 4096으로 클램핑한다', () => {
    // origW=1400, dpi=72 → 1400/72*300 ≈ 5833 → 4096으로 클램핑
    const result = calcOutputSize(1400, 200, 72, false)
    expect(result.w).toBeLessThanOrEqual(4096)
    expect(result.h).toBeLessThanOrEqual(4096)
  })

  it('클램핑 시 width만 제한되고 height는 비율 유지한다', () => {
    // origW=2000, origH=100, dpi=72
    // 변환: w=2000/72*300≈8333, h=100/72*300≈417
    // w>4096이므로 ratio=4096/8333≈0.4916
    // 결과: w=4096, h=round(417*0.4916)≈205
    const result = calcOutputSize(2000, 100, 72, false)
    expect(result.w).toBe(4096)

    // 비율 확인: w/h ≈ origW/origH = 20/1
    const origRatio = 2000 / 100
    const resultRatio = result.w / result.h
    expect(resultRatio).toBeCloseTo(origRatio, 0)
  })

  it('dpi=null이고 원본이 4096 초과면 클램핑한다', () => {
    const result = calcOutputSize(5000, 3000, null, false)
    expect(result.w).toBeLessThanOrEqual(4096)
    expect(result.h).toBeLessThanOrEqual(4096)
  })
})
