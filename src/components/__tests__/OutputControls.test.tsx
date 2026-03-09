import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OutputControls from '../OutputControls'
import { ProcessingParams, GIFResult } from '../../types'

const defaultParams: ProcessingParams = {
  frameCount: 3,
  fps: 8,
  strength: 1.0,
  scale: 32,
  blurRatio: 0.02,
  preserveOriginalDpi: false,
  outputFormat: 'GIF',
}

const mockGifResult: GIFResult = {
  blob: new Blob(['gif'], { type: 'image/gif' }),
  objectUrl: 'blob:http://localhost/fake-gif-url',
  filename: 'test-lineboil.gif',
  format: 'GIF',
  width: 800,
  height: 600,
}

function renderOutputControls(overrides: {
  params?: ProcessingParams
  gifResult?: GIFResult | null
  isProcessing?: boolean
} = {}) {
  const onGenerate = vi.fn()
  const onParamsChange = vi.fn()
  const onDownload = vi.fn()

  const utils = render(
    <OutputControls
      params={overrides.params ?? defaultParams}
      gifResult={overrides.gifResult ?? null}
      isProcessing={overrides.isProcessing ?? false}
      onGenerate={onGenerate}
      onParamsChange={onParamsChange}
      onDownload={onDownload}
    />,
  )

  return { ...utils, onGenerate, onParamsChange, onDownload }
}

describe('OutputControls', () => {
  it('section에 "출력 설정" aria-label이 있다', () => {
    renderOutputControls()

    expect(screen.getByRole('region', { name: '출력 설정' })).toBeInTheDocument()
  })

  it('GIF, WebP, APNG 포맷 라디오 버튼이 렌더링된다', () => {
    renderOutputControls()

    const radioGroup = screen.getByRole('radiogroup', { name: '출력 포맷 선택' })
    expect(radioGroup).toBeInTheDocument()

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)
  })

  it('현재 outputFormat에 해당하는 라디오가 체크되어 있다', () => {
    renderOutputControls({ params: { ...defaultParams, outputFormat: 'WebP' } })

    const radios = screen.getAllByRole('radio')
    const webpRadio = radios.find((r) => (r as HTMLInputElement).value === 'WebP')
    expect(webpRadio).toBeChecked()
  })

  it('포맷 라디오 변경 시 onParamsChange가 호출된다', () => {
    const { onParamsChange } = renderOutputControls()

    const radios = screen.getAllByRole('radio')
    const webpRadio = radios.find((r) => (r as HTMLInputElement).value === 'WebP')!
    fireEvent.click(webpRadio)

    expect(onParamsChange).toHaveBeenCalledWith({ outputFormat: 'WebP' })
  })

  it('"원본 해상도 유지" 체크박스가 렌더링된다', () => {
    renderOutputControls()

    const checkbox = screen.getByLabelText('원본 해상도 유지')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
  })

  it('체크박스 변경 시 onParamsChange가 호출된다', () => {
    const { onParamsChange } = renderOutputControls()

    const checkbox = screen.getByLabelText('원본 해상도 유지')
    fireEvent.click(checkbox)

    expect(onParamsChange).toHaveBeenCalledWith({ preserveOriginalDpi: true })
  })

  it('"생성하기" 버튼이 렌더링된다', () => {
    renderOutputControls()

    expect(screen.getByLabelText('GIF 만들기')).toBeInTheDocument()
    expect(screen.getByText('생성하기')).toBeInTheDocument()
  })

  it('생성하기 버튼 클릭 시 onGenerate가 호출된다', () => {
    const { onGenerate } = renderOutputControls()

    fireEvent.click(screen.getByLabelText('GIF 만들기'))

    expect(onGenerate).toHaveBeenCalledTimes(1)
  })

  it('isProcessing이 true이면 생성 버튼이 비활성화된다', () => {
    renderOutputControls({ isProcessing: true })

    const btn = screen.getByLabelText('GIF 만들기')
    expect(btn).toBeDisabled()
    expect(screen.getByText('생성 중...')).toBeInTheDocument()
  })

  it('gifResult가 없으면 다운로드 버튼이 없다', () => {
    renderOutputControls({ gifResult: null })

    expect(screen.queryByText('다운로드')).not.toBeInTheDocument()
  })

  it('gifResult가 있으면 다운로드 버튼이 표시된다', () => {
    renderOutputControls({ gifResult: mockGifResult })

    expect(screen.getByText('다운로드')).toBeInTheDocument()
  })

  it('다운로드 버튼 클릭 시 onDownload가 호출된다', () => {
    const { onDownload } = renderOutputControls({ gifResult: mockGifResult })

    fireEvent.click(screen.getByText('다운로드'))

    expect(onDownload).toHaveBeenCalledTimes(1)
  })
})
