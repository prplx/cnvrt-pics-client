import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useStore } from '@/store'
import { type SuccessProcessingEvent, Format } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getStringifiedConversionRate = (
  sourceFileSize: number,
  targetFileSize: number
) => {
  let sign = ''
  let rate = 0
  if (sourceFileSize > targetFileSize) {
    sign = '-'
    rate = (sourceFileSize - targetFileSize) / sourceFileSize
  } else if (sourceFileSize < targetFileSize) {
    sign = '+'
    rate = (targetFileSize - sourceFileSize) / sourceFileSize
  }

  return `${sign}${Math.round(Number(rate) * 100)}%`
}

const upscaleBytes = (bytes: number): { KB: number; MB: number } => {
  const KB = bytes / 1024
  const MB = bytes / 1024 / 1024

  return {
    KB,
    MB,
  }
}

export const getFormattedFileSize = (bytes: number): string => {
  const { KB, MB } = upscaleBytes(bytes)

  if (MB >= 1) {
    return `${MB.toFixed(1).replace(/\.?0+$/, '')} MB`
  }

  if (KB >= 1) {
    return `${KB.toFixed(1).replace(/\.?0+$/, '')} KB`
  }

  return `${bytes} B`
}

export const removeExtension = (filename: string): string =>
  filename.replace(/\.[^/.]+$/, '')

export const getExtension = (filename: string): string => {
  const matches = filename.match(/\.([^/.]+)$/)

  if (matches) {
    return matches[1]
  }

  return ''
}

export const buildDownloadUrl = (jobId: string, fileName: string) =>
  `${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/${jobId}/${fileName}`

export const getDownloadData = (name: string) => {
  const currentJob = useStore.getState().currentJob
  const file = currentJob.files.find(f => f?.sourceFile === name)
  let fileName = ''
  let url = ''
  if (file && currentJob.id) {
    const extension = getExtension(file.targetFile)
    url = buildDownloadUrl(currentJob.id, file.targetFile)
    fileName = removeExtension(file.sourceFile) + '.' + extension
  }
  return { fileName, url }
}

export const calculateFileHeight = (
  file: SuccessProcessingEvent,
  width: number
): number => {
  const ratio = file.width / file.height
  return Math.round(width / ratio)
}

export const calculateFileWidth = (
  file: SuccessProcessingEvent,
  height: number
): number => {
  const ratio = file.width / file.height
  return Math.round(height * ratio)
}

export const getDropZoneAcceptFromFormats = (): Record<string, []> =>
  Object.values(Format).reduce<Record<string, []>>((acc, format) => {
    acc[`image/${format}`] = []
    return acc
  }, {})

export const getFirst = <T>(prop: T): T extends (infer U)[] ? U : T =>
  Array.isArray(prop) ? prop[0] : prop
