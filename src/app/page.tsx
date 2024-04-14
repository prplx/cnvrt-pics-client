import { Processor } from '@/components/Processor'
import { Format } from '@/lib/types'

export default function Home() {
  return (
    <main className='container flex items-center z-[2] relative mt-24 xl:mt-0 xl:grow'>
      <div className='m-auto xl:-translate-y-[20%]'>
        <div className='hero text-center'>
          <h1>
            <span className='text-purple text-5xl xl:text-8xl font-light'>
              Convert your
            </span>
            <br />
            <span className='text-white text-4xl xl:text-6xl font-semibold leading-normal tracking-wide'>
              images easily
            </span>
          </h1>
          <br />
          <h3 className='text-white/50 inline-block xl:w-4/6'>
            Convert, optimize, and resize your{' '}
            {Object.values(Format).join(', ')} images in seconds for free. Bulk
            mode is supported on desktop for up to{' '}
            {process.env.NEXT_PUBLIC_MAX_FILE_COUNT} files.
          </h3>
        </div>
        <div className='mx-auto'>
          <Processor />
        </div>
      </div>
    </main>
  )
}
