import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import { Toast } from '@/components/Toast'
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
        className={`${inter.className} overscroll-none flex flex-col h-screen body`}
      >
        <Providers>
          <div className='container'>
            <h1 className='text-white z-[2] relative text-2xl font-light mt-12 uppercase tracking-wider'>
              {process.env.NEXT_PUBLIC_APP_NAME}
            </h1>
          </div>
          <div className='overlay fixed right-0 bottom-0 min-w-full min-h-full z-[1] backdrop-blur-2xl'></div>
          {children}
        </Providers>
        <Toast />
      </body>
    </html>
  )
}
