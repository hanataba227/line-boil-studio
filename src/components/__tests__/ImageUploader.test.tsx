import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import ImageUploader from '../ImageUploader'

// exif-js 모듈 mock
vi.mock('exif-js', () => ({
  default: {
    getData: (_file: unknown, callback: () => void) => {
      callback.call({})
    },
    getTag: () => null,
  },
}))

// FileReader mock
class MockFileReader {
  onload: ((e: { target: { result: string } }) => void) | null = null
  onerror: (() => void) | null = null
  result: string = ''

  readAsDataURL(_file: File) {
    // 즉시 onload 호출
    setTimeout(() => {
      this.result = 'data:image/png;base64,abc123'
      if (this.onload) {
        this.onload({ target: { result: this.result } })
      }
    }, 0)
  }
}

// Image mock
class MockImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  naturalWidth = 100
  naturalHeight = 80
  private _src = ''

  get src() {
    return this._src
  }
  set src(value: string) {
    this._src = value
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 0)
  }
}

describe('ImageUploader', () => {
  beforeEach(() => {
    vi.stubGlobal('FileReader', MockFileReader)
    vi.stubGlobal('Image', MockImage)
  })

  it('드롭존 영역이 렌더링된다', () => {
    const onUpload = vi.fn()
    render(<ImageUploader onUpload={onUpload} imageFile={null} />)

    const dropZone = screen.getByRole('button', {
      name: /이미지 드래그앤드롭 영역 또는 클릭하여 파일 선택/i,
    })
    expect(dropZone).toBeInTheDocument()
  })

  it('파일 선택 버튼이 있다 (클릭 가능한 드롭존)', () => {
    const onUpload = vi.fn()
    render(<ImageUploader onUpload={onUpload} imageFile={null} />)

    // 드롭존 자체가 버튼 역할을 한다
    const dropZone = screen.getByRole('button')
    expect(dropZone).toBeInTheDocument()

    // 파일 input이 hidden으로 존재한다
    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveAttribute('accept', 'image/png,image/jpeg,image/jpg')
  })

  it('20MB 초과 파일에 대해 에러 메시지를 표시한다', async () => {
    const onUpload = vi.fn()
    render(<ImageUploader onUpload={onUpload} imageFile={null} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    // 21MB 파일 생성
    const largeFile = new File(['x'.repeat(21 * 1024 * 1024)], 'large.png', {
      type: 'image/png',
    })

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [largeFile] } })
    })

    const errorMsg = await screen.findByRole('alert')
    expect(errorMsg).toBeInTheDocument()
    expect(errorMsg.textContent).toMatch(/20MB/)
  })

  it('PNG/JPG 이외 파일에 대해 에러 메시지를 표시한다', async () => {
    const onUpload = vi.fn()
    render(<ImageUploader onUpload={onUpload} imageFile={null} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    const gifFile = new File(['GIF89a'], 'test.gif', { type: 'image/gif' })

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [gifFile] } })
    })

    const errorMsg = await screen.findByRole('alert')
    expect(errorMsg).toBeInTheDocument()
    expect(errorMsg.textContent).toMatch(/PNG|JPG/)
  })

  it('텍스트 "PNG, JPG 지원 · 최대 20MB"가 표시된다', () => {
    const onUpload = vi.fn()
    render(<ImageUploader onUpload={onUpload} imageFile={null} />)

    expect(screen.getByText(/PNG, JPG 지원 · 최대 20MB/)).toBeInTheDocument()
  })
})
