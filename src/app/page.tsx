import { Processor } from '@/components/Processor'
import { Providers } from '@/components/Providers'

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center p-24'>
      <div className='container mx-auto'>
        <Providers>
          <Processor />
        </Providers>
      </div>
    </main>
  )
}
