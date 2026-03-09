import { useCallback } from 'react'
import { PresetName } from '../types'
import { PRESETS } from '../constants/presets'

interface Props {
  activePreset: PresetName
  onSelect: (preset: PresetName) => void
}

const PRESET_NAMES: PresetName[] = ['Subtle', 'Soft', 'Bold', 'Custom']

const PRESET_DESCRIPTIONS: Record<PresetName, string> = {
  Subtle: '섬세한 떨림',
  Soft: '부드러운 흔들림',
  Bold: '역동적인 변형',
  Custom: '직접 설정',
}

export default function PresetPanel({ activePreset, onSelect }: Props) {
  const handleClick = useCallback(
    (name: PresetName) => {
      onSelect(name)
    },
    [onSelect],
  )

  return (
    <section aria-label="프리셋 선택">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">프리셋</h2>
      <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Line Boil 프리셋">
        {PRESET_NAMES.map((name) => {
          const isActive = activePreset === name
          const preset = PRESETS.find((p) => p.name === name)

          return (
            <button
              key={name}
              role="radio"
              aria-checked={isActive}
              aria-label={`${name} 프리셋: ${PRESET_DESCRIPTIONS[name]}`}
              onClick={() => handleClick(name)}
              className={[
                'flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs font-medium',
                'cursor-pointer transition-colors duration-200',
                isActive
                  ? 'bg-[#6C63FF] border-[#6C63FF] text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-[#6C63FF] hover:text-[#6C63FF]',
              ].join(' ')}
            >
              <span className="text-sm font-semibold">{name}</span>
              <span className={isActive ? 'text-purple-200' : 'text-gray-400'}>
                {PRESET_DESCRIPTIONS[name]}
              </span>
              {preset && (
                <span className={`text-[10px] ${isActive ? 'text-purple-200' : 'text-gray-400'}`}>
                  {preset.params.frameCount}f · {preset.params.fps}fps
                </span>
              )}
              {name === 'Custom' && (
                <span className={`text-[10px] ${isActive ? 'text-purple-200' : 'text-gray-400'}`}>
                  —
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
