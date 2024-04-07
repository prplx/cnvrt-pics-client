'use client'

import { useCallback, useEffect, type FC } from 'react'
import { useDropzone } from 'react-dropzone'
import { Format } from '@/lib/types'
import { DownloadCloud, Paperclip } from 'lucide-react'
import { Button } from '@nextui-org/react'
import { useApiRequest } from '@/hooks/useApiRequest'
import { useStore } from '@/store'
import { DEFAULT_IMAGE_QUALITY } from '@/lib/constants'
import { FormatSelector } from '@/components/FormatSelector'
import { getDropZoneAcceptFromFormats, areFilesValid } from '@/lib/utils'
import { toast } from 'react-toastify'

export const Dropzone: FC = () => {
  const { processJob } = useApiRequest()
  const format = useStore(state => state.format)
  const setFormat = useStore(state => state.setFormat)
  const jobId = useStore(state => state.currentJob.id)
  const setJobId = useStore(state => state.setCurrentJobId)
  const setUploadedFiles = useStore(state => state.setUploadedFiles)
  const uploadedFiles = useStore(state => state.uploadedFiles)

  const onUpload = async () => {
    const formData = new FormData()
    const queryParams = new URLSearchParams({
      format,
      quality: DEFAULT_IMAGE_QUALITY.toString(),
    })
    if (jobId) {
      queryParams.append('jobId', jobId)
    }
    uploadedFiles.forEach(file => {
      formData.append('image', new Blob([file]), file.name)
    })

    let data: any
    try {
      data = await processJob(formData, queryParams)
    } catch (error) {
      toast.error('An error occurred while processing the images', {
        closeButton: false,
      })
    }

    if (!data) return

    if (!jobId) {
      setJobId(data.job_id)
    }
  }
  const onDrop = useCallback((files: File[]) => {
    if (
      !files.length ||
      files.length > parseInt(process.env.NEXT_PUBLIC_MAX_FILE_COUNT ?? '', 10)
    ) {
      toast.error(
        `Please upload up to ${process.env.NEXT_PUBLIC_MAX_FILE_COUNT} images`,
        {
          closeButton: false,
        }
      )
      return
    }
    areFilesValid(files).then(valid => {
      if (!valid) {
        toast.error(
          `Only ${Object.values(Format).join(', ')} file types are supported`,
          {
            closeButton: false,
          }
        )
        return
      } else {
        setUploadedFiles(files)
      }
    })
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getDropZoneAcceptFromFormats(),
  })
  const originalDropZoneOnClick = getRootProps().onClick

  useEffect(() => {
    uploadedFiles.length && !jobId && onUpload()
  }, [uploadedFiles])

  return (
    <div className='flex flex-col items-center mx-auto bg-slate-900/60 text-white rounded-3xl p-10 shadow-md'>
      <div
        {...getRootProps()}
        onClick={undefined}
        className='w-full h-60 flex flex-col justify-center items-center mx-auto border rounded-xl border-dashed border-slate-500'
      >
        <input {...getInputProps()} />
        <div className='text-purple mb-2'>
          <DownloadCloud size={32} />
        </div>
        {isDragActive ? (
          <p>Drop the images here ...</p>
        ) : (
          <p>Drag & drop images here</p>
        )}
        <span className='text-white/50'>or</span>
        <Button
          variant='flat'
          size='sm'
          radius='sm'
          className='mt-2 text-white'
          startContent={<Paperclip size={16} />}
          onPress={e => originalDropZoneOnClick?.(e as never)}
        >
          Choose files
        </Button>
        <div className='mt-4'>
          <span className='text-white/50'>
            Your default target format is &nbsp;
          </span>
          <FormatSelector
            value={format}
            trigger={(format: Format) => (
              <span className='border-b-1 border-dashed cursor-pointer'>
                {format.toUpperCase()}
              </span>
            )}
            onChange={setFormat}
          />
        </div>
      </div>
    </div>
  )
}
