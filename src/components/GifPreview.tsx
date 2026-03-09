import { GIFResult, ImageFile } from '../types'

interface Props {
  gifResult: GIFResult | null
  isProcessing: boolean
  imageFile: ImageFile | null
}

export default function GifPreview({ gifResult, isProcessing, imageFile }: Props) {
  return (
    <section aria-label="GIF 미리보기" className="flex flex-col h-full">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">GIF 미리보기</h2>

      <div className="rounded-xl border border-gray-200 overflow-hidden bg-[#F5F5F5] flex items-center justify-center flex-1 min-h-48">
        {isProcessing ? (
          <div className="flex flex-col items-center gap-2 p-6">
            <div
              className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin"
              aria-label="GIF 생성 중"
            />
            <p className="text-sm text-gray-500">GIF 생성 중...</p>
            {imageFile && (
              <p className="text-xs text-gray-400">
                {imageFile.width} × {imageFile.height}px 기준
              </p>
            )}
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
            <p className="text-sm text-gray-400">생성하기 버튼을 눌러주세요</p>
          </div>
        )}
      </div>

      {gifResult && (
        <p className="text-[10px] text-gray-400 text-center mt-1">
          {gifResult.width} × {gifResult.height} px · {gifResult.format}
        </p>
      )}
    </section>
  )
}
