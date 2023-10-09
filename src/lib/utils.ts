import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
