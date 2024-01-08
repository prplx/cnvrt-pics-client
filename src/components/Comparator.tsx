import { type FC } from 'react'
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
  styleFitContainer,
} from 'react-compare-slider'

type Props = {
  sourceUrl: string
  targetUrl: string
  originalWidth: number
}

const getImageStyle = (width: number) =>
  styleFitContainer({
    objectFit: 'cover',
    maxWidth: `${width}px`,
    position: 'relative',
    left: '50%',
    transform: 'translateX(-50%)',
  })

export const Comparator: FC<Props> = ({
  sourceUrl,
  targetUrl,
  originalWidth,
}) => {
  return (
    <div className='flex'>
      <ReactCompareSlider
        itemOne={
          <ReactCompareSliderImage
            src={sourceUrl}
            alt='Source image'
            style={getImageStyle(originalWidth)}
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            src={targetUrl}
            alt='Result image'
            style={getImageStyle(originalWidth)}
          />
        }
        className='h-72 w-full'
      />
    </div>
  )
}
