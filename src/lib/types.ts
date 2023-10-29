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
  width: number
  height: number
}

export type ErrorProcessingEvent = {
  event: 'error'
  fileId: number
  fileName: string
}

export type StartArchivingEvent = {
  event: 'started'
}

export type SuccessArchivingEvent = {
  event: 'success'
  path: string
}

export type ErrorArchivingEvent = {
  event: 'error'
}

export type ProcessingEvent =
  | StartProcessingEvent
  | SuccessProcessingEvent
  | ErrorProcessingEvent

export type ArchivingEvent =
  | StartArchivingEvent
  | SuccessArchivingEvent
  | ErrorArchivingEvent

export enum Format {
  WEBP = 'webp',
  JPEG = 'jpeg',
  PNG = 'png',
}

export interface File extends SuccessProcessingEvent {
  format: Format
  quality: number
  originalWidth: number
  originalHeight: number
}
