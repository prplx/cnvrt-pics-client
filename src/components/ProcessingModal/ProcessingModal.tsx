'use client'

import {
  useEffect,
  useCallback,
  useRef,
  type FC,
  type DOMAttributes,
} from 'react'
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  Skeleton,
  Button,
  Link,
} from '@nextui-org/react'
import clsx from 'clsx'
import { useStore } from '@/store'
import { SuccessProcessingEvent, type DowloadData } from '@/lib/types'
import {
  getDownloadData,
  getStringifiedConversionRate,
  getFormattedFileSize,
  buildDownloadUrl,
  calculateFileHeight,
  calculateFileWidth,
  getFirst,
} from '@/lib/utils'
import { useImmer } from 'use-immer'
import { Slider } from '@nextui-org/react'
import { Comparator } from '@/components/Comparator'
import { DEFAULT_IMAGE_QUALITY } from '@/lib/constants'
import { FormatSelector } from '@/components/FormatSelector'
import { Format } from '@/lib/types'
import { X, Plus } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { getDropZoneAcceptFromFormats } from '@/lib/utils'
import { useApiRequest } from '@/hooks/useApiRequest'
import { QualitySlider } from '@/components/ProcessingModal/QualitySlider'
import { ResizeSlider } from '@/components/ProcessingModal/ResizeSlider'

type Thumbnail = {
  fileName: string
  data: string
  width: number
  height: number
  downloadData?: DowloadData
}

type Props = {
  onDownloadAll: () => void
  onChangeFileProperties: (
    file: SuccessProcessingEvent,
    props: Partial<SuccessProcessingEvent>
  ) => void
  isDownloadingAll: boolean
}

