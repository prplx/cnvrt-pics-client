import { Processor } from '@/components/Processor'

export default function Home() {
  return (
    <main className='flex flex-col items-center pt-20 z-[2] relative'>
      <div className='hero text-center'>
        <h1>
          <span className='text-purple text-8xl font-light'>Convert your</span>
          <br />
          <span className='text-white text-7xl font-medium leading-normal tracking-wide'>
            images easily
          </span>
        </h1>
      </div>
      <div className='container mx-auto'>
        <Processor />
      </div>
    </main>
  )
}
