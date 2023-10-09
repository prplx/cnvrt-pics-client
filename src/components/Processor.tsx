'use client'

import { useState } from 'react'
import { Dropzone } from '@/components/Dropzone'
import { Comparator } from '@/components/Comparator'
import {
  type JobId,
  type SuccessProcessingEvent,
  type File,
  Format,
} from '@/lib/types'
import { getStringifiedConversionRate, getFormattedFileSize } from '@/lib/utils'
import { FormatSelector } from '@/components/FormatSelector'
import { Slider } from '@/components/ui/slider'

const buildUrl = (jobId: string, fileName: string) =>
  `${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/${jobId}/${fileName}`

export const Processor = () => {
  const [currentJob, setCurrentJob] = useState<{
    jobId: JobId
    files: File[]
  }>()
  const [format, setFormat] = useState<Format>(Format.WEBP)

  const onSuccess = (jobId: string, event: SuccessProcessingEvent) => {
    setCurrentJob(currentJob => {
      if (!currentJob) {
        return {
          jobId,
          files: [{ ...event, format, quality: 80 }],
        }
      } else {
        const jobFileIdx = currentJob.files.findIndex(
          f => f.fileId === event.fileId
        )
        if (jobFileIdx !== -1) {
          currentJob.files[jobFileIdx] = {
            ...currentJob.files[jobFileIdx],
            ...event,
          }
          return {
            ...currentJob,
            files: [...currentJob.files],
          }
        } else {
          return {
            ...currentJob,
            files: [...currentJob.files, { ...event, format, quality: 80 }],
          }
        }
      }
    })
  }

  const onReset = () => {
    setCurrentJob(undefined)
  }

  const onFilePropertyChange = <
    P extends keyof Pick<File, 'format' | 'quality'>,
    V extends File[P]
  >(
    file: File,
    property: P,
    value: V
  ) => {
    const jobFile = currentJob?.files.find(f => f.fileId === file.fileId)
    if (!currentJob || !jobFile) return

    if (currentJob && jobFile) {
      jobFile[property] = value
      requestOperation(jobFile)
      setCurrentJob({ ...currentJob })
    }
  }

  const onFileFormatChange = (file: File) => (format: Format) => {
    onFilePropertyChange(file, 'format', format)
  }

  const onFileQualityChange = (file: File) => (quality: number[]) => {
    onFilePropertyChange(file, 'quality', quality[0])
  }

  const requestOperation = async (file: File) => {
    if (!currentJob) return

    const queryParams = new URLSearchParams({
      format: file.format,
      quality: String(file.quality),
      file_id: String(file.fileId),
    })

    try {
      await (
        await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/process/${currentJob.jobId}?${queryParams}`,
          {
            method: 'POST',
          }
        )
      ).json()
    } catch (error) {
      console.error(error)
    } finally {
      // setUploading(false)
    }
  }

  return (
    <>
      <Dropzone
        format={format}
        onFormatChange={setFormat}
        onSuccess={onSuccess}
        onReset={onReset}
      />
      {!currentJob && (
        <div className='mt-4'>
          <FormatSelector value={format} onChange={setFormat}></FormatSelector>
        </div>
      )}
      {currentJob &&
        currentJob.files.map(file => (
          <div className='mt-8 w-full' key={file.sourceFile}>
            <div className='flex justify-between w-5/6'>
              <div>
                Source file size: {getFormattedFileSize(+file.sourceFileSize)}
              </div>
              <div>
                Compressed file size:{' '}
                {getFormattedFileSize(+file.targetFileSize)} (
                {getStringifiedConversionRate(
                  +file.sourceFileSize,
                  +file.targetFileSize
                )}
                )
              </div>
            </div>
            <div className='flex'>
              <div className='w-5/6'>
                <Comparator
                  sourceUrl={buildUrl(currentJob.jobId, file.sourceFile)}
                  targetUrl={buildUrl(currentJob.jobId, file.targetFile)}
                />
              </div>
              <div className='w-1/6'>
                <div className='ml-4'>
                  <FormatSelector
                    value={file.format}
                    onChange={onFileFormatChange(file)}
                  ></FormatSelector>
                  <div className='flex mt-4 items-center'>
                    <Slider
                      defaultValue={[80]}
                      max={100}
                      step={1}
                      onValueCommit={onFileQualityChange(file)}
                      className='w-[140px]'
                    ></Slider>
                    <div className='ml-4'>{file.quality}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
    </>
  )
}
