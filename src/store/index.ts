import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { type JobId, Format, SuccessProcessingEvent } from '@/lib/types'

interface State {
  format: Format
  currentJob: {
    id: JobId | null
    files: SuccessProcessingEvent[]
  }
  uploadedFiles: File[]
  lastProcessingEvent: SuccessProcessingEvent | null
  setCurrentJobId: (id: JobId) => void
  setCurrentJobFile: (id: JobId, evt: SuccessProcessingEvent) => void
  setFormat: (f: Format) => void
  setUploadedFiles: (files: File[]) => void
  setLastProcessingEvent: (evt: SuccessProcessingEvent) => void
  setFilePending: (file: SuccessProcessingEvent, isPending: boolean) => void
  reset: () => void
}

type ExcludeFunctions<T extends {}> = Omit<
  T,
  { [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never }[keyof T]
>

const initialState: ExcludeFunctions<State> = {
  format: Format.WEBP,
  currentJob: {
    id: null,
    files: [],
  },
  uploadedFiles: [],
  lastProcessingEvent: null,
}

export const useStore = create<State>()(
  devtools(
    immer((set, get) => ({
      ...initialState,
      setCurrentJobId: id =>
        set(state => {
          state.currentJob.id = id
        }),
      setCurrentJobFile: (jobId, event) =>
        set(state => {
          const currentJob = get().currentJob
          if (currentJob.id !== jobId) {
            return
          }
          const uploadedFiles = get().uploadedFiles
          const uploadedFileIdx = uploadedFiles.findIndex(
            f => f.name === event.sourceFile
          )
          state.lastProcessingEvent = event
          if (uploadedFileIdx !== -1) {
            state.currentJob.files[uploadedFileIdx] = event
          }
        }),
      setFormat: format =>
        set(state => {
          state.format = format
        }),
      setUploadedFiles: files =>
        set(state => {
          state.uploadedFiles = files
        }),
      setLastProcessingEvent: evt =>
        set(state => {
          state.lastProcessingEvent = evt
        }),
      setFilePending: (file, isPending) =>
        set(state => {
          const jobFileIdx = state.currentJob.files.findIndex(
            f => f.fileId === file.fileId
          )
          if (jobFileIdx !== -1) {
            state.currentJob.files[jobFileIdx].pending = isPending
          }
        }),
      reset: () => set(() => initialState),
    }))
  )
)
