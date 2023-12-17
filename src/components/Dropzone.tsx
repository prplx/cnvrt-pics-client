'use client'

import { useCallback, useEffect, useState, useRef, type FC } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  type StartProcessingEvent,
  type SuccessProcessingEvent,
  type ProcessingEvent,
  type ArchivingEvent,
  Format,
} from '@/lib/types'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useWebSocket from 'react-use-websocket'
import { useGetAppCheckToken } from '@/hooks/useGetAppCheckToken'

type Props = {
  format: Format
  onFormatChange: (format: Format) => void
  onSuccess: (jobId: string, event: SuccessProcessingEvent) => void
  onReset: () => void
  getDownloadData: (fileName: string) => { url: string; fileName: string }
  onArchiveDownload: (filePath: string) => void
}

export const Dropzone: FC<Props> = ({
  format,
  onSuccess,
  onReset,
  getDownloadData,
  onArchiveDownload,
}) => {
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [_uploading, setUploading] = useState(false)
  const [jobId, setJobId] = useState<string>()
  const [processing, setProcessing] = useState<Record<string, boolean>>({})
  const [socketUrl, setSocketUrl] = useState<string | null>(null)
  const { lastJsonMessage } = useWebSocket(socketUrl)
  const [appCheckToken, setAppCheckToken] = useState<string>()
  const getAppCheckToken = useGetAppCheckToken()

  const onUpload = async () => {
    setUploading(true)
    const formData = new FormData()
    const queryParams = new URLSearchParams({ format, quality: '80' })
    if (jobId) {
      queryParams.append('jobId', jobId)
    }
    files.forEach(file => {
      formData.append('image', new Blob([file]), file.name)
    })

    let data: any
    try {
      data = await (
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/process?${queryParams}`,
          {
            method: 'POST',
            body: formData,
            headers: {
              'X-Firebase-AppCheck': appCheckToken ?? '',
            },
          }
        )
      ).json()
    } catch (error) {
      console.error(error)
    } finally {
      setUploading(false)
    }

    if (!data) return

    if (!jobId) {
      setJobId(data.job_id)
      setSocketUrl(
        `${process.env.NEXT_PUBLIC_SERVER_WS_URL}/${
          data.job_id
        }?appCheckToken=${appCheckToken ?? ''}`
      )
    }
  }
  const onDrop = useCallback((files: File[]) => {
    onReset()
    setThumbnails([])
    setFiles(files)
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  useEffect(() => {
    files.forEach(file => {
      const thumbnailReader = new FileReader()
      thumbnailReader.onabort = () => console.log('file reading was aborted')
      thumbnailReader.onerror = () => console.log('file reading has failed')
      thumbnailReader.onload = () => {
        const binaryStr = thumbnailReader.result as string
        setThumbnails(th => [...th, binaryStr])
      }
      thumbnailReader.readAsDataURL(file)
    })
    files.length && onUpload()
  }, [files])

  useEffect(() => {
    files.length && onUpload()
  }, [format])

  useEffect(() => {
    if (!lastJsonMessage || !jobId) return
    const evt: any = lastJsonMessage
    if (evt.operation === 'processing') {
      switch (evt.event) {
        case 'started':
          return setProcessing(processing => ({
            ...processing,
            [evt.fileName]: true,
          }))
        case 'success':
          setProcessing(processing => ({
            ...processing,
            [evt.sourceFile]: false,
          }))
          onSuccess(jobId, evt)
          break
      }
    } else if (evt.operation === 'archiving') {
      switch (evt.event) {
        case 'success':
          onArchiveDownload(evt.path)
          break
      }
    } else if (evt.operation === 'flushing') {
      switch (evt.event) {
        case 'success':
          window?.location.reload()
          break
      }
    }
  }, [lastJsonMessage])

  useEffect(() => {
    getAppCheckToken().then(setAppCheckToken)
  })

  return (
    <div className='flex flex-col items-center mx-auto'>
      <div
        {...getRootProps()}
        className='border border-slate-600 w-full h-60 flex justify-center items-center rounded-lg cursor-pointer mx-auto'
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>

      <section className='flex'>
        {thumbnails.map((th, idx) => {
          const downloadData = getDownloadData(files[idx].name)
          return (
            <div
              key={th.slice(32, 64)}
              className='relative m-4 w-32 h-32 overflow-hidden rounded-md'
            >
              <img
                src={th}
                className='absolute w-100 h-100 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2'
              />
              {processing[files[idx]?.name] && (
                <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                  <Loader2 className='h-8 w-8 animate-spin text-white' />
                </span>
              )}
              {downloadData.url && (
                <div className='absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-1'>
                  <Button variant='outline'>
                    <a href={downloadData.url} download={downloadData.fileName}>
                      Download
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </section>
    </div>
  )
}
