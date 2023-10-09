export type JobId = string

export type StartProcessingEvent = {
  event: 'started'
  fileName: string
  fileId: number
}

export interface SuccessProcessingEvent {
  event: 'success'
  fileId: number
  sourceFile: string
  targetFile: string
  sourceFileSize: string
  targetFileSize: string
}

export enum Format {
  WEBP = 'webp',
  JPEG = 'jpeg',
  PNG = 'png',
}

export interface File extends SuccessProcessingEvent {
  format: Format
  quality: number
}
