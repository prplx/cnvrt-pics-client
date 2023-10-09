import { getStringifiedConversionRate, getFormattedFileSize } from './utils'

describe('utils', () => {
  describe('getStringifiedConversionRate', () => {
    const testCases = [
      {
        sourceFileSize: 100,
        targetFileSize: 50,
        expectedConversionRate: '-50%',
      },
      {
        sourceFileSize: 50,
        targetFileSize: 100,
        expectedConversionRate: '+100%',
      },
      { sourceFileSize: 50, targetFileSize: 50, expectedConversionRate: '0%' },
      { sourceFileSize: 0, targetFileSize: 0, expectedConversionRate: '0%' },
      {
        sourceFileSize: 0,
        targetFileSize: 100,
        expectedConversionRate: '+Infinity%',
      },
      {
        sourceFileSize: 100,
        targetFileSize: 0,
        expectedConversionRate: '-100%',
      },
      {
        sourceFileSize: 100,
        targetFileSize: -50,
        expectedConversionRate: '-150%',
      },
      {
        sourceFileSize: 400,
        targetFileSize: 1000,
        expectedConversionRate: '+150%',
      },
      {
        sourceFileSize: 1000,
        targetFileSize: 100,
        expectedConversionRate: '-90%',
      },
    ]

    it.each(testCases)(
      'should return correct conversion rate when sourceFileSize is %p and targetFileSize is %p',
      ({ sourceFileSize, targetFileSize, expectedConversionRate }) => {
        const actualConversionRate = getStringifiedConversionRate(
          sourceFileSize,
          targetFileSize
        )

        expect(actualConversionRate).toEqual(expectedConversionRate)
      }
    )
  })

  describe('getFormattedFileSize', () => {
    const testCases = [
      { bytes: 1024, expectedFormattedSize: '1 KB' },
      { bytes: 5370, expectedFormattedSize: '5.2 KB' },
      { bytes: 1048576, expectedFormattedSize: '1 MB' },
      { bytes: 1572864, expectedFormattedSize: '1.5 MB' },
      { bytes: 5242880, expectedFormattedSize: '5 MB' },
      { bytes: 524288, expectedFormattedSize: '512 KB' },
      { bytes: 0, expectedFormattedSize: '0 B' },
    ]

    it.each(testCases)(
      'should return correct formatted size when bytes is %p',
      ({ bytes, expectedFormattedSize }) => {
        const actualFormattedSize = getFormattedFileSize(bytes)

        expect(actualFormattedSize).toEqual(expectedFormattedSize)
      }
    )
  })
})
