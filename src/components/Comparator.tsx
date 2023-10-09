import { type FC } from 'react'
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider'

type Props = {
  sourceUrl: string
  targetUrl: string
}

export const Comparator: FC<Props> = ({ sourceUrl, targetUrl }) => {
  return (
    <div className='flex'>
      <ReactCompareSlider
        itemOne={<ReactCompareSliderImage src={sourceUrl} alt='Source image' />}
        itemTwo={<ReactCompareSliderImage src={targetUrl} alt='Result image' />}
        className='h-96 w-full'
      />
    </div>
  )
}
