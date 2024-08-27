import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import { Toast } from '@/components/Toast'
import { GithubCorner } from '@/components/GithubCorner'
import { SentryCmp as Sentry } from '@/components/Sentry'
import Image from 'next/image'
import Script from 'next/script'

import './globals.css'
import 'react-toastify/dist/ReactToastify.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Convert your images easily | cnvrt.pics',
  description:
    'Convert, optimize, and resize images in seconds for free. Bulk mode is supported.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className='bg-black'>
      <Script
        src='https://plausible.kos.sh/js/script.js'
        strategy='lazyOnload'
        data-domain='cnvrt.pics'
      />
      <body
        className={`${inter.className} overscroll-none flex flex-col h-screen body overflow-hidden`}
      >
        <Providers>
          <div className='container'>
            <Image
              src='/logo.webp'
              alt='cnvrt.pics'
              width={80}
              height={39}
              className='relative z-[2] mt-8 xl:mt-12 w-[4rem] xl:w-[5rem]'
            />
          </div>
          <div className='overlay fixed right-0 bottom-0 min-w-full min-h-full z-[1] backdrop-blur-2xl'></div>
          {children}
        </Providers>
        <Toast />
        <GithubCorner />
        <Sentry />
      </body>
    </html>
  )
}
