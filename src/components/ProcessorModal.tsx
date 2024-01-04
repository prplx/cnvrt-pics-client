import { useState, useEffect } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Skeleton,
} from '@nextui-org/react'
import { useStore } from '@/store'

export const ProcessorModal = () => {
  const uploadedFiles = useStore(state => state.uploadedFiles)
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

  return (
    <Modal
      backdrop='opaque'
      size='5xl'
      isOpen={isOpen}
      onClose={onModalClose}
      placement='top-center'
    >
      <ModalContent>
        {_onClose => (
          <ModalBody>
            <div className='flex justify-center gap-6'>
              {uploadedFiles.map(file => (
                <Skeleton key={file.name} className='rounded-lg'>
                  <div className='h-24 w-24 rounded-lg bg-default-300'></div>
                </Skeleton>
              ))}
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  )
}
