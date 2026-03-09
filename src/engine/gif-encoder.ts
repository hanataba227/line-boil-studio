/**
 * gif.js Web Worker 래퍼
 *
 * Canvas API로 각 프레임을 생성하고 gif.js를 통해 GIF를 인코딩한다.
 * gif.js 인코딩은 Web Worker에서 실행되므로 UI 스레드를 블로킹하지 않는다.
 *
 * 주의:
 * - workerScript: import.meta.env.BASE_URL + 'gif.worker.js'
 * - objectUrl은 새 GIF 생성 시 revokeObjectURL 호출 필수
 * - 출력 크기가 4096px 초과 시 4096으로 클램핑
 */

import GIF from 'gif.js'
import { ProcessingParams, ImageFile, GIFResult } from '../types'
import { generateDisplacementMap } from './displacement'
import { applyGaussianBlur } from './gaussian-blur'
import { remapFrame } from './remap'

/**
 * 출력 이미지 크기 계산
 *
 * preserveOriginalDpi가 true이고 원본 DPI 정보가 있으면 300 DPI 기준으로 변환.
 * 결과가 4096px 초과 시 비율을 유지하며 4096으로 클램핑.
 */
function calcOutputSize(
  img: ImageFile,
  preserveOriginalDpi: boolean,
): { w: number; h: number } {
  const MAX_PX = 4096
  const TARGET_DPI = 300

  if (preserveOriginalDpi && img.dpi !== null && img.dpi !== TARGET_DPI) {
    let w = (img.width / img.dpi) * TARGET_DPI
    let h = (img.height / img.dpi) * TARGET_DPI

    // 4096px 클램핑 (비율 유지)
    if (w > MAX_PX || h > MAX_PX) {
      const ratio = Math.min(MAX_PX / w, MAX_PX / h)
      w = Math.round(w * ratio)
      h = Math.round(h * ratio)
    } else {
      w = Math.round(w)
      h = Math.round(h)
    }

    return { w, h }
  }

  // DPI 정보 없거나 보존 비활성 → 원본 크기 사용 (4096 클램핑만 적용)
  let w = img.width
  let h = img.height
  if (w > MAX_PX || h > MAX_PX) {
    const ratio = Math.min(MAX_PX / w, MAX_PX / h)
    w = Math.round(w * ratio)
    h = Math.round(h * ratio)
  }

  return { w, h }
}

/**
 * 날짜/시간 기반 파일명 suffix 생성 (yyyyMMdd_HHmmss)
 */
function getTimestampSuffix(): string {
  const now = new Date()
  const pad = (n: number): string => String(n).padStart(2, '0')
  return (
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  )
}

/**
 * GIF 인코딩 메인 함수
 *
 * @param img    업로드된 이미지 정보
 * @param params 처리 파라미터
 * @returns      GIFResult (blob, objectUrl, filename, format, width, height)
 */
export function encodeGIF(img: ImageFile, params: ProcessingParams): Promise<GIFResult> {
  if (!img.dataUrl) {
    return Promise.reject(new Error('encodeGIF: 이미지 데이터가 없습니다.'))
  }
  if (params.frameCount < 2 || params.frameCount > 12) {
    return Promise.reject(new Error(`encodeGIF: frameCount(${params.frameCount})는 2–12 범위여야 합니다.`))
  }
  if (params.fps < 1 || params.fps > 24) {
    return Promise.reject(new Error(`encodeGIF: fps(${params.fps})는 1–24 범위여야 합니다.`))
  }
  if (params.strength < 0.1 || params.strength > 5.0) {
    return Promise.reject(new Error(`encodeGIF: strength(${params.strength})는 0.1–5.0 범위여야 합니다.`))
  }
  if (params.scale < 4 || params.scale > 64) {
    return Promise.reject(new Error(`encodeGIF: scale(${params.scale})는 4–64 범위여야 합니다.`))
  }
  if (params.blurRatio < 0.01 || params.blurRatio > 0.20) {
    return Promise.reject(new Error(`encodeGIF: blurRatio(${params.blurRatio})는 0.01–0.20 범위여야 합니다.`))
  }

  return new Promise<GIFResult>((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      try {
        const { w, h } = calcOutputSize(img, params.preserveOriginalDpi)

        // 원본 이미지를 캔버스에 그리기
        const srcCanvas = document.createElement('canvas')
        srcCanvas.width = w
        srcCanvas.height = h
        const srcCtx = srcCanvas.getContext('2d')
        if (!srcCtx) {
          reject(new Error('encodeGIF: Canvas 2D 컨텍스트를 가져올 수 없습니다.'))
          return
        }
        srcCtx.drawImage(image, 0, 0, w, h)
        const srcImageData = srcCtx.getImageData(0, 0, w, h)

        // gif.js 인스턴스 생성
        const gif = new GIF({
          workers: 2,
          quality: 10,
          width: w,
          height: h,
          workerScript: import.meta.env.BASE_URL + 'gif.worker.js',
        })

        const delay = Math.round(1000 / params.fps)

        // 프레임 생성
        const frameCanvas = document.createElement('canvas')
        frameCanvas.width = w
        frameCanvas.height = h
        const frameCtx = frameCanvas.getContext('2d')
        if (!frameCtx) {
          reject(new Error('encodeGIF: 프레임 Canvas 2D 컨텍스트를 가져올 수 없습니다.'))
          return
        }

        for (let f = 0; f < params.frameCount; f++) {
          // 새 displacement map 생성
          const { dx: rawDx, dy: rawDy } = generateDisplacementMap(w, h, params.scale, params.strength)

          // 가우시안 블러 적용
          const dx = applyGaussianBlur(rawDx, w, h, params.blurRatio)
          const dy = applyGaussianBlur(rawDy, w, h, params.blurRatio)

          // 픽셀 리매핑
          const remapped = remapFrame(srcImageData, dx, dy)

          // 프레임 캔버스에 그리기
          frameCtx.putImageData(remapped, 0, 0)

          gif.addFrame(frameCanvas, { delay, copy: true })
        }

        // GIF 렌더링
        gif.on('finished', (blob: Blob) => {
          const objectUrl = URL.createObjectURL(blob)
          const timestamp = getTimestampSuffix()
          const filename = `lineboil_${img.name}_${timestamp}.gif`

          resolve({
            blob,
            objectUrl,
            filename,
            format: 'GIF',
            width: w,
            height: h,
          })
        })

        gif.on('error', (err: Error) => {
          reject(new Error(`encodeGIF: GIF 인코딩 중 오류 — ${err.message ?? err}`))
        })

        gif.render()
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    }

    image.onerror = () => {
      reject(new Error('encodeGIF: 이미지를 로드할 수 없습니다.'))
    }

    // CORS 처리 (data URL은 불필요하지만 명시)
    image.crossOrigin = 'anonymous'
    image.src = img.dataUrl
  })
}
