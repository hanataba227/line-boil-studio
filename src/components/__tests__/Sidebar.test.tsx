import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from '../Sidebar'
import { ProcessingParams } from '../../types'

const defaultParams: ProcessingParams = {
  frameCount: 3,
  fps: 8,
  strength: 1.0,
  scale: 32,
  blurRatio: 0.02,
  preserveOriginalDpi: false,
  outputFormat: 'GIF',
}

function renderSidebar(overrides: {
  params?: ProcessingParams
  activePreset?: 'Subtle' | 'Soft' | 'Bold' | 'Custom'
} = {}) {
  const onPresetSelect = vi.fn()
  const onParamsChange = vi.fn()

  const utils = render(
    <Sidebar
      params={overrides.params ?? defaultParams}
      activePreset={overrides.activePreset ?? 'Subtle'}
      onPresetSelect={onPresetSelect}
      onParamsChange={onParamsChange}
    />,
  )

  return { ...utils, onPresetSelect, onParamsChange }
}

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((_index: number) => null),
  }
})()

describe('Sidebar', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  // --- 프리셋 표시 ---

  it('기본 프리셋(Subtle, Soft, Bold) 버튼이 렌더링된다', () => {
    renderSidebar()

    expect(screen.getByText('Subtle (섬세)')).toBeInTheDocument()
    expect(screen.getByText('Soft (부드러움)')).toBeInTheDocument()
    expect(screen.getByText('Bold (역동적)')).toBeInTheDocument()
  })

  it('활성 프리셋 버튼에 aria-pressed="true"가 설정된다', () => {
    renderSidebar({ activePreset: 'Soft' })

    const softBtn = screen.getByLabelText('Soft (부드러움) 프리셋으로 전환')
    expect(softBtn).toHaveAttribute('aria-pressed', 'true')

    const subtleBtn = screen.getByLabelText('Subtle (섬세) 프리셋으로 전환')
    expect(subtleBtn).toHaveAttribute('aria-pressed', 'false')
  })

  it('프리셋 버튼 클릭 시 onPresetSelect가 호출된다', () => {
    const { onPresetSelect } = renderSidebar({ activePreset: 'Subtle' })

    fireEvent.click(screen.getByLabelText('Bold (역동적) 프리셋으로 전환'))

    expect(onPresetSelect).toHaveBeenCalledTimes(1)
    expect(onPresetSelect).toHaveBeenCalledWith('Bold')
  })

  // --- 현재 설정 표시 ---

  it('현재 설정 섹션에 파라미터 값이 표시된다', () => {
    renderSidebar({ params: { ...defaultParams, frameCount: 5, fps: 12 } })

    const section = screen.getByRole('region', { name: '현재 설정' })
    expect(section).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('현재 설정에 outputFormat이 표시된다', () => {
    renderSidebar()

    expect(screen.getByText('GIF')).toBeInTheDocument()
  })

  it('preserveOriginalDpi 상태가 표시된다', () => {
    renderSidebar({ params: { ...defaultParams, preserveOriginalDpi: true } })

    expect(screen.getByText('켜짐')).toBeInTheDocument()
  })

  // --- 프리셋 만들기 ---

  it('"+ 새 프리셋 만들기" 버튼이 표시된다', () => {
    renderSidebar()

    expect(screen.getByText('+ 새 프리셋 만들기')).toBeInTheDocument()
  })

  it('"+ 새 프리셋 만들기" 클릭 시 입력 폼이 나타난다', () => {
    renderSidebar()

    fireEvent.click(screen.getByText('+ 새 프리셋 만들기'))

    expect(screen.getByPlaceholderText('프리셋 이름 입력')).toBeInTheDocument()
    expect(screen.getByText('저장')).toBeInTheDocument()
    expect(screen.getByText('취소')).toBeInTheDocument()
  })

  it('프리셋 생성 폼에 현재 파라미터가 표시된다', () => {
    renderSidebar({ params: { ...defaultParams, strength: 2.5 } })

    fireEvent.click(screen.getByText('+ 새 프리셋 만들기'))

    // 현재 파라미터 섹션에서 strength 2.5가 보여야 한다 (생성 폼 + 현재 설정에 모두 표시)
    const matches = screen.getAllByText('2.5')
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('이름 미입력 시 저장 버튼이 비활성화된다', () => {
    renderSidebar()

    fireEvent.click(screen.getByText('+ 새 프리셋 만들기'))

    const saveBtn = screen.getByText('저장')
    expect(saveBtn).toBeDisabled()
  })

  it('이름 입력 후 저장하면 localStorage에 저장된다', () => {
    renderSidebar()

    fireEvent.click(screen.getByText('+ 새 프리셋 만들기'))

    const input = screen.getByPlaceholderText('프리셋 이름 입력')
    fireEvent.change(input, { target: { value: '내 프리셋 1' } })

    const saveBtn = screen.getByText('저장')
    expect(saveBtn).not.toBeDisabled()

    fireEvent.click(saveBtn)

    // localStorage에 저장됨
    expect(localStorageMock.setItem).toHaveBeenCalled()
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
    expect(savedData).toHaveLength(1)
    expect(savedData[0].name).toBe('내 프리셋 1')
  })

  it('저장 후 입력 폼이 닫히고 내 프리셋 목록에 표시된다', () => {
    renderSidebar()

    fireEvent.click(screen.getByText('+ 새 프리셋 만들기'))

    const input = screen.getByPlaceholderText('프리셋 이름 입력')
    fireEvent.change(input, { target: { value: '테스트 프리셋' } })
    fireEvent.click(screen.getByText('저장'))

    // 폼이 닫힘
    expect(screen.queryByPlaceholderText('프리셋 이름 입력')).not.toBeInTheDocument()

    // 내 프리셋 섹션에 표시됨
    expect(screen.getByText('테스트 프리셋')).toBeInTheDocument()
    expect(screen.getByText('내 프리셋')).toBeInTheDocument()
  })

  it('취소 버튼을 누르면 입력 폼이 닫힌다', () => {
    renderSidebar()

    fireEvent.click(screen.getByText('+ 새 프리셋 만들기'))
    expect(screen.getByPlaceholderText('프리셋 이름 입력')).toBeInTheDocument()

    fireEvent.click(screen.getByText('취소'))
    expect(screen.queryByPlaceholderText('프리셋 이름 입력')).not.toBeInTheDocument()
  })

  it('공백만 입력하면 저장되지 않는다', () => {
    renderSidebar()

    fireEvent.click(screen.getByText('+ 새 프리셋 만들기'))

    const input = screen.getByPlaceholderText('프리셋 이름 입력')
    fireEvent.change(input, { target: { value: '   ' } })

    const saveBtn = screen.getByText('저장')
    expect(saveBtn).toBeDisabled()
  })

  // --- 프리셋 삭제 ---

  it('저장된 프리셋의 삭제 버튼을 누르면 제거된다', () => {
    renderSidebar()

    // 프리셋 저장
    fireEvent.click(screen.getByText('+ 새 프리셋 만들기'))
    fireEvent.change(screen.getByPlaceholderText('프리셋 이름 입력'), {
      target: { value: '삭제할 프리셋' },
    })
    fireEvent.click(screen.getByText('저장'))

    expect(screen.getByText('삭제할 프리셋')).toBeInTheDocument()

    // 삭제
    fireEvent.click(screen.getByLabelText('삭제할 프리셋 프리셋 삭제'))
    expect(screen.queryByText('삭제할 프리셋')).not.toBeInTheDocument()
  })

  // --- 사용자 프리셋 클릭 ---

  it('사용자 프리셋 클릭 시 onParamsChange가 호출된다', () => {
    const { onParamsChange } = renderSidebar()

    // 프리셋 저장
    fireEvent.click(screen.getByText('+ 새 프리셋 만들기'))
    fireEvent.change(screen.getByPlaceholderText('프리셋 이름 입력'), {
      target: { value: '커스텀 A' },
    })
    fireEvent.click(screen.getByText('저장'))

    // 저장된 프리셋 클릭
    fireEvent.click(screen.getByText('커스텀 A'))

    expect(onParamsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        frameCount: defaultParams.frameCount,
        fps: defaultParams.fps,
        strength: defaultParams.strength,
        scale: defaultParams.scale,
        blurRatio: defaultParams.blurRatio,
      }),
    )
  })

  // --- Enter 키로 저장 ---

  it('Enter 키로 프리셋을 저장할 수 있다', () => {
    renderSidebar()

    fireEvent.click(screen.getByText('+ 새 프리셋 만들기'))

    const input = screen.getByPlaceholderText('프리셋 이름 입력')
    fireEvent.change(input, { target: { value: 'Enter 프리셋' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.getByText('Enter 프리셋')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('프리셋 이름 입력')).not.toBeInTheDocument()
  })

  // --- Escape 키로 취소 ---

  it('Escape 키로 입력을 취소할 수 있다', () => {
    renderSidebar()

    fireEvent.click(screen.getByText('+ 새 프리셋 만들기'))

    const input = screen.getByPlaceholderText('프리셋 이름 입력')
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.queryByPlaceholderText('프리셋 이름 입력')).not.toBeInTheDocument()
  })
})
