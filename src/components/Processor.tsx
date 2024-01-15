'use client'

import { useState, useEffect } from 'react'
import { Dropzone } from '@/components/Dropzone'
import { type SuccessProcessingEvent, type Event } from '@/lib/types'
import { useApiRequest } from '@/hooks/useApiRequest'
import { useStore } from '@/store'
import { ProcessingModal } from '@/components/ProcessingModal'
import useWebSocket from 'react-use-websocket'

export const Processor = () => {
  const { processFile, archiveJob, getWebsocketUrl } = useApiRequest()
  const setCurrentJobFiles = useStore(state => state.setCurrentJobFile)
  const setFilePending = useStore(state => state.setFilePending)
  const jobId = useStore(state => state.currentJob.id)

  const onSuccess = (jobId: string, event: SuccessProcessingEvent) => {
    setCurrentJobFiles(jobId, event)
  }
  const [socketUrl, setSocketUrl] = useState<string | null>(null)
  const { lastJsonMessage } = useWebSocket<Event>(socketUrl)
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)

  const onChangeFileProperties = async (
    file: SuccessProcessingEvent,
    props: Partial<SuccessProcessingEvent>
  ) => {
    if (!jobId) return

    const wasSomethingChanged = Object.entries(props).some(
      ([key, value]) => file[key as keyof SuccessProcessingEvent] !== value
    )
    if (!wasSomethingChanged) return

    const queryParams = new URLSearchParams({
      format: props.format ?? file.format,
      quality: String(props.quality ?? file.quality),
      file_id: String(file.fileId),
      width: String(props.width ?? file.width),
      height: String(props.height ?? file.height),
    })

    setFilePending(file, true)
    try {
      await processFile(jobId, queryParams)
    } catch (error) {
      console.error(error)
    } finally {
      setFilePending(file, false)
    }
  }

  const onDownloadAll = async () => {
    if (!jobId) return

    setIsDownloadingAll(true)

    try {
      await archiveJob(jobId)
    } catch (error) {
      // TODO: handle error
      console.error(error)
    }
  }

  const onArchiveDownload = async (filePath: string) => {
    const a = document.createElement('a')
    a.href = `${process.env.NEXT_PUBLIC_SERVER_URL}/${filePath}`
    a.addEventListener('click', () => {
      a.parentNode?.removeChild(a)
    })
    a.click()
    setIsDownloadingAll(false)
  }

  useEffect(() => {
    if (!lastJsonMessage || !jobId) return
    const evt: Event = lastJsonMessage

    switch (evt.operation) {
      case 'processing':
        if (evt.event === 'success') {
          onSuccess(jobId, evt)
        }
        break
      // TODO: handle error
      case 'archiving':
        if (evt.event === 'success') {
          onArchiveDownload(evt.path)
        }
        break
      // TODO: handle error
      case 'flushing':
        if (evt.event === 'success') {
          window?.location.reload()
        }
        break
    }
  }, [lastJsonMessage])

  useEffect(() => {
    if (!jobId) return
    setSocketUrl(getWebsocketUrl(jobId))
  }, [jobId])

  return (
    <div className='mt-10'>
      <Dropzone />
      <ProcessingModal
        isDownloadingAll={isDownloadingAll}
        onDownloadAll={onDownloadAll}
        onChangeFileProperties={onChangeFileProperties}
      />
    </div>
  )
}
