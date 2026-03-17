import { useCallback, useReducer, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AppState, ImageFile, ProcessingParams, GIFResult, PresetName } from './types'
import { DEFAULT_PARAMS, PRESETS } from './constants/presets'
import { encodeGIF } from './engine/gif-encoder'
import ImageUploader from './components/ImageUploader'
import ParameterSliders from './components/ParameterSliders'
import GifPreview from './components/GifPreview'
import OutputControls from './components/OutputControls'
import Sidebar from './components/Sidebar'

// ─── State & Reducer ──────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_IMAGE'; payload: ImageFile }
  | { type: 'SET_PARAMS'; payload: Partial<ProcessingParams> }
  | { type: 'SET_PRESET'; payload: PresetName }
  | { type: 'SET_GIF_RESULT'; payload: GIFResult | null }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

interface ExtendedAppState extends AppState {
  error: string | null
}

const initialState: ExtendedAppState = {
  imageFile: null,
  params: DEFAULT_PARAMS,
  activePreset: 'Subtle',
  gifResult: null,
  isProcessing: false,
  error: null,
}

function detectPreset(params: ProcessingParams): PresetName {
  for (const preset of PRESETS) {
    const p = preset.params
    if (
      p.frameCount === params.frameCount &&
      p.fps === params.fps &&
      p.strength === params.strength &&
      p.scale === params.scale &&
      p.blurRatio === params.blurRatio
    ) {
      return preset.name
    }
  }
  return 'Custom'
}

function reducer(state: ExtendedAppState, action: Action): ExtendedAppState {
  switch (action.type) {
    case 'SET_IMAGE':
      return { ...state, imageFile: action.payload, gifResult: null, error: null }
    case 'SET_PARAMS': {
      const newParams = { ...state.params, ...action.payload }
      const activePreset = detectPreset(newParams)
      return { ...state, params: newParams, activePreset }
    }
    case 'SET_PRESET': {
      if (action.payload === 'Custom') {
        return { ...state, activePreset: 'Custom' }
      }
      const preset = PRESETS.find((p) => p.name === action.payload)
      if (!preset) return state
      return {
        ...state,
        activePreset: action.payload,
        params: { ...state.params, ...preset.params },
      }
    }
    case 'SET_GIF_RESULT':
      return { ...state, gifResult: action.payload }
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

// ─── App Component ────────────────────────────────────────────────────────────

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const prevObjectUrlRef = useRef<string | null>(null)

  // objectUrl 메모리 누수 방지
  useEffect(() => {
    if (state.gifResult?.objectUrl) {
      const prev = prevObjectUrlRef.current
      if (prev && prev !== state.gifResult.objectUrl) {
        URL.revokeObjectURL(prev)
      }
      prevObjectUrlRef.current = state.gifResult.objectUrl
    }
  }, [state.gifResult])

  // 컴포넌트 언마운트 시 objectUrl 해제
  useEffect(() => {
    return () => {
      if (prevObjectUrlRef.current) {
        URL.revokeObjectURL(prevObjectUrlRef.current)
      }
    }
  }, [])

  const handleImageUpload = useCallback((imageFile: ImageFile) => {
    dispatch({ type: 'SET_IMAGE', payload: imageFile })
  }, [])

  const handleParamsChange = useCallback((params: Partial<ProcessingParams>) => {
    dispatch({ type: 'SET_PARAMS', payload: params })
  }, [])

  const handlePresetSelect = useCallback((preset: PresetName) => {
    dispatch({ type: 'SET_PRESET', payload: preset })
  }, [])

  const handleGenerateGIF = useCallback(async () => {
    if (!state.imageFile) {
      dispatch({ type: 'SET_ERROR', payload: '이미지를 먼저 업로드해주세요.' })
      return
    }

    dispatch({ type: 'SET_PROCESSING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const result = await encodeGIF(state.imageFile, state.params)
      dispatch({ type: 'SET_GIF_RESULT', payload: result })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'GIF 생성 중 오류가 발생했습니다.'
      dispatch({ type: 'SET_ERROR', payload: message })
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false })
    }
  }, [state.imageFile, state.params])

  const handleDownload = useCallback(() => {
    if (!state.gifResult) return
    const a = document.createElement('a')
    a.href = state.gifResult.objectUrl
    a.download = state.gifResult.filename
    a.click()
  }, [state.gifResult])

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#6C63FF' }}
            aria-hidden="true"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 5 C 8 3, 16 9, 19 7" />
              <path d="M5 10 C 8 8, 16 14, 19 12" />
              <path d="M5 15 C 8 13, 16 19, 19 17" />
              <path d="M5 20 C 8 18, 16 24, 19 22" />
            </svg>
          </div>
          <h1 className="text-lg font-bold tracking-tight" style={{ color: '#1A1A1A' }}>
            Line Boil Studio
          </h1>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <a
            href="https://github.com/hanataba227/line-boil-studio"
            target="_blank"
            rel="noopener noreferrer"
            title="소스 코드 (GitHub)"
            className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            GitHub
          </a>
          <a
            href="https://forms.gle/KSacKqNWgkF7i1RVA"
            target="_blank"
            rel="noopener noreferrer"
            title="건의사항 및 오류 제보"
            className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            건의함
          </a>
          <Link
            to="/guide"
            title="파라미터 설명 및 프리셋 안내"
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md transition-colors hover:bg-gray-100"
            style={{ color: '#6C63FF' }}
          >
            <span>사용법</span>
          </Link>
        </div>
      </header>

      {/* Error Banner */}
      {state.error && (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-56px)] overflow-hidden">
        {/* Main Content - 2x2 Grid */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* 상단행: A(ImageUploader) | B(GifPreview) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ minHeight: '320px' }}>
              {/* A: 원본 이미지 업로드 */}
              <ImageUploader
                onUpload={handleImageUpload}
                imageFile={state.imageFile}
              />

              {/* B: GIF 미리보기 */}
              <GifPreview
                gifResult={state.gifResult}
                isProcessing={state.isProcessing}
                imageFile={state.imageFile}
              />
            </div>

            {/* 하단행: C(ParameterSliders) | D(OutputControls) */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
              {/* C: 파라미터 슬라이더 */}
              <ParameterSliders
                params={state.params}
                onChange={handleParamsChange}
              />

              {/* D: 출력 설정 */}
              <OutputControls
                params={state.params}
                gifResult={state.gifResult}
                isProcessing={state.isProcessing}
                onGenerate={handleGenerateGIF}
                onParamsChange={handleParamsChange}
                onDownload={handleDownload}
              />
            </div>
          </div>
        </main>

        {/* Right Sidebar (md+) */}
        <aside className="hidden md:block w-72 border-l border-gray-200 overflow-y-auto shrink-0">
          <Sidebar
            params={state.params}
            activePreset={state.activePreset}
            onPresetSelect={handlePresetSelect}
            onParamsChange={handleParamsChange}
          />
        </aside>
      </div>
    </div>
  )
}
