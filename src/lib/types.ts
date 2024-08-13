export type JobId = string

export type StartProcessingEvent = {
  event: 'started'
  fileName: string
  fileId: number
  operation: 'processing'
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
  format: Format
  quality: number
  operation: 'processing'
  originalWidth: number
  originalHeight: number
  pending?: boolean
}

export type ErrorProcessingEvent = {
  event: 'error'
  fileId: number
  fileName: string
  operation: 'processing'
}

export type StartArchivingEvent = {
  event: 'started'
  operation: 'archiving'
}

export type SuccessArchivingEvent = {
  event: 'success'
  path: string
  operation: 'archiving'
}

export type ErrorArchivingEvent = {
  event: 'error'
  operation: 'archiving'
}

export type PingEvent = {
  event: 'ping'
  operation: 'keepalive'
}

export type SuccessFlushingEvent = {
  event: 'success'
  operation: 'flushing'
}

export type ProcessingEvent =
  | StartProcessingEvent
  | SuccessProcessingEvent
  | ErrorProcessingEvent

export type ArchivingEvent =
  | StartArchivingEvent
  | SuccessArchivingEvent
  | ErrorArchivingEvent

export type FlushingEvent = SuccessFlushingEvent

export type Event = ProcessingEvent | ArchivingEvent | FlushingEvent | PingEvent

export enum Format {
  WEBP = 'webp',
  JPEG = 'jpeg',
  PNG = 'png',
  AVIF = 'avif',
}

export interface File extends SuccessProcessingEvent {
  originalWidth: number
  originalHeight: number
}

export type DowloadData = {
  fileName: string
  url: string
}
