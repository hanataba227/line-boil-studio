import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PresetPanel from '../PresetPanel'
import { PRESETS } from '../../constants/presets'

describe('PresetPanel', () => {
  it('Subtle, Soft, Bold, Custom 버튼이 렌더링된다', () => {
    const onSelect = vi.fn()
    render(<PresetPanel activePreset="Subtle" onSelect={onSelect} />)

    expect(screen.getByText('Subtle')).toBeInTheDocument()
    expect(screen.getByText('Soft')).toBeInTheDocument()
    expect(screen.getByText('Bold')).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('활성 프리셋 버튼에 aria-checked="true"가 설정된다', () => {
    const onSelect = vi.fn()
    render(<PresetPanel activePreset="Soft" onSelect={onSelect} />)

    const buttons = screen.getAllByRole('radio')
    const softButton = buttons.find(
      (btn) => btn.getAttribute('aria-label')?.includes('Soft')
    )
    expect(softButton).toBeDefined()
    expect(softButton?.getAttribute('aria-checked')).toBe('true')

    // 다른 버튼들은 aria-checked=false여야 한다
    const subtleButton = buttons.find(
      (btn) => btn.getAttribute('aria-label')?.includes('Subtle')
    )
    expect(subtleButton?.getAttribute('aria-checked')).toBe('false')
  })

  it('Subtle 버튼 클릭 시 onSelect가 "Subtle"로 호출된다', () => {
    const onSelect = vi.fn()
    render(<PresetPanel activePreset="Bold" onSelect={onSelect} />)

    const subtleButton = screen.getByRole('radio', { name: /Subtle/i })
    fireEvent.click(subtleButton)

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('Subtle')
  })

  it('Custom 버튼은 activePreset이 Custom일 때만 강조된다', () => {
    const onSelect = vi.fn()
    const { rerender } = render(<PresetPanel activePreset="Subtle" onSelect={onSelect} />)

    // Subtle이 active일 때 Custom 버튼은 aria-checked=false
    const buttons = screen.getAllByRole('radio')
    const customButtonNotActive = buttons.find(
      (btn) => btn.getAttribute('aria-label')?.includes('Custom')
    )
    expect(customButtonNotActive?.getAttribute('aria-checked')).toBe('false')

    // Custom이 active일 때 Custom 버튼은 aria-checked=true
    rerender(<PresetPanel activePreset="Custom" onSelect={onSelect} />)
    const buttonsAfter = screen.getAllByRole('radio')
    const customButtonActive = buttonsAfter.find(
      (btn) => btn.getAttribute('aria-label')?.includes('Custom')
    )
    expect(customButtonActive?.getAttribute('aria-checked')).toBe('true')
  })

  it('PRESETS 상수가 Subtle/Soft/Bold를 포함한다', () => {
    const presetNames = PRESETS.map((p) => p.name)
    expect(presetNames).toContain('Subtle')
    expect(presetNames).toContain('Soft')
    expect(presetNames).toContain('Bold')
  })
})
