import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import { Toast } from '@/components/Toast'
import { GithubCorner } from '@/components/GithubCorner'
import Image from 'next/image'
import 'react-toastify/dist/ReactToastify.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'cnvrt.pics',
  description: 'Convert, resize, optimize your images easily',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className='bg-black'>
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
              className='relative z-[2] mt-12'
            />
          </div>
          <div className='overlay fixed right-0 bottom-0 min-w-full min-h-full z-[1] backdrop-blur-2xl'></div>
          {children}
        </Providers>
        <Toast />
        <GithubCorner />
      </body>
    </html>
  )
}
