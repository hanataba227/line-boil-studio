import { Preset, ProcessingParams } from '../types'

export const PRESETS: Preset[] = [
  {
    name: 'Subtle',
    label: 'Subtle',
    params: {
      frameCount: 3,
      fps: 8,
      strength: 1.0,
      scale: 32,
      blurRatio: 0.02,
    },
  },
  {
    name: 'Soft',
    label: 'Soft',
    params: {
      frameCount: 3,
      fps: 8,
      strength: 1.0,
      scale: 32,
      blurRatio: 0.10,
    },
  },
  {
    name: 'Bold',
    label: 'Bold',
    params: {
      frameCount: 3,
      fps: 8,
      strength: 2.0,
      scale: 16,
      blurRatio: 0.10,
    },
  },
]

export const DEFAULT_PARAMS: ProcessingParams = {
  frameCount: 3,
  fps: 8,
  strength: 1.0,
  scale: 32,
  blurRatio: 0.02,
  preserveOriginalDpi: false,
  outputFormat: 'GIF',
}
