import { ZodNumber } from 'zod'
import {
  useEffect,
  useRef,
  type FC,
  type ReactNode,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react'

type Props = {
  content: string | ReactNode
  schema: ZodNumber
  onChange?: (value: number) => void
  onError?: (error: Error) => void
  plaintextOnly?: boolean
  className?: string
}

const allowedKeys = new Set([
  'Backspace',
  'Delete',
  'ArrowLeft',
  'ArrowRight',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '0',
  'Enter',
])

export const ContentEditableMasked: FC<Props> = ({
  content,
  schema,
  plaintextOnly,
  className,
  onChange,
  onError,
}) => {
  const elRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<string>()
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!allowedKeys.has(e.key)) {
      e.preventDefault()
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      elRef.current?.blur()
    }
  }

  const onBlur = (e: ChangeEvent<HTMLDivElement>) => {
    const newContent = e.target.textContent
    if (newContent === null || newContent === contentRef.current) {
      return
    }
    if (validate(newContent)) {
      contentRef.current = newContent
      onChange?.(parseInt(newContent, 10))
    } else {
      e.target.textContent = contentRef.current as string
    }
  }

  const validate = (content: string): boolean => {
    try {
      const finalContent = parseInt(content, 10)
      schema.parse(finalContent)
      return true
    } catch (error) {
      error instanceof Error && onError?.(error)
      return false
    }
  }

  useEffect(() => {
    const sanitizedContent = content?.toString().replaceAll(',', '') ?? ''
    if (validate(sanitizedContent)) {
      contentRef.current = sanitizedContent
    }
  }, [])

  return (
    <div
      // @ts-ignore - plaintext-only is a valid attribute https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/contentEditable
      contentEditable={plaintextOnly ? 'plaintext-only' : true}
      suppressContentEditableWarning
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      className={className ?? undefined}
      ref={elRef}
    >
      {content?.toString().replaceAll(',', '')}
    </div>
  )
}
