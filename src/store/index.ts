import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { type JobId, Format } from '@/lib/types'

interface State {
  format: Format
  currentJob: {
    id: JobId | null
    files: File[]
  }
  uploadedFiles: File[]
  setCurrentJobId: (id: JobId) => void
  setFormat: (f: Format) => void
  setUploadedFiles: (files: File[]) => void
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
}

export const useStore = create<State>()(
  devtools(
    immer(set => ({
      ...initialState,
      setCurrentJobId: id =>
        set(state => {
          state.currentJob.id = id
        }),
      setFormat: format =>
        set(state => {
          state.format = format
        }),
      setUploadedFiles: files =>
        set(state => {
          state.uploadedFiles = files
        }),
      reset: () => set(() => initialState),
    }))
  )
)
