import { type FC } from 'react'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react'
import { Format } from '@/lib/types'
import { useStore } from '@/store'

type Props = {
  trigger: (format: Format) => JSX.Element
  onChange: (value: Format) => void
}

export const FormatSelector: FC<Props> = ({ trigger, onChange }) => {
  const format = useStore(state => state.format)
  return (
    <Dropdown>
      <DropdownTrigger>{trigger(format)}</DropdownTrigger>
      <DropdownMenu
        selectionMode='single'
        selectedKeys={[format]}
        onAction={key => onChange(key as Format)}
      >
        {Object.values(Format).map(format => (
          <DropdownItem key={format}>{format.toUpperCase()}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}
