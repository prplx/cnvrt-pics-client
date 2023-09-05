'use client'

import { use, useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { pusher } from '@/lib/pusher'
import { Loader2 } from 'lucide-react'

type StartProcessingEvent = {
  event: 'started'
  file: string
}

type FinishProcessingEvent = {
  event: 'finished'
  file: string
}

type Event = StartProcessingEvent | FinishProcessingEvent

export const Dropzone = () => {
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState<Record<string, boolean>>({})
  const onUpload = async () => {
    setUploading(true)
    const formData = new FormData()
    files.forEach(file => {
      formData.append('image', new Blob([file]), file.name)
    })
    let data: any
    try {
      data = await (
        await fetch('http://localhost:3001/api/v1/process', {
          method: 'POST',
          body: formData,
        })
      ).json()
    } catch (error) {
      console.error(error)
    } finally {
      setUploading(false)
    }

    if (!data) return

    const channel = pusher.subscribe(data.job_id)
    channel.bind('processing', (data: Event) => {
      switch (data.event) {
        case 'started':
          return setProcessing(processing => ({
            ...processing,
            [data.file]: true,
          }))
        default:
          throw new Error('Invalid event')
      }
    })
  }
  const onDrop = useCallback(setFiles, [])
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
  }, [files])

  return (
    <>
      <div
        {...getRootProps()}
        className='border border-slate-600 w-1/2 h-96 flex justify-center items-center rounded-lg cursor-pointer'
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
          <div key={th.slice(32)}>
            <img src={th} className='w-20 h-20 m-4' />
            {processing[files[idx]?.name] && (
              <span>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Processing
              </span>
            )}
          </div>
        ))}
      </section>
      <Button
        onClick={onUpload}
        disabled={!files.length || uploading}
        className='mt-10'
      >
        Upload
      </Button>
    </>
  )
}
