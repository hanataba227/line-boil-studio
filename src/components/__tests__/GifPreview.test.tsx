import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import GifPreview from '../GifPreview'
import { GIFResult, ImageFile } from '../../types'

const mockImageFile: ImageFile = {
  name: 'test.png',
  width: 800,
  height: 600,
  dpi: 72,
  dataUrl: 'data:image/png;base64,abc',
  format: 'PNG',
}

const mockGifResult: GIFResult = {
  blob: new Blob(['gif'], { type: 'image/gif' }),
  objectUrl: 'blob:http://localhost/fake-gif-url',
  filename: 'test-lineboil.gif',
  format: 'GIF',
  width: 800,
  height: 600,
}

describe('GifPreview', () => {
  it('초기 상태에서 안내 메시지를 표시한다', () => {
    render(<GifPreview gifResult={null} isProcessing={false} imageFile={null} />)

    expect(screen.getByText('생성하기 버튼을 눌러주세요')).toBeInTheDocument()
  })

  it('section에 "GIF 미리보기" aria-label이 있다', () => {
    render(<GifPreview gifResult={null} isProcessing={false} imageFile={null} />)

    expect(screen.getByRole('region', { name: 'GIF 미리보기' })).toBeInTheDocument()
  })

  it('isProcessing이 true일 때 로딩 스피너를 표시한다', () => {
    render(<GifPreview gifResult={null} isProcessing={true} imageFile={mockImageFile} />)

    expect(screen.getByLabelText('GIF 생성 중')).toBeInTheDocument()
    expect(screen.getByText('GIF 생성 중...')).toBeInTheDocument()
  })

  it('isProcessing 중 이미지 크기 정보를 표시한다', () => {
    render(<GifPreview gifResult={null} isProcessing={true} imageFile={mockImageFile} />)

    expect(screen.getByText(/800 × 600px 기준/)).toBeInTheDocument()
  })

  it('isProcessing 중 imageFile이 없으면 크기 정보를 표시하지 않는다', () => {
    render(<GifPreview gifResult={null} isProcessing={true} imageFile={null} />)

    expect(screen.queryByText(/px 기준/)).not.toBeInTheDocument()
  })

  it('gifResult가 있으면 GIF 이미지를 표시한다', () => {
    render(<GifPreview gifResult={mockGifResult} isProcessing={false} imageFile={mockImageFile} />)

    const img = screen.getByAltText('Line Boil 효과 GIF')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', mockGifResult.objectUrl)
  })

  it('gifResult가 있으면 크기/포맷 정보를 표시한다', () => {
    render(<GifPreview gifResult={mockGifResult} isProcessing={false} imageFile={mockImageFile} />)

    expect(screen.getByText(/800 × 600 px · GIF/)).toBeInTheDocument()
  })

  it('gifResult가 없으면 크기/포맷 정보를 표시하지 않는다', () => {
    render(<GifPreview gifResult={null} isProcessing={false} imageFile={null} />)

    expect(screen.queryByText(/px · GIF/)).not.toBeInTheDocument()
  })
})
