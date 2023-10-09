import { type FC } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Format } from '@/lib/types'

type Props = {
  value: Format
  onChange: (value: Format) => void
}

export const FormatSelector: FC<Props> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder='Format' />
      </SelectTrigger>
      <SelectContent>
        {Object.values(Format).map(format => (
          <SelectItem key={format} value={format}>
            {format}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
