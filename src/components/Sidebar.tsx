import { useState, useEffect, useCallback } from 'react'
import * as RadixSlider from '@radix-ui/react-slider'
import { ProcessingParams, PresetName, SavedPreset } from '../types'
import { PRESETS } from '../constants/presets'

interface Props {
  params: ProcessingParams
  activePreset: PresetName
  onPresetSelect: (preset: PresetName) => void
  onParamsChange?: (params: Partial<ProcessingParams>) => void
}

const STORAGE_KEY = 'line-boil-studio-custom-presets'

interface MiniSliderConfig {
  key: keyof Omit<ProcessingParams, 'preserveOriginalDpi' | 'outputFormat'>
  label: string
  min: number
  max: number
  step: number
  format: (v: number) => string
}

const PARAM_SLIDERS: MiniSliderConfig[] = [
  { key: 'frameCount', label: '프레임 수', min: 2, max: 12, step: 1, format: (v) => `${v}` },
  { key: 'fps', label: 'FPS', min: 1, max: 24, step: 1, format: (v) => `${v}` },
  { key: 'strength', label: '변형 강도', min: 0.1, max: 5.0, step: 0.1, format: (v) => v.toFixed(1) },
  { key: 'scale', label: 'Scale', min: 4, max: 64, step: 4, format: (v) => `${v}` },
  { key: 'blurRatio', label: '블러 강도', min: 0.01, max: 0.20, step: 0.01, format: (v) => v.toFixed(2) },
]

function loadCustomPresets(): SavedPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as SavedPreset[]
  } catch {
    // ignore
  }
  return []
}

function saveCustomPresets(presets: SavedPreset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
}

