'use client'

import { useState, useEffect } from 'react'
import { Dropzone } from '@/components/Dropzone'
import { type SuccessProcessingEvent, type Event } from '@/lib/types'
import { useApiRequest } from '@/hooks/useApiRequest'
import { useStore } from '@/store'
import { ProcessingModal } from '@/components/ProcessingModal/ProcessingModal'
import useWebSocket from 'react-use-websocket'
import { toast } from 'react-toastify'

export const Processor = () => {
  const { processFile, archiveJob, getWebsocketUrl } = useApiRequest()
  const setCurrentJobFiles = useStore(state => state.setCurrentJobFile)
  const setFilePending = useStore(state => state.setFilePending)
  const jobId = useStore(state => state.currentJob.id)

  const onSuccess = (jobId: string, event: SuccessProcessingEvent) => {
    setCurrentJobFiles(jobId, event)
  }
  const [socketUrl, setSocketUrl] = useState<string | null>(null)
  const { lastJsonMessage, sendJsonMessage } = useWebSocket<Event>(socketUrl)
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
      toast.error('An error occurred while processing the image', {
        closeButton: false,
      })
      setFilePending(file, false)
    }
  }

  const onDownloadAll = async () => {
    if (!jobId) return

    setIsDownloadingAll(true)

    try {
      await archiveJob(jobId)
    } catch (error) {
      toast.error('An error occurred while downloading the images', {
        closeButton: false,
      })
      setIsDownloadingAll(false)
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
        } else if (evt.event === 'error') {
          toast.error('An error occurred while processing the image', {
            closeButton: false,
          })
        }
        break
      case 'archiving':
        if (evt.event === 'success') {
          onArchiveDownload(evt.path)
        } else if (evt.event === 'error') {
          toast.error('An error occurred while downloading the images', {
            closeButton: false,
          })
          setIsDownloadingAll(false)
        }
        break
      case 'flushing':
        if (evt.event === 'success') {
          window?.location.reload()
        }
        break
      case 'keepalive':
        sendJsonMessage({ event: 'pong' })
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
