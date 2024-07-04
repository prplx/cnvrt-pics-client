import { type FC } from 'react'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react'
import { Format } from '@/lib/types'

type Props = {
  value: Format
  trigger: (format: Format) => JSX.Element
  onChange: (value: Format) => void
  isDisabled?: boolean
}

export const FormatSelector: FC<Props> = ({
  value,
  trigger,
  onChange,
  isDisabled,
}) => {
  return (
    <Dropdown isDisabled={!!isDisabled}>
      <DropdownTrigger>{trigger(value)}</DropdownTrigger>
      <DropdownMenu
        selectionMode='single'
        selectedKeys={[value]}
        onAction={key => onChange(key as Format)}
        disabledKeys={!!isDisabled ? Object.values(Format) : []}
      >
        {Object.values(Format).map(format => (
          <DropdownItem key={format}>{format.toUpperCase()}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}
