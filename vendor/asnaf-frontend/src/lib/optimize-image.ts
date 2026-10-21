/** Client-side resize before upload. JPEG photos are compressed; PNG logos keep PNG. */

const DEFAULT_MAX_EDGE = 1600
const DEFAULT_QUALITY = 0.88

export async function optimizeImageFile(
  file: File,
  options?: { maxEdge?: number; quality?: number },
): Promise<File> {
  if (!file.type.startsWith('image/') && !isPngFileName(file.name)) {
    return file
  }

  const maxEdge = options?.maxEdge ?? DEFAULT_MAX_EDGE
  const quality = options?.quality ?? DEFAULT_QUALITY
  const keepPng = isPngFile(file)

  try {
    const bitmap = await createImageBitmap(file)
    try {
      const longest = Math.max(bitmap.width, bitmap.height)
      const scale = longest > maxEdge ? maxEdge / longest : 1
      const width = Math.max(1, Math.round(bitmap.width * scale))
      const height = Math.max(1, Math.round(bitmap.height * scale))

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) {
        return file
      }
      if (!keepPng) {
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, width, height)
      }
      context.drawImage(bitmap, 0, 0, width, height)

      const mime = keepPng ? 'image/png' : 'image/jpeg'
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, mime, keepPng ? undefined : quality)
      })
      if (!blob) {
        return file
      }
      if (keepPng && scale === 1 && blob.size >= file.size) {
        return file
      }

      const ext = keepPng ? 'png' : 'jpg'
      const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
      return new File([blob], `${baseName}.${ext}`, {
        type: mime,
        lastModified: Date.now(),
      })
    } finally {
      bitmap.close()
    }
  } catch {
    return file
  }
}

function isPngFile(file: File) {
  return file.type === 'image/png' || isPngFileName(file.name)
}

function isPngFileName(name: string) {
  return /\.png$/i.test(name)
}
