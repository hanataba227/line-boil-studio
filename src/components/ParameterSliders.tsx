import { useCallback } from 'react'
import * as RadixSlider from '@radix-ui/react-slider'
import { ProcessingParams } from '../types'

interface Props {
  params: ProcessingParams
  onChange: (params: Partial<ProcessingParams>) => void
}

interface SliderConfig {
  key: keyof Pick<ProcessingParams, 'frameCount' | 'fps' | 'strength' | 'scale' | 'blurRatio'>
  label: string
  min: number
  max: number
  step: number
  format: (v: number) => string
}

const SLIDERS: SliderConfig[] = [
  {
    key: 'frameCount',
    label: '프레임 수',
    min: 2,
    max: 12,
    step: 1,
    format: (v) => `${v}`,
  },
  {
    key: 'fps',
    label: 'FPS',
    min: 1,
    max: 24,
    step: 1,
    format: (v) => `${v}`,
  },
  {
    key: 'strength',
    label: '변형 강도',
    min: 0.1,
    max: 5.0,
    step: 0.1,
    format: (v) => v.toFixed(1),
  },
  {
    key: 'scale',
    label: '변형 규모 (Scale)',
    min: 4,
    max: 64,
    step: 4,
    format: (v) => `${v}`,
  },
  {
    key: 'blurRatio',
    label: '블러 강도',
    min: 0.01,
    max: 0.20,
    step: 0.01,
    format: (v) => v.toFixed(2),
  },
]

export default function ParameterSliders({ params, onChange }: Props) {
  const handleChange = useCallback(
    (key: keyof ProcessingParams, value: number) => {
      onChange({ [key]: value })
    },
    [onChange],
  )

  return (
    <section aria-label="파라미터 슬라이더">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">파라미터</h2>
      <div className="space-y-4">
        {SLIDERS.map((slider) => {
          const value = params[slider.key] as number

          return (
            <div key={slider.key}>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor={`slider-${slider.key}`}
                  className="text-xs font-medium text-gray-600"
                >
                  {slider.label}
                </label>
                <span
                  className="text-xs font-semibold text-[#6C63FF] min-w-[3rem] text-right"
                  aria-live="polite"
                  aria-label={`${slider.label} 현재 값: ${slider.format(value)}`}
                >
                  {slider.format(value)}
                </span>
              </div>

              <RadixSlider.Root
                id={`slider-${slider.key}`}
                className="relative flex items-center select-none touch-none w-full h-5"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={[value]}
                onValueChange={([v]) => handleChange(slider.key, v)}
                aria-label={slider.label}
              >
                <RadixSlider.Track className="bg-gray-200 relative grow rounded-full h-1.5">
                  <RadixSlider.Range className="absolute bg-[#6C63FF] rounded-full h-full" />
                </RadixSlider.Track>
                <RadixSlider.Thumb
                  className={[
                    'block w-4 h-4 bg-[#6C63FF] rounded-full shadow-md',
                    'cursor-pointer transition-colors duration-200',
                    'hover:bg-[#5b52e0] focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-1',
                  ].join(' ')}
                  aria-label={slider.label}
                />
              </RadixSlider.Root>

              <div className="flex justify-between mt-0.5">
                <span className="text-[10px] text-gray-400">{slider.format(slider.min)}</span>
                <span className="text-[10px] text-gray-400">{slider.format(slider.max)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
