import { type FC, DOMAttributes } from 'react'
import { Slider } from '@nextui-org/react'
import { ContentEditableMasked } from '@/components/ContentEditableMasked'
import { z } from 'zod'

type Props = {
  value: number
  min: number
  max: number
  isDisabled?: boolean
  onChange: (value: number | number[]) => void
  onInputChange: (value: number) => void
  onChangeEnd: (value: number | number[]) => void
}

export const QualitySlider: FC<Props> = ({
  value,
  min,
  max,
  isDisabled,
  onChange,
  onInputChange,
  onChangeEnd,
}) => {
  return (
    <Slider
      label='Quality'
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
          <ContentEditableMasked
            onChange={onInputChange}
            content={el.children}
            schema={z.number().int().min(min).max(max)}
            plaintextOnly
            className='bg-black px-2 border border-zinc-700 text-sm rounded max-w-[3rem] whitespace-nowrap overflow-hidden'
          />
        )
      }}
    />
  )
}
