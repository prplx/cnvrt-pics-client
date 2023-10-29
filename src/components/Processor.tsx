'use client'

import { useState, useEffect } from 'react'
import { Dropzone } from '@/components/Dropzone'
import { Comparator } from '@/components/Comparator'
import {
  type JobId,
  type SuccessProcessingEvent,
  type File,
  Format,
} from '@/lib/types'
import {
  getStringifiedConversionRate,
  getFormattedFileSize,
  removeExtension,
  getExtension,
} from '@/lib/utils'
import { FormatSelector } from '@/components/FormatSelector'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

const buildUrl = (jobId: string, fileName: string) =>
  `${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/${jobId}/${fileName}`

export const Processor = () => {
  const [currentJob, setCurrentJob] = useState<{
    jobId: JobId
    files: File[]
  }>()
  const [format, setFormat] = useState<Format>(Format.WEBP)
  const [fileToQualityMap, setFileToQualityMap] = useState<
    Record<File['fileId'], number>
  >({})
  const [fileToDimensionsMap, setFileToDimensionsMap] = useState<
    Record<File['fileId'], { width: number; height: number }>
  >({})

  const onSuccess = (jobId: string, event: SuccessProcessingEvent) => {
    console.log('event:', event)
    setCurrentJob(currentJob => {
      if (!currentJob) {
        return {
          jobId,
          files: [
            {
              ...event,
              format,
              quality: 80,
              originalWidth: event.width,
              originalHeight: event.height,
            },
          ],
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
            files: [
              ...currentJob.files,
              {
                ...event,
                format,
                quality: 80,
                originalWidth: event.width,
                originalHeight: event.height,
              },
            ],
          }
        }
      }
    })
  }

  const onReset = () => {
    setCurrentJob(undefined)
  }

  const onFilePropertyChange = <
    P extends keyof Pick<File, 'format' | 'quality' | 'width'>,
    V extends File[P]
  >(
    file: File,
    property: P,
    value: V
  ) => {
    const jobFile = currentJob?.files.find(f => f.fileId === file.fileId)
    if (!currentJob || !jobFile) return

    if (property === 'width') {
      jobFile['height'] = fileToDimensionsMap[file.fileId].height
    }

    if (currentJob && jobFile) {
      jobFile[property] = value
      requestOperation(jobFile)
      setCurrentJob({ ...currentJob })
    }
  }

  const onFileFormatChange = (file: File) => (format: Format) => {
    onFilePropertyChange(file, 'format', format)
  }

  const onFileQualityCommit = (file: File) => (quality: number[]) => {
    onFilePropertyChange(file, 'quality', quality[0])
  }

  const onFileWidthCommit = (file: File) => (width: number[]) => {
    onFilePropertyChange(file, 'width', width[0])
  }

  const requestOperation = async (file: File) => {
    if (!currentJob) return

    const queryParams = new URLSearchParams({
      format: file.format,
      quality: String(file.quality),
      file_id: String(file.fileId),
      width: String(file.width),
      height: String(file.height),
    })

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/process/${currentJob.jobId}?${queryParams}`,
        {
          method: 'POST',
        }
      )
    } catch (error) {
      console.error(error)
    }
  }

  const onDownloadAll = async () => {
    if (!currentJob) return

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/archive/${currentJob.jobId}`,
        {
          method: 'POST',
        }
      )
    } catch (error) {
      console.error(error)
    }
  }

  const onFileQualityChange = (file: File, quality: number) =>
    setFileToQualityMap({ ...fileToQualityMap, [file.fileId]: quality })

  const onFileWidthChange = (file: File, width: number) => {
    const ratio = file.width / file.height
    const newHeight = Math.round(width / ratio)
    setFileToDimensionsMap({
      ...fileToDimensionsMap,
      [file.fileId]: { width, height: newHeight },
    })
  }

  useEffect(() => {
    const qualityDimensionsMap: {
      quality: Record<File['fileId'], number>
      dimensions: Record<File['fileId'], { width: number; height: number }>
    } = {
      quality: {},
      dimensions: {},
    }
    currentJob?.files.forEach(file => {
      qualityDimensionsMap.quality[file.fileId] = file.quality
      qualityDimensionsMap.dimensions[file.fileId] = {
        width: file.width,
        height: file.height,
      }
    })

    setFileToQualityMap({
      ...fileToQualityMap,
      ...qualityDimensionsMap.quality,
    })
    setFileToDimensionsMap({
      ...fileToDimensionsMap,
      ...qualityDimensionsMap.dimensions,
    })
  }, [currentJob])

  const getDownloadData = (name: string) => {
    const file = currentJob?.files.find(f => f.sourceFile === name)
    let fileName = ''
    let url = ''
    if (file && currentJob?.jobId) {
      const extension = getExtension(file.targetFile)
      url = buildUrl(currentJob.jobId, file.targetFile)
      fileName = removeExtension(file.sourceFile) + '.' + extension
    }
    return { fileName, url }
  }

  const onArchiveDownload = async (filePath: string) => {
    const a = document.createElement('a')
    a.href = `${process.env.NEXT_PUBLIC_SERVER_URL}/${filePath}`
    a.addEventListener('click', () => {
      a.parentNode?.removeChild(a)
    })
    a.click()
  }

  return (
    <>
      <Dropzone
        format={format}
        onFormatChange={setFormat}
        onSuccess={onSuccess}
        onReset={onReset}
        getDownloadData={getDownloadData}
        onArchiveDownload={onArchiveDownload}
      />
      {!currentJob && (
        <div className='mt-4'>
          <FormatSelector value={format} onChange={setFormat} />
        </div>
      )}
      {(currentJob?.files.length || 0) > 1 && (
        <Button onClick={onDownloadAll}>Download all</Button>
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
                  Format
                  <FormatSelector
                    value={file.format}
                    onChange={onFileFormatChange(file)}
                  />
                  <div className='mt-4 '>
                    Quality
                    <div className='flex items-center'>
                      <Slider
                        defaultValue={[80]}
                        min={10}
                        max={100}
                        step={1}
                        onValueCommit={onFileQualityCommit(file)}
                        onValueChange={value =>
                          onFileQualityChange(file, value[0])
                        }
                        className='w-[140px]'
                      />
                      <div className='ml-4'>
                        {fileToQualityMap[file.fileId]}
                      </div>
                    </div>
                  </div>
                  <div className='mt-4'>
                    Resize
                    <div className='flex items-center'>
                      <Slider
                        defaultValue={[file.width]}
                        min={10}
                        max={file.originalWidth}
                        step={1}
                        onValueCommit={onFileWidthCommit(file)}
                        onValueChange={value =>
                          onFileWidthChange(file, value[0])
                        }
                        className='w-[140px]'
                      />
                      <div className='ml-4'>
                        {fileToDimensionsMap[file.fileId]?.width}x
                        {fileToDimensionsMap[file.fileId]?.height}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
    </>
  )
}
