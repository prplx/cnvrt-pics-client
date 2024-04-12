'use client'

import Script from 'next/script'

export const Scripts = () => {
  return (
    <>
      <Script
        src='https://buttons.github.io/buttons.js'
        strategy='lazyOnload'
      ></Script>
    </>
  )
}
