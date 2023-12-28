import { Processor } from '@/components/Processor'

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center p-24'>
      <div className='container mx-auto'>
        <Processor />
      </div>
    </main>
  )
}
