import { useEffect, type FC } from 'react'
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  Skeleton,
  Button,
  Link,
} from '@nextui-org/react'
import { useStore } from '@/store'
import clsx from 'clsx'
import { type DowloadData } from '@/lib/types'
import {
  getDownloadData,
  getStringifiedConversionRate,
  getFormattedFileSize,
  buildDownloadUrl,
} from '@/lib/utils'
import { useImmer } from 'use-immer'
import { Slider, type SliderValue } from '@nextui-org/react'
import { Comparator } from '@/components/Comparator'
import { DEFAULT_IMAGE_QUALITY } from '@/lib/constants'

type Thumbnail = {
  fileName: string
  data: string
  width: number
  height: number
  downloadData?: DowloadData
}

type Props = {
  onDownloadAll: () => void
  isDownloadingAll: boolean
}

export const ProcessingModal: FC<Props> = ({
  isDownloadingAll,
  onDownloadAll,
}) => {
  const uploadedFiles = useStore(state => state.uploadedFiles)
  const lastProcessingEvent = useStore(state => state.lastProcessingEvent)
  const currentJob = useStore(state => state.currentJob)
  const [thumbnails, setThumbnails] = useImmer<Thumbnail[]>([])
  const resetStore = useStore(state => state.reset)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const onModalClose = () => {
    resetStore()
    onClose()
  }

  const isDownloadAllDisabled =
    isDownloadingAll || thumbnails.some(th => !th?.downloadData?.url)

  const isDownloadByIdxDisabled = (idx: number) =>
    !thumbnails[idx]?.downloadData?.url

  useEffect(() => {
    if (uploadedFiles.length) {
      onOpen()
    }
  }, [uploadedFiles])

  useEffect(() => {
    uploadedFiles.forEach((file, idx) => {
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
    })
  }, [uploadedFiles])

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
      }}
    >
      <ModalContent>
        {_onClose => (
          <ModalBody>
            <div className='flex flex-col align-center m-6 mb-0 p-6 bg-zinc-800 rounded-xl'>
              <div className='thumbnails grid justify-items-center justify-center gap-4 grid-cols-[repeat(5,_128px)]'>
                {uploadedFiles.map((file, idx) => (
                  <div key={file.name}>
                    <Skeleton
                      className='rounded'
                      isLoaded={!!thumbnails[idx]?.data}
                    >
                      <div className='relative rounded-md overflow-hidden h-32 w-32 border border-zinc-600'>
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
            <div className='max-h-[50vh] overflow-x-hidden p-6 pt-0'>
              {currentJob.id &&
                currentJob.files.map(file => (
                  <div className='w-full mt-6' key={file.sourceFile}>
                    <div className='flex justify-between w-5/6'>
                      <div>
                        Source file size:{' '}
                        {getFormattedFileSize(+file.sourceFileSize)}
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
                      <div className='w-5/6 border border-zinc-600 rounded-xl overflow-hidden'>
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
                      <div className='w-1/6'>
                        <div className='ml-4'>
                          Format
                          {/* <FormatSelector
                    value={file.format}
                    onChange={onFileFormatChange(file)}
                  /> */}
                          <div className='mt-4 '>
                            <div className='flex items-center'>
                              <Slider
                                label='Quality'
                                minValue={10}
                                maxValue={100}
                                step={1}
                                className='w-[140px]'
                                defaultValue={DEFAULT_IMAGE_QUALITY}
                                // onChangeEnd={onFileQualityCommit(file)}
                              />
                            </div>
                          </div>
                          <div className='mt-4'>
                            <div className='flex items-center'>
                              <Slider
                                label='Resize'
                                minValue={10}
                                maxValue={file.originalWidth}
                                step={1}
                                className='w-[140px]'
                                defaultValue={file.width}
                                // onChangeEnd={onFileWidthCommit(file)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  )
}
