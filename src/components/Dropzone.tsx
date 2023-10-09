'use client'

import { useCallback, useEffect, useState, useRef, type FC } from 'react'
import { useDropzone } from 'react-dropzone'
import { pusher, type Channel } from '@/lib/pusher'
import {
  type StartProcessingEvent,
  type SuccessProcessingEvent,
  Format,
} from '@/lib/types'
import { Loader2 } from 'lucide-react'

type Event = StartProcessingEvent | SuccessProcessingEvent

type Props = {
  format: Format
  onFormatChange: (format: Format) => void
  onSuccess: (jobId: string, event: SuccessProcessingEvent) => void
  onReset: () => void
}

export const Dropzone: FC<Props> = ({ format, onSuccess, onReset }) => {
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [_uploading, setUploading] = useState(false)
  const [jobId, setJobId] = useState<string>()
  const [processing, setProcessing] = useState<Record<string, boolean>>({})
  const channelRef = useRef<Channel>()
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
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/process?${queryParams}`,
          {
            method: 'POST',
            body: formData,
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
      channelRef.current = pusher.subscribe('cache-' + data.job_id)
      channelRef.current.bind('processing', (evt: Event) => {
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
            onSuccess(data.job_id, evt)
            break
          default:
            throw new Error('Invalid event')
        }
      })
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
    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [])

  return (
    <div className='flex flex-col items-center mx-auto'>
      <div
        {...getRootProps()}
        className='border border-slate-600 w-full h-96 flex justify-center items-center rounded-lg cursor-pointer mx-auto'
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>

      <section className='flex'>
        {thumbnails.map((th, idx) => (
          <div key={th.slice(32)} className='relative m-4'>
            <img src={th} className='w-20 h-20' />
            {processing[files[idx]?.name] && (
              <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                <Loader2 className='h-8 w-8 animate-spin text-white' />
              </span>
            )}
          </div>
        ))}
      </section>
    </div>
  )
}
