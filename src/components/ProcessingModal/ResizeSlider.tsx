import { type FC, DOMAttributes } from 'react'
import { Slider } from '@nextui-org/react'
import { ContentEditableMasked } from '@/components/ContentEditableMasked'
import { z } from 'zod'

type Props = {
  value: number
  value2: number
  min: number
  max: number
  isDisabled?: boolean
  onChange: (value: number | number[]) => void
  onInputChange: (value: number) => void
  onChangeEnd: (value: number | number[]) => void
}

export const ResizeSlider: FC<Props> = ({
  value,
  value2,
  min,
  max,
  isDisabled,
  onChange,
  onInputChange,
  onChangeEnd,
}) => {
  return (
    <Slider
      label='Resize'
      minValue={min}
      maxValue={max}
      step={1}
      className='w-full'
      value={value}
      size='sm'
      color='secondary'
      onChange={onChange}
      onChangeEnd={onChangeEnd}
      isDisabled={isDisabled}
      renderValue={(el: DOMAttributes<HTMLOutputElement>) => {
        return (
          <div className='flex'>
            <ContentEditableMasked
              onChange={onInputChange}
              content={el.children}
              schema={z.number().int().min(min).max(max)}
              plaintextOnly
              className='bg-black px-2 border border-zinc-700 text-sm rounded max-w-[3rem] whitespace-nowrap overflow-hidden'
            />
            &nbsp;×&nbsp;
            <ContentEditableMasked
              onChange={value => onInputChange(-value)}
              content={value2}
              schema={z.number().int().min(min).max(max)}
              plaintextOnly
              className='bg-black px-2 border border-zinc-700 text-sm rounded max-w-[3rem] whitespace-nowrap overflow-hidden'
            />
          </div>
        )
      }}
    />
  )
}