function generateId(): string {
  return `preset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

type DraftParams = Omit<ProcessingParams, 'preserveOriginalDpi' | 'outputFormat'>

const DEFAULT_DRAFT: DraftParams = {
  frameCount: 3,
  fps: 8,
  strength: 1.0,
  scale: 32,
  blurRatio: 0.02,
}

export default function Sidebar({ params, activePreset, onPresetSelect, onParamsChange }: Props) {
  const [customPresets, setCustomPresets] = useState<SavedPreset[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [draftParams, setDraftParams] = useState<DraftParams>(DEFAULT_DRAFT)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  useEffect(() => {
    setCustomPresets(loadCustomPresets())
  }, [])

  const handlePresetClick = useCallback(
    (preset: PresetName) => {
      onPresetSelect(preset)
    },
    [onPresetSelect],
  )

  const handleCustomPresetClick = useCallback(
    (saved: SavedPreset) => {
      if (onParamsChange) {
        onParamsChange(saved.params)
      }
    },
    [onParamsChange],
  )

  const handleStartCreate = useCallback(() => {
    setDraftParams({
      frameCount: params.frameCount,
      fps: params.fps,
      strength: params.strength,
      scale: params.scale,
      blurRatio: params.blurRatio,
    })
    setIsCreating(true)
    setNewPresetName('')
  }, [params])

  const handleCancelCreate = useCallback(() => {
    setIsCreating(false)
    setNewPresetName('')
  }, [])

  const handleDraftChange = useCallback((key: keyof DraftParams, value: number) => {
    setDraftParams((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSavePreset = useCallback(() => {
    const trimmed = newPresetName.trim()
    if (!trimmed) return

    const newPreset: SavedPreset = {
      id: generateId(),
      name: trimmed,
      params: { ...draftParams },
      createdAt: Date.now(),
    }

    const updated = [...customPresets, newPreset]
    setCustomPresets(updated)
    saveCustomPresets(updated)
    setIsCreating(false)
    setNewPresetName('')
  }, [newPresetName, draftParams, customPresets])

  const handleDeletePreset = useCallback(
    (id: string) => {
      const updated = customPresets.filter((p) => p.id !== id)
      setCustomPresets(updated)
      saveCustomPresets(updated)
    },
    [customPresets],
  )

  const handleStartRename = useCallback((saved: SavedPreset) => {
    setRenamingId(saved.id)
    setRenameValue(saved.name)
  }, [])

  const handleConfirmRename = useCallback(() => {
    const trimmed = renameValue.trim()
    if (!trimmed || !renamingId) {
      setRenamingId(null)
      return
    }
    const updated = customPresets.map((p) =>
      p.id === renamingId ? { ...p, name: trimmed } : p,
    )
    setCustomPresets(updated)
    saveCustomPresets(updated)
    setRenamingId(null)
  }, [renameValue, renamingId, customPresets])

  return (
    <div className="p-4 space-y-5">
      {/* 섹션 1: 프리셋 */}
      <section aria-label="프리셋">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          프리셋
        </h3>

        {/* 기본 프리셋 */}
        <div className="flex flex-col gap-2">
          {PRESETS.map((preset) => {
            const isActive = activePreset === preset.name
            return (
              <button
                key={preset.name}
                onClick={() => handlePresetClick(preset.name)}
                aria-label={`${preset.label} 프리셋으로 전환`}
                aria-pressed={isActive}
                className={[
                  'w-full py-2 px-3 rounded-lg text-xs font-medium text-left',
                  'cursor-pointer transition-colors duration-200',
                  isActive
                    ? 'bg-[#6C63FF] text-white'
                    : 'bg-[#F5F5F5] text-gray-600 hover:bg-purple-100 hover:text-[#6C63FF]',
                ].join(' ')}
              >
                {preset.label}
              </button>
            )
          })}
        </div>

        {/* 사용자 저장 프리셋 */}
        {customPresets.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              내 프리셋
            </p>
            <div className="flex flex-col gap-1.5">
              {customPresets.map((saved) => (
                <div key={saved.id} className="flex items-center gap-1">
                  {renamingId === saved.id ? (
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={handleConfirmRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmRename()
                        if (e.key === 'Escape') setRenamingId(null)
                      }}
                      className="flex-1 py-1 px-2 rounded-lg text-xs font-medium border border-[#6C63FF] focus:outline-none focus:ring-1 focus:ring-[#6C63FF]"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => handleCustomPresetClick(saved)}
                      className={[
                        'flex-1 py-1.5 px-3 rounded-lg text-xs font-medium text-left truncate',
                        'cursor-pointer transition-colors duration-200',
                        'bg-[#F5F5F5] text-gray-600 hover:bg-purple-100 hover:text-[#6C63FF]',
                      ].join(' ')}
                    >
                      {saved.name}
                    </button>
                  )}
                  <button
                    onClick={() => handleStartRename(saved)}
                    aria-label={`${saved.name} 이름 변경`}
                    className="p-1 rounded text-gray-400 hover:text-[#6C63FF] hover:bg-purple-50 transition-colors duration-200 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeletePreset(saved.id)}
                    aria-label={`${saved.name} 프리셋 삭제`}
                    className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 섹션 2: 프리셋 만들기 */}
      <section aria-label="프리셋 만들기">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          프리셋 만들기
        </h3>

        {!isCreating ? (
          <button
            onClick={handleStartCreate}
            className="w-full py-2 px-3 rounded-lg text-xs font-medium text-center cursor-pointer transition-colors duration-200 border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#6C63FF] hover:text-[#6C63FF]"
          >
            + 새 프리셋 만들기
          </button>
        ) : (
          <div className="bg-[#F5F5F5] rounded-lg p-3 space-y-3">
            {/* 이름 입력 */}
            <div>
              <label htmlFor="preset-name" className="sr-only">
                프리셋 이름
              </label>
              <input
                id="preset-name"
                type="text"
                placeholder="프리셋 이름 입력"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSavePreset()
                  if (e.key === 'Escape') handleCancelCreate()
                }}
                className="w-full px-2.5 py-1.5 rounded-md border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent"
                autoFocus
              />
            </div>

            {/* 미니 슬라이더 + 숫자 입력 */}
            <div className="space-y-2.5">
              {PARAM_SLIDERS.map((slider) => {
                const value = draftParams[slider.key]
                return (
                  <div key={slider.key}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] text-gray-500">{slider.label}</span>
                      <input
                        type="number"
                        value={slider.format(value)}
                        min={slider.min}
                        max={slider.max}
                        step={slider.step}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value)
                          if (!isNaN(v)) {
                            handleDraftChange(slider.key, Math.min(slider.max, Math.max(slider.min, v)))
                          }
                        }}
                        className="w-14 px-1 py-0.5 rounded border border-gray-300 text-[11px] font-medium text-gray-800 text-right focus:outline-none focus:ring-1 focus:ring-[#6C63FF] focus:border-transparent"
                      />
                    </div>
                    <RadixSlider.Root
                      className="relative flex items-center select-none touch-none w-full h-3"
                      min={slider.min}
                      max={slider.max}
                      step={slider.step}
                      value={[value]}
                      onValueChange={([v]) => handleDraftChange(slider.key, v)}
                    >
                      <RadixSlider.Track className="bg-gray-300 relative grow rounded-full h-1">
                        <RadixSlider.Range className="absolute bg-[#6C63FF] rounded-full h-full" />
                      </RadixSlider.Track>
                      <RadixSlider.Thumb className="block w-3 h-3 bg-[#6C63FF] rounded-full shadow cursor-pointer hover:bg-[#5b52e0] focus:outline-none" />
                    </RadixSlider.Root>
                  </div>
                )
              })}
            </div>

            {/* 저장 / 취소 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={handleSavePreset}
                disabled={!newPresetName.trim()}
                className={[
                  'flex-1 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 cursor-pointer',
                  newPresetName.trim()
                    ? 'bg-[#6C63FF] text-white hover:bg-[#5A52E0]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed',
                ].join(' ')}
              >
                저장
              </button>
              <button
                onClick={handleCancelCreate}
                className="flex-1 py-1.5 rounded-md text-xs font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 섹션 3: 현재 설정 */}
      <section aria-label="현재 설정">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          현재 설정
        </h3>
        <div className="bg-[#F5F5F5] rounded-lg p-3 space-y-1.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
            <span className="text-xs text-gray-500">활성 프리셋</span>
            <span
              className={[
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                activePreset === 'Custom'
                  ? 'bg-gray-200 text-gray-600'
                  : 'bg-[#6C63FF] text-white',
              ].join(' ')}
            >
              {activePreset}
            </span>
          </div>
          {PARAM_SLIDERS.map(({ key, label, format }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{label}</span>
              <span className="text-xs font-medium text-gray-800">
                {format(params[key])}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">포맷</span>
            <span className="text-xs font-medium text-gray-800">
              {params.outputFormat}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">원본 DPI 유지</span>
            <span className="text-xs font-medium text-gray-800">
              {params.preserveOriginalDpi ? '켜짐' : '꺼짐'}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
