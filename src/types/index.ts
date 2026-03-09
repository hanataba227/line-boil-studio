export interface ImageFile {
  name: string
  width: number
  height: number
  dpi: number | null
  dataUrl: string
  format: 'PNG' | 'JPG'
}

export interface ProcessingParams {
  frameCount: number  // 2–12
  fps: number         // 1–24
  strength: number    // 0.1–5.0
  scale: number       // 4–64
  blurRatio: number   // 0.01–0.20
  preserveOriginalDpi: boolean
  outputFormat: 'GIF' | 'WebP' | 'APNG'
}

export interface GIFResult {
  blob: Blob
  objectUrl: string
  filename: string
  format: string
  width: number
  height: number
}

export type PresetName = 'Subtle' | 'Soft' | 'Bold' | 'Custom'

export interface Preset {
  name: PresetName
  label: string
  params: Omit<ProcessingParams, 'preserveOriginalDpi' | 'outputFormat'>
}

export interface SavedPreset {
  id: string
  name: string
  params: Omit<ProcessingParams, 'preserveOriginalDpi' | 'outputFormat'>
  createdAt: number
}

export interface AppState {
  imageFile: ImageFile | null
  params: ProcessingParams
  activePreset: PresetName
  gifResult: GIFResult | null
  isProcessing: boolean
}
