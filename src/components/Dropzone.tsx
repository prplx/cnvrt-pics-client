'use client'

import { useCallback, useEffect, type FC } from 'react'
import { useDropzone } from 'react-dropzone'
import { Format } from '@/lib/types'
import { DownloadCloud, Paperclip } from 'lucide-react'
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react'
import { useApiRequest } from '@/hooks/useApiRequest'
import { useStore } from '@/store'
import { DEFAULT_IMAGE_QUALITY } from '@/lib/constants'

type Props = {}

export const Dropzone: FC<Props> = () => {
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
      // TODO: handle error
      console.error(error)
    }

    if (!data) return

    if (!jobId) {
      setJobId(data.job_id)
    }
  }
  const onDrop = useCallback((files: File[]) => {
    setUploadedFiles(files)
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
  const originalDropZoneOnClick = getRootProps().onClick

  useEffect(() => {
    uploadedFiles.length && onUpload()
  }, [uploadedFiles])

  return (
    <div className='flex flex-col items-center mx-auto bg-slate-800/50 text-white rounded-3xl w-3/4 p-10'>
      <div
        {...getRootProps()}
        onClick={undefined}
        className='w-full h-60 flex flex-col justify-center items-center cursor-pointer mx-auto border rounded-xl border-dashed border-slate-400'
      >
        <input {...getInputProps()} />
        <div className='text-emerald mb-2'>
          <DownloadCloud size={32} />
        </div>
        {isDragActive ? (
          <p>Drop the images here ...</p>
        ) : (
          <p>Drag&drop images here</p>
        )}
        <span className='text-slate-500'>or</span>
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
          <span className='text-slate-500'>
            Your default target format is &nbsp;
          </span>
          <Dropdown>
            <DropdownTrigger>
              <span className='border-b-1 border-dashed'>
                {format.toUpperCase()}
              </span>
            </DropdownTrigger>
            <DropdownMenu
              selectionMode='single'
              selectedKeys={[format]}
              onAction={key => setFormat(key as Format)}
            >
              {Object.values(Format).map(format => (
                <DropdownItem key={format}>{format.toUpperCase()}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
  )
}
