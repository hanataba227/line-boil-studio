import { useCallback, useState } from 'react'
import { GIFResult, ProcessingParams } from '../types'

interface Props {
  params: ProcessingParams
  gifResult: GIFResult | null
  isProcessing: boolean
  onGenerate: () => void
  onParamsChange: (params: Partial<ProcessingParams>) => void
  onDownload: () => void
}

type OutputFormat = 'GIF' | 'WebP' | 'APNG'

function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

const OUTPUT_FORMATS: OutputFormat[] = ['GIF', 'WebP', 'APNG']

export default function OutputControls({
  params,
  gifResult,
  isProcessing,
  onGenerate,
  onParamsChange,
  onDownload,
}: Props) {
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }, [])

  const handleFormatChange = useCallback(
    (format: OutputFormat) => {
      if ((format === 'WebP' || format === 'APNG') && isSafari()) {
        showToast('Safari는 WebP/APNG를 지원하지 않아 GIF로 저장합니다.')
        onParamsChange({ outputFormat: 'GIF' })
        return
      }
      onParamsChange({ outputFormat: format })
    },
    [onParamsChange, showToast],
  )

  return (
    <section aria-label="출력 설정" className="flex flex-col h-full">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">출력 설정</h2>

      <div className="rounded-xl border border-gray-200 bg-[#F5F5F5] p-4 flex flex-col gap-4 flex-1">
        {/* 포맷 선택 */}
        <div>
          <p className="text-xs text-gray-600 mb-1.5">출력 포맷</p>
          <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="출력 포맷 선택">
            {OUTPUT_FORMATS.map((fmt) => (
              <label
                key={fmt}
                className="flex items-center gap-1.5 cursor-pointer"
                aria-label={`출력 포맷: ${fmt}`}
              >
                <input
                  type="radio"
                  name="outputFormat"
                  value={fmt}
                  checked={params.outputFormat === fmt}
                  onChange={() => handleFormatChange(fmt)}
                  className="accent-[#6C63FF] cursor-pointer"
                />
                <span className="text-xs text-gray-700">{fmt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 원본 해상도 유지 */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={params.preserveOriginalDpi}
            onChange={(e) => onParamsChange({ preserveOriginalDpi: e.target.checked })}
            className="accent-[#6C63FF] cursor-pointer w-4 h-4"
            aria-label="원본 해상도 유지"
          />
          <span className="text-xs text-gray-700">원본 해상도 유지</span>
        </label>

        {/* 버튼들 */}
        <div className="flex flex-col gap-2 mt-auto">
          <button
            onClick={onGenerate}
            disabled={isProcessing}
            aria-label="GIF 만들기"
            className={[
              'w-full py-3 rounded-xl text-sm font-semibold transition-colors duration-200 cursor-pointer',
              isProcessing
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#6C63FF] text-white hover:bg-[#5b52e0] active:bg-[#4e47c8]',
            ].join(' ')}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                생성 중...
              </span>
            ) : (
              '생성하기'
            )}
          </button>

          {gifResult && (
            <button
              onClick={onDownload}
              aria-label={`다운로드: ${gifResult.filename}`}
              className="w-full py-3 rounded-xl text-sm font-semibold border border-[#6C63FF] text-[#6C63FF] hover:bg-purple-50 transition-colors duration-200 cursor-pointer"
            >
              다운로드
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg max-w-xs"
        >
          {toast}
        </div>
      )}
    </section>
  )
}
