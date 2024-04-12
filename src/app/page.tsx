import { Processor } from '@/components/Processor'
import { Format } from '@/lib/types'

export default function Home() {
  return (
    <main className='container flex items-center z-[2] relative grow'>
      <div className='m-auto -translate-y-[20%]'>
        <div className='hero text-center'>
          <h1>
            <span className='text-purple text-8xl font-light'>
              Convert your
            </span>
            <br />
            <span className='text-white text-6xl font-semibold leading-normal tracking-wide'>
              images easily
            </span>
          </h1>
          <br />
          <h3 className='text-white/50 inline-block w-4/6'>
            Convert, optimize, and resize your{' '}
            {Object.values(Format).join(', ')} images in seconds for free. Bulk
            mode is supported for up to {process.env.NEXT_PUBLIC_MAX_FILE_COUNT}{' '}
            files.
          </h3>
        </div>
        <div className='container mx-auto'>
          <Processor />
          {/* <div className='flex justify-center mt-8'>
            <a
              className='github-button z-100'
              href='https://github.com/orgs/cnvrt-pics/repositories'
              data-color-scheme='no-preference: dark; light: light; dark: dark;'
              data-icon='octicon-star'
              data-size='large'
              aria-label='Star cnvrt on GitHub'
            >
              Star
            </a>
          </div> */}
        </div>
      </div>
    </main>
  )
}
