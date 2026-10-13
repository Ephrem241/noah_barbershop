import { requireSupabase, supabase } from './supabase'

export const MEDIA_BUCKET = 'media'
export const MAX_UPLOAD_MB = 50 // Supabase free plan per-file limit
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

/** Seeded assets are site paths ("/images/…"); uploads are Storage object paths ("gallery/<uuid>.webp"). */
export const isStoragePath = (path: string) => !path.startsWith('/') && !/^https?:\/\//.test(path)

export function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (!isStoragePath(path)) return path
  return supabase?.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))

/** Resize in the browser (long edge ≤ maxSize) and re-encode as WebP, or JPEG where WebP encoding is missing. */
export async function prepareImage(file: File, maxSize = 1600): Promise<Blob> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error(`“${file.name}” isn’t an image this browser can read. Please use JPG, PNG or WebP.`)
  }
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const webp = await toBlob(canvas, 'image/webp', 0.85)
  if (webp && webp.type === 'image/webp') return webp
  const jpeg = await toBlob(canvas, 'image/jpeg', 0.85)
  if (!jpeg) throw new Error('Could not process the image.')
  return jpeg
}

/** Grab a frame (~0.5 s in) as the video's poster image. */
export function videoPoster(file: File, maxSize = 1080): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const src = URL.createObjectURL(file)
    const video = document.createElement('video')
    const fail = () => {
      URL.revokeObjectURL(src)
      reject(new Error('This browser can’t read that video. Please upload an MP4 (H.264) file.'))
    }
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.onerror = fail
    video.onloadeddata = () => {
      video.currentTime = Math.min(0.5, (video.duration || 1) / 2)
    }
    video.onseeked = async () => {
      const scale = Math.min(1, maxSize / Math.max(video.videoWidth, video.videoHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(video.videoWidth * scale)
      canvas.height = Math.round(video.videoHeight * scale)
      canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(src)
      const blob = await toBlob(canvas, 'image/jpeg', 0.82)
      if (blob) resolve(blob)
      else fail()
    }
    video.src = src
  })
}

async function upload(blob: Blob, folder: string, ext: string): Promise<string> {
  const path = `${folder}/${crypto.randomUUID()}.${ext}`
  const { error } = await requireSupabase()
    .storage.from(MEDIA_BUCKET)
    .upload(path, blob, { contentType: blob.type, cacheControl: '31536000', upsert: false })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  return path
}

export async function uploadImage(file: File, folder: string, maxSize?: number): Promise<string> {
  const blob = await prepareImage(file, maxSize)
  return upload(blob, folder, blob.type === 'image/webp' ? 'webp' : 'jpg')
}

export async function uploadVideo(file: File, folder: string): Promise<{ path: string; posterPath: string }> {
  if (!VIDEO_TYPES.includes(file.type)) {
    throw new Error(`“${file.name}” isn’t a supported video. Please upload an MP4 (H.264).`)
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `“${file.name}” is ${(file.size / 1024 / 1024).toFixed(0)} MB — the limit is ${MAX_UPLOAD_MB} MB. Trim or compress it first (see docs/ADMIN_SETUP.md).`,
    )
  }
  const poster = await videoPoster(file)
  const ext = file.type === 'video/webm' ? 'webm' : file.type === 'video/quicktime' ? 'mov' : 'mp4'
  const path = await upload(file, folder, ext)
  const posterPath = await upload(poster, folder, 'jpg')
  return { path, posterPath }
}

/** Delete uploaded files. Site paths (seeded "/images/…") are skipped — they ship with the site. */
export async function removeMedia(...paths: (string | null | undefined)[]) {
  const stored = paths.filter((p): p is string => !!p && isStoragePath(p))
  if (!stored.length) return
  const { error } = await requireSupabase().storage.from(MEDIA_BUCKET).remove(stored)
  if (error) console.warn('Could not delete media files:', error.message)
}
