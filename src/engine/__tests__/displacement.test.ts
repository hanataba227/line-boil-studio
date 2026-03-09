import { describe, it, expect } from 'vitest'
import { generateDisplacementMap } from '../displacement'

describe('generateDisplacementMap', () => {
  it('width × height 크기의 dx, dy Float32Array를 반환한다', () => {
    const width = 10
    const height = 8
    const { dx, dy } = generateDisplacementMap(width, height, 8, 2.0)

    expect(dx).toBeInstanceOf(Float32Array)
    expect(dy).toBeInstanceOf(Float32Array)
    expect(dx).toHaveLength(width * height)
    expect(dy).toHaveLength(width * height)
  })

  it('dx, dy 값이 [-strength, +strength] 범위 안에 있다', () => {
    const strength = 3.0
    const { dx, dy } = generateDisplacementMap(20, 20, 8, strength)

    for (let i = 0; i < dx.length; i++) {
      expect(dx[i]).toBeGreaterThanOrEqual(-strength)
      expect(dx[i]).toBeLessThanOrEqual(strength)
    }
    for (let i = 0; i < dy.length; i++) {
      expect(dy[i]).toBeGreaterThanOrEqual(-strength)
      expect(dy[i]).toBeLessThanOrEqual(strength)
    }
  })

  it('다른 호출에서 다른 노이즈를 생성한다 (랜덤성 확인)', () => {
    const map1 = generateDisplacementMap(16, 16, 8, 2.0)
    const map2 = generateDisplacementMap(16, 16, 8, 2.0)

    // 두 배열이 완전히 동일할 가능성은 거의 없다
    let allSame = true
    for (let i = 0; i < map1.dx.length; i++) {
      if (map1.dx[i] !== map2.dx[i]) {
        allSame = false
        break
      }
    }
    expect(allSame).toBe(false)
  })

  it('scale이 매우 작을 때도 정상 동작한다 (scale=4)', () => {
    const width = 32
    const height = 32
    const { dx, dy } = generateDisplacementMap(width, height, 4, 1.5)

    expect(dx).toHaveLength(width * height)
    expect(dy).toHaveLength(width * height)

    // 모든 값이 유한한 숫자여야 한다
    for (let i = 0; i < dx.length; i++) {
      expect(Number.isFinite(dx[i])).toBe(true)
      expect(Number.isFinite(dy[i])).toBe(true)
    }
  })

  it('width 또는 height가 1일 때도 오류 없이 동작한다', () => {
    // width=1
    expect(() => {
      const { dx, dy } = generateDisplacementMap(1, 10, 4, 1.0)
      expect(dx).toHaveLength(10)
      expect(dy).toHaveLength(10)
    }).not.toThrow()

    // height=1
    expect(() => {
      const { dx, dy } = generateDisplacementMap(10, 1, 4, 1.0)
      expect(dx).toHaveLength(10)
      expect(dy).toHaveLength(10)
    }).not.toThrow()

    // width=1, height=1
    expect(() => {
      const { dx, dy } = generateDisplacementMap(1, 1, 4, 1.0)
      expect(dx).toHaveLength(1)
      expect(dy).toHaveLength(1)
    }).not.toThrow()
  })
})
