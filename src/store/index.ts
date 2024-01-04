import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import {
  type JobId,
  type SuccessProcessingEvent,
  type File,
  Format,
} from '@/lib/types'

interface State {
  format: Format
  currentJob: {
    id: JobId | null
    files: File[]
  }
  setCurrentJobId: (id: JobId) => void
  setFormat: (f: Format) => void
}

export const useStore = create<State>()(
  devtools(
    immer(set => ({
      format: Format.WEBP,
      currentJob: {
        id: null,
        files: [],
      },
      setCurrentJobId: id =>
        set(state => {
          state.currentJob.id = id
        }),
      setFormat: format =>
        set(state => {
          state.format = format
        }),
    }))
  )
)
