import { useCallback, useState } from 'react'
import { GIFResult, ImageFile, ProcessingParams } from '../types'

interface Props {
  imageFile: ImageFile
  gifResult: GIFResult | null
  isProcessing: boolean
  params: ProcessingParams
  onGenerate: () => void
  onParamsChange: (params: Partial<ProcessingParams>) => void
}

type OutputFormat = 'GIF' | 'WebP' | 'APNG'

// Safari WebP/APNG 지원 감지
function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

export default function PreviewPanel({
  imageFile,
  gifResult,
  isProcessing,
  params,
  onGenerate,
  onParamsChange,
}: Props) {
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }, [])

  const handleFormatChange = useCallback(
    (format: OutputFormat) => {
      // Safari는 WebP/APNG 미지원 → GIF 자동 폴백
      if ((format === 'WebP' || format === 'APNG') && isSafari()) {
        showToast('Safari는 WebP/APNG를 지원하지 않아 GIF로 저장합니다.')
        onParamsChange({ outputFormat: 'GIF' })
        return
      }
      onParamsChange({ outputFormat: format })
    },
    [onParamsChange, showToast],
  )

  const handleDownload = useCallback(() => {
    if (!gifResult) return
    const a = document.createElement('a')
    a.href = gifResult.objectUrl
    a.download = gifResult.filename
    a.click()
  }, [gifResult])

  const OUTPUT_FORMATS: OutputFormat[] = ['GIF', 'WebP', 'APNG']

  return (
    <section aria-label="미리보기 및 다운로드" className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-700">미리보기</h2>

      {/* 2컬럼 미리보기 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 원본 */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500 text-center">원본</p>
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-[#F5F5F5] flex items-center justify-center min-h-48">
            <img
              src={imageFile.dataUrl}
              alt="원본 이미지"
              className="max-w-full max-h-72 object-contain"
            />
          </div>
          <p className="text-[10px] text-gray-400 text-center">
            {imageFile.width} × {imageFile.height} px · {imageFile.format}
          </p>
        </div>

        {/* GIF 결과 */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500 text-center">Line Boil GIF</p>
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-[#F5F5F5] flex items-center justify-center min-h-48">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2 p-6">
                <div
                  className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin"
                  aria-label="GIF 생성 중"
                />
                <p className="text-sm text-gray-500">GIF 생성 중...</p>
                <p className="text-xs text-gray-400">
                  {imageFile.width} × {imageFile.height}px 기준
                </p>
              </div>
            ) : gifResult ? (
              <img
                src={gifResult.objectUrl}
                alt="Line Boil 효과 GIF"
                className="max-w-full max-h-72 object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D1D5DB"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
                <p className="text-sm text-gray-400">GIF 만들기 버튼을 눌러주세요</p>
              </div>
            )}
          </div>
          {gifResult && (
            <p className="text-[10px] text-gray-400 text-center">
              {gifResult.width} × {gifResult.height} px · {gifResult.format}
            </p>
          )}
        </div>
      </div>

      {/* 옵션 및 버튼 */}
      <div className="space-y-3">
        {/* 포맷 선택 */}
        <div>
          <p className="text-xs text-gray-600 mb-1.5">출력 포맷</p>
          <div className="flex gap-3" role="radiogroup" aria-label="출력 포맷 선택">
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

        {/* 원본 해상도 유지 토글 */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={params.preserveOriginalDpi}
            onChange={(e) => onParamsChange({ preserveOriginalDpi: e.target.checked })}
            className="accent-[#6C63FF] cursor-pointer w-4 h-4"
            aria-label="원본 해상도 유지 (DPI 변환 건너뜀)"
          />
          <span className="text-xs text-gray-700">원본 해상도 유지 (DPI 변환 건너뜀)</span>
        </label>

        {/* Generate 버튼 */}
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
            'GIF 만들기'
          )}
        </button>

        {/* 다운로드 버튼 */}
        {gifResult && (
          <button
            onClick={handleDownload}
            aria-label={`GIF 다운로드: ${gifResult.filename}`}
            className="w-full py-3 rounded-xl text-sm font-semibold border border-[#6C63FF] text-[#6C63FF] hover:bg-purple-50 transition-colors duration-200 cursor-pointer"
          >
            다운로드 · {gifResult.filename}
          </button>
        )}
      </div>

      {/* Toast 알림 */}
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
