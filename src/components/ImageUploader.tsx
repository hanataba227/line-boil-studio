import { useCallback, useRef, useState, DragEvent, ChangeEvent } from 'react'
import { ImageFile } from '../types'

interface Props {
  onUpload: (imageFile: ImageFile) => void
  imageFile: ImageFile | null
}

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

function parseDpiFromExif(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 3000)

    const reader = new FileReader()
    reader.onerror = () => { clearTimeout(timeout); resolve(null) }
    reader.onload = (e) => {
      clearTimeout(timeout)
      try {
        const buf = e.target?.result as ArrayBuffer
        if (!buf) { resolve(null); return }
        const view = new DataView(buf)

        // JPEG: FF D8
        if (view.getUint8(0) !== 0xFF || view.getUint8(1) !== 0xD8) { resolve(null); return }

        let offset = 2
        while (offset < view.byteLength - 4) {
          if (view.getUint8(offset) !== 0xFF) { resolve(null); return }
          const marker = view.getUint8(offset + 1)
          const segLen = view.getUint16(offset + 2)

          // APP1 (EXIF) marker = 0xFFE1
          if (marker === 0xE1) {
            const exifOffset = offset + 4
            // Check "Exif\0\0"
            if (
              view.getUint8(exifOffset) === 0x45 &&
              view.getUint8(exifOffset + 1) === 0x78 &&
              view.getUint8(exifOffset + 2) === 0x69 &&
              view.getUint8(exifOffset + 3) === 0x66
            ) {
              const tiffOffset = exifOffset + 6
              const bigEnd = view.getUint16(tiffOffset) === 0x4D4D
              const ifdOffset = tiffOffset + view.getUint32(tiffOffset + 4, !bigEnd)
              const entries = view.getUint16(ifdOffset, !bigEnd)

              let xRes: number | null = null
              let unit: number | null = null

              for (let i = 0; i < entries; i++) {
                const entryOffset = ifdOffset + 2 + i * 12
                const tag = view.getUint16(entryOffset, !bigEnd)

                if (tag === 0x011A) {
                  // XResolution (RATIONAL: numerator/denominator)
                  const valOffset = tiffOffset + view.getUint32(entryOffset + 8, !bigEnd)
                  const num = view.getUint32(valOffset, !bigEnd)
                  const den = view.getUint32(valOffset + 4, !bigEnd)
                  xRes = den > 0 ? num / den : null
                } else if (tag === 0x0128) {
                  // ResolutionUnit (SHORT)
                  unit = view.getUint16(entryOffset + 8, !bigEnd)
                }
              }

              if (xRes != null && unit === 2) {
                resolve(Math.round(xRes))
              } else {
                resolve(null)
              }
              return
            }
          }

          offset += 2 + segLen
        }

        resolve(null)
      } catch {
        resolve(null)
      }
    }
    reader.readAsArrayBuffer(file)
  })
}

function readFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        resolve(e.target.result)
      } else {
        reject(new Error('파일을 읽을 수 없습니다.'))
      }
    }
    reader.onerror = () => reject(new Error('파일 읽기 오류'))
    reader.readAsDataURL(file)
  })
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('이미지를 로드할 수 없습니다.'))
    img.src = dataUrl
  })
}

export default function ImageUploader({ onUpload, imageFile }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    async (file: File) => {
      setError(null)

      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        setError('PNG, JPG 파일만 지원합니다.')
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('파일 크기가 20MB를 초과했습니다.')
        return
      }

      setIsLoading(true)

      try {
        const [dataUrl, dpi] = await Promise.all([
          readFileToDataUrl(file),
          parseDpiFromExif(file),
        ])

        const { width, height } = await getImageDimensions(dataUrl)

        const format: ImageFile['format'] =
          file.type === 'image/png' ? 'PNG' : 'JPG'

        const baseName = file.name.replace(/\.[^/.]+$/, '')

        onUpload({
          name: baseName,
          width,
          height,
          dpi,
          dataUrl,
          format,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : '파일 처리 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    },
    [onUpload],
  )

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile],
  )

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
      e.target.value = ''
    },
    [processFile],
  )

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  return (
    <section aria-label="이미지 업로드" className="flex flex-col h-full">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">원본 이미지</h2>

      <div
        role="button"
        tabIndex={0}
        aria-label="이미지 드래그앤드롭 영역 또는 클릭하여 파일 선택"
        className={[
          'border-2 border-dashed rounded-xl text-center transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center flex-1 min-h-48',
          isDragging
            ? 'border-[#6C63FF] bg-purple-50'
            : imageFile
              ? 'border-gray-200 hover:border-[#6C63FF] bg-[#F5F5F5]'
              : 'border-gray-300 hover:border-[#6C63FF] hover:bg-gray-50',
        ].join(' ')}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClick()
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-2 p-6">
            <div
              className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin"
              aria-label="로딩 중"
            />
            <p className="text-sm text-gray-500">이미지 처리 중...</p>
          </div>
        ) : imageFile ? (
          <div className="flex flex-col items-center gap-3 p-4 w-full">
            <img
              src={imageFile.dataUrl}
              alt="업로드된 원본 이미지"
              className="max-w-full max-h-56 object-contain rounded-lg"
            />
            <div className="text-xs text-gray-500 space-y-0.5 text-center">
              <p className="font-medium text-gray-700 truncate max-w-full">{imageFile.name}</p>
              <p>
                {imageFile.width} × {imageFile.height} px · {imageFile.format}
                {imageFile.dpi !== null ? ` · ${imageFile.dpi} DPI` : ''}
              </p>
              <p className="text-[10px] text-gray-400">클릭하여 다른 이미지 선택</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isDragging ? '#6C63FF' : '#9CA3AF'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-sm font-medium text-gray-700">
              {isDragging ? '여기에 놓으세요' : '이미지를 드래그하거나 클릭하여 선택'}
            </p>
            <p className="text-xs text-gray-400">PNG, JPG 지원 · 최대 20MB</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  )
}
