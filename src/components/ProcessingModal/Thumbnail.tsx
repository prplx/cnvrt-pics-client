import { type FC, useRef, useLayoutEffect } from 'react'
import { Skeleton, Button } from '@nextui-org/react'
import { X } from 'lucide-react'
import clsx from 'clsx'

type Props = {
  isLoaded: boolean
  text: string
  imageSrc: string
  imageHFull: boolean
  imageWFull: boolean
  isCloseButton: boolean
  isDisabled?: boolean
  onClose: () => void
}

export const Thumbnail: FC<Props> = ({
  isLoaded,
  text,
  imageSrc,
  imageHFull,
  imageWFull,
  isCloseButton,
  isDisabled,
  onClose,
}) => {
  const textContainerRef = useRef<HTMLDivElement | null>(null)
  const textRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (!textContainerRef.current || !textRef.current) return

    const textContainer = textContainerRef.current
    const text = textRef.current
    let textFontSize = parseInt(getComputedStyle(text).fontSize, 10)
    let updated = false
    if (!textFontSize) return

    while (text.scrollWidth > textContainer.offsetWidth) {
      updated = true
      textFontSize--
      text.style.fontSize = textFontSize + 'px'
    }

    if (updated) {
      text.style.fontSize = textFontSize - 2 + 'px'
    }
  })

  return (
    <Skeleton className='rounded overflow-visible' isLoaded={isLoaded}>
      <div className='relative'>
        {isCloseButton && (
          <Button
            isIconOnly
            color='secondary'
            className='absolute -top-3 -right-3 z-20 rounded-full w-7 h-7 min-w-[unset] drop-shadow'
            onPress={onClose}
            isDisabled={isDisabled}
          >
            <X size='16' />
          </Button>
        )}
        <div
          className='relative h-32 w-32 border border-zinc-600 rounded-md'
          ref={textContainerRef}
        >
          <div
            className='text-4xl text-white relative z-10 [text-shadow:_1px_1px_1px_rgb(0_0_0_/_50%)] flex items-center justify-center min-w-full h-full bg-black/30'
            ref={textRef}
          >
            {text}
          </div>
          <div className='w-full absolute h-full overflow-hidden top-0 left-0 rounded-md'>
            <img
              src={imageSrc}
              className={clsx(
                'absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 min-h-full min-w-full max-w-[unset] max-h-[unset]',
                {
                  'h-full': imageHFull,
                  'w-full': imageWFull,
                }
              )}
              alt='Thumbnail'
            />
          </div>
        </div>
      </div>
    </Skeleton>
  )
}