export const ProcessingModal: FC<Props> = ({
  isDownloadingAll,
  onDownloadAll,
  onChangeFileProperties,
}) => {
  const uploadedFiles = useStore(state => state.uploadedFiles)
  const lastProcessingEvent = useStore(state => state.lastProcessingEvent)
  const currentJob = useStore(state => state.currentJob)
  const [thumbnails, setThumbnails] = useImmer<Thumbnail[]>([])
  const resetStore = useStore(state => state.reset)
  const addToUploadedFiles = useStore(state => state.addToUploadedFiles)
  const removeFileFromJob = useStore(state => state.removeFile)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const scrollableRef = useRef<HTMLDivElement>(null)
  const format = useStore(state => state.format)
  const { addFileToJob, deleteFileFromJob } = useApiRequest()
  const fileWasRemoved = useRef<boolean>(false)
  const [uploadedFileToQualityMap, setUploadedFileToQualityMap] = useImmer<
    Record<string, number>
  >({})
  const [uploadedFileToWidthMap, setUploadedFileToWidthMap] = useImmer<
    // originalWidth, originalHeight, width, height
    Record<string, [number, number, number, number]>
  >({})

  const onDrop = useCallback(
    (files: File[]) => {
      if (uploadedFiles.find(f => f.name === files[0].name)) {
        // TODO: show toast error message here
        return
      } else {
        if (!currentJob.id) return
        fileWasRemoved.current = false
        const file = files[0]
        addToUploadedFiles(file)
        const formData = new FormData()
        const queryParams = new URLSearchParams({
          format,
          quality: DEFAULT_IMAGE_QUALITY.toString(),
        })
        formData.append('image', new Blob([file]), file.name)
        addFileToJob(currentJob.id, formData, queryParams).catch(error => {
          // TODO: show toast error message here
        })
      }
    },
    [currentJob]
  )

  const onDeleteFileFromJob = (fileName: string) => {
    if (!currentJob.id) return
    const file = currentJob.files.find(f => f.sourceFile === fileName)
    if (!file) return
    fileWasRemoved.current = true
    const queryParams = new URLSearchParams({
      file_id: String(file.fileId),
    })
    deleteFileFromJob(currentJob.id, queryParams)
      .then(() => {
        removeFileFromJob(file)
        setThumbnails(thumbnails.filter(th => th.fileName !== fileName))
      })
      .catch(error => {
        // TODO: show toast error message here
      })
  }

  const { getRootProps } = useDropzone({
    onDrop,
    accept: getDropZoneAcceptFromFormats(),
    maxFiles: 1,
  })
  const originalDropZoneOnClick = getRootProps().onClick

  const onModalClose = () => {
    setThumbnails([])
    resetStore()
    onClose()
  }

  const isDownloadAllDisabled =
    isDownloadingAll || thumbnails.some(th => !th?.downloadData?.url)

  const isDownloadByIdxDisabled = (idx: number) =>
    !thumbnails[idx]?.downloadData?.url || currentJob.files[idx]?.pending

  useEffect(() => {
    if (uploadedFiles.length && !isOpen) {
      onOpen()
    }
  }, [uploadedFiles])

  useEffect(() => {
    if (fileWasRemoved.current) return
    const fn = (file: File, idx: number) => {
      const thumbnailReader = new FileReader()

      thumbnailReader.onload = () => {
        const binaryStr = thumbnailReader.result as string
        const image = new Image()

        image.onload = () => {
          const thumbnail = {
            fileName: file.name,
            data: binaryStr,
            width: image.width,
            height: image.height,
          }
          setThumbnails(th => {
            th[idx] = thumbnail
          })
        }
        image.src = binaryStr
      }
      thumbnailReader.readAsDataURL(file)
    }

    if (!isOpen) {
      uploadedFiles.forEach(fn)
    } else {
      fn(uploadedFiles[uploadedFiles.length - 1], uploadedFiles.length - 1)

      if (scrollableRef.current && currentJob.files.length) {
        const el = scrollableRef.current
        el.scroll({ top: el.scrollHeight, behavior: 'smooth' })
      }
    }
  }, [uploadedFiles, isOpen])

  useEffect(() => {
    if (lastProcessingEvent) {
      setThumbnails(th => {
        const thumbnail = th.find(
          t => t.fileName === lastProcessingEvent.sourceFile
        )
        if (thumbnail) {
          thumbnail.downloadData = getDownloadData(thumbnail.fileName)
        }
      })
    }
  }, [lastProcessingEvent])

  useEffect(() => {
    uploadedFiles.forEach(file => {
      if (!uploadedFileToQualityMap.hasOwnProperty(file.name)) {
        setUploadedFileToQualityMap(draft => {
          draft[file.name] = DEFAULT_IMAGE_QUALITY
        })
      }
    })
  }, [uploadedFiles])

  useEffect(() => {
    currentJob.files.forEach(file => {
      if (!uploadedFileToWidthMap.hasOwnProperty(file.sourceFile)) {
        setUploadedFileToWidthMap(draft => {
          draft[file.sourceFile] = [
            file.originalWidth,
            file.originalHeight,
            file.originalWidth,
            file.originalHeight,
          ]
        })
      }
    })
  }, [currentJob.files])

  return (
    <Modal
      backdrop='blur'
      size='5xl'
      isOpen={isOpen}
      onClose={onModalClose}
      placement='top-center'
      isDismissable={false}
      classNames={{
        body: 'p-0 gap-0',
        base: 'overflow-y-visible',
        closeButton:
          '-top-4 -right-4 text-block text-xl bg-purple hover:bg-purple/90',
      }}
    >
      <ModalContent>
        {() => (
          <ModalBody>
            <div className='flex flex-col align-center m-6 mb-0 p-6 bg-zinc-800 rounded-xl shadow-md bg-dotted border border-zinc-700'>
              <div className='thumbnails grid justify-items-center justify-center gap-4 grid-cols-[repeat(5,_128px)]'>
                {uploadedFiles.map((file, idx) => (
                  <div key={file.name}>
                    <Skeleton
                      className='rounded overflow-visible'
                      isLoaded={!!thumbnails[idx]?.data}
                    >
                      <div className='relative'>
                        {currentJob.files.length > 1 && (
                          <Button
                            isIconOnly
                            color='secondary'
                            className='absolute -top-3 -right-3 z-20 rounded-full w-7 h-7 min-w-[unset] drop-shadow'
                            onPress={() => onDeleteFileFromJob(file.name)}
                          >
                            <X size='16' />
                          </Button>
                        )}
                        <div className='relative rounded-md overflow-hidden h-32 w-32 border border-zinc-600'>
                          <div className='text-4xl text-white relative z-10 [text-shadow:_1px_1px_1px_rgb(0_0_0_/_50%)] flex items-center justify-center w-full h-full bg-black/30'>
                            {currentJob.files[idx] &&
                              getStringifiedConversionRate(
                                +currentJob.files[idx].sourceFileSize,
                                +currentJob.files[idx].targetFileSize
                              )}
                          </div>
                          <img
                            src={thumbnails[idx]?.data}
                            className={clsx(
                              'absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 min-h-full min-w-full max-w-[unset] max-h-[unset]',
                              {
                                'h-full':
                                  thumbnails[idx]?.width >=
                                  thumbnails[idx]?.height,
                                'w-full':
                                  thumbnails[idx]?.height >
                                  thumbnails[idx]?.width,
                              }
                            )}
                            alt={`thumbnail ${idx}`}
                          />
                        </div>
                      </div>
                    </Skeleton>
                    <Button
                      disabled={isDownloadByIdxDisabled(idx)}
                      className='w-full mt-2'
                      radius='sm'
                      isLoading={isDownloadByIdxDisabled(idx)}
                      as={Link}
                      href={thumbnails[idx]?.downloadData?.url}
                      download={thumbnails[idx]?.downloadData?.fileName}
                    >
                      {!isDownloadByIdxDisabled(idx) && 'Download'}
                    </Button>
                  </div>
                ))}
                {uploadedFiles.length < 10 && (
                  <Button
                    isIconOnly
                    className='h-32 w-32 bg-zinc-700'
                    onPress={e => originalDropZoneOnClick?.(e as never)}
                    disabled={isDownloadAllDisabled}
                  >
                    <Plus size='40' />
                  </Button>
                )}
              </div>
              {thumbnails.length > 1 && (
                <Button
                  disabled={isDownloadAllDisabled}
                  isLoading={isDownloadAllDisabled}
                  className='mt-4 self-center w-40'
                  color='secondary'
                  radius='sm'
                  onPress={onDownloadAll}
                >
                  {!isDownloadAllDisabled && 'Download all'}
                </Button>
              )}
            </div>
            <div
              className='max-h-[50vh] overflow-x-hidden p-6 pt-0 mt-2'
              ref={scrollableRef}
            >
              {uploadedFiles.map((u, idx) => {
                const file = currentJob.files[idx]
                return file ? (
                  <div className='w-full mt-6' key={file.fileId}>
                    <div className='flex justify-end w-4/5 mb-1'>
                      <div className='text-sm overflow-x-hidden whitespace-nowrap text-ellipsis'>
                        {file.sourceFile}
                        {' | '}
                        {getFormattedFileSize(+file.sourceFileSize)} {'->'}{' '}
                        {getFormattedFileSize(+file.targetFileSize)} (
                        {getStringifiedConversionRate(
                          +file.sourceFileSize,
                          +file.targetFileSize
                        )}
                        )
                      </div>
                    </div>
                    <div className='flex'>
                      <div className='w-4/5 border border-zinc-700 rounded-xl overflow-hidden'>
                        <Comparator
                          sourceUrl={buildDownloadUrl(
                            currentJob.id!,
                            file.sourceFile
                          )}
                          targetUrl={buildDownloadUrl(
                            currentJob.id!,
                            file.targetFile
                          )}
                          originalWidth={file.originalWidth}
                        />
                      </div>
                      <div className='w-1/5'>
                        <div className='ml-4'>
                          <div className='flex justify-between text-sm'>
                            Format
                            <FormatSelector
                              value={file.format}
                              trigger={(format: Format) => (
                                <span className='border-b-1 border-dashed'>
                                  {format.toUpperCase()}
                                </span>
                              )}
                              onChange={format =>
                                onChangeFileProperties(file, { format })
                              }
                              isDisabled={isDownloadByIdxDisabled(idx)}
                            />
                          </div>
                          <div className='mt-6'>
                            <div className='flex items-center'>
                              <QualitySlider
                                value={uploadedFileToQualityMap[u.name]}
                                min={10}
                                max={100}
                                isDisabled={isDownloadByIdxDisabled(idx)}
                                onChange={quality =>
                                  setUploadedFileToQualityMap(draft => {
                                    draft[u.name] = getFirst(quality)
                                  })
                                }
                                onChangeEnd={quality =>
                                  onChangeFileProperties(file, {
                                    quality: getFirst(quality),
                                  })
                                }
                                onInputChange={quality => {
                                  onChangeFileProperties(file, {
                                    quality,
                                  })
                                  setUploadedFileToQualityMap(draft => {
                                    draft[u.name] = quality
                                  })
                                }}
                              />
                            </div>
                          </div>
                          <div className='mt-4'>
                            <div className='flex items-center'>
                              <ResizeSlider
                                value={uploadedFileToWidthMap[u.name]?.[2]}
                                value2={uploadedFileToWidthMap[u.name]?.[3]}
                                min={10}
                                max={uploadedFileToWidthMap[u.name]?.[0]}
                                isDisabled={isDownloadByIdxDisabled(idx)}
                                onChange={width =>
                                  setUploadedFileToWidthMap(draft => {
                                    draft[u.name][2] = getFirst(width)
                                    draft[u.name][3] = calculateFileHeight(
                                      file,
                                      getFirst(width)
                                    )
                                  })
                                }
                                onChangeEnd={w => {
                                  const width = getFirst(w)
                                  const height = calculateFileHeight(
                                    file,
                                    width
                                  )
                                  onChangeFileProperties(file, {
                                    width,
                                    height,
                                  })
                                }}
                                onInputChange={value => {
                                  let width = 0
                                  let height = 0
                                  if (value > 0) {
                                    width = value
                                    height = calculateFileHeight(file, width)
                                  } else {
                                    height = Math.abs(value)
                                    width = calculateFileWidth(file, height)
                                  }
                                  onChangeFileProperties(file, {
                                    width,
                                    height,
                                  })
                                  setUploadedFileToWidthMap(draft => {
                                    draft[u.name][2] = width
                                    draft[u.name][3] = height
                                  })
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='flex mt-6' key={idx}>
                    <Skeleton className='w-5/6 h-72 rounded-xl'>
                      <div />
                    </Skeleton>
                    <Skeleton className='w-1/6 h-72 ml-4 rounded-xl'>
                      <div />
                    </Skeleton>
                  </div>
                )
              })}
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  )
}
