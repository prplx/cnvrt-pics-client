import { useEffect } from 'react'
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
import { getDownloadData } from '@/lib/utils'
import { useImmer } from 'use-immer'

type Thumbnail = {
  fileName: string
  data: string
  width: number
  height: number
  downloadData?: DowloadData
}

export const ProcessorModal = () => {
  const uploadedFiles = useStore(state => state.uploadedFiles)
  const lastProcessingEvent = useStore(state => state.lastProcessingEvent)
  const [thumbnails, setThumbnails] = useImmer<Thumbnail[]>([])
  const resetStore = useStore(state => state.reset)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const onModalClose = () => {
    resetStore()
    onClose()
  }

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
    >
      <ModalContent>
        {_onClose => (
          <ModalBody>
            <div className='thumbnails flex justify-center gap-6 p-4'>
              {uploadedFiles.map((file, idx) => (
                <div key={file.name}>
                  <Skeleton
                    className='rounded'
                    isLoaded={!!thumbnails[idx]?.data}
                  >
                    <div className='relative rounded overflow-hidden h-32 w-32 border border-slate-500'>
                      <img
                        src={thumbnails[idx]?.data}
                        className={clsx(
                          'absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 min-h-full min-w-full max-w-[unset] max-h-[unset]',
                          {
                            'h-full':
                              thumbnails[idx]?.width >= thumbnails[idx]?.height,
                            'w-full':
                              thumbnails[idx]?.height > thumbnails[idx]?.width,
                          }
                        )}
                      />
                    </div>
                  </Skeleton>
                  <Button
                    disabled={
                      !thumbnails[idx] || !thumbnails[idx]?.downloadData?.url
                    }
                    className='w-full mt-1'
                    radius='sm'
                    isLoading={!thumbnails[idx]?.downloadData?.url}
                    as={Link}
                    href={thumbnails[idx]?.downloadData?.url}
                    download={thumbnails[idx]?.downloadData?.fileName}
                  >
                    {thumbnails[idx]?.downloadData?.url && 'Download'}
                  </Button>
                </div>
              ))}
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  )
}
