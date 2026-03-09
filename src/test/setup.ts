import '@testing-library/jest-dom'

// jsdom에서 ImageData 미지원 시 폴리필
if (typeof ImageData === 'undefined') {
  ;(globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray
    width: number
    height: number
    colorSpace: PredefinedColorSpace = 'srgb'
    constructor(widthOrData: number | Uint8ClampedArray, heightOrWidth: number, height?: number) {
      if (typeof widthOrData === 'number') {
        this.width = widthOrData
        this.height = heightOrWidth
        this.data = new Uint8ClampedArray(widthOrData * heightOrWidth * 4)
      } else {
        this.data = widthOrData
        this.width = heightOrWidth
        this.height = height!
      }
    }
  } as unknown as typeof ImageData
}
