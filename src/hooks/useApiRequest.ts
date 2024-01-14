import { useEffect, useRef } from 'react'
import { useGetAppCheckToken } from '@/hooks/useGetAppCheckToken'

export const useApiRequest = () => {
  const getAppCheckToken = useGetAppCheckToken()
  const appCheckTokenRef = useRef<string>()

  useEffect(() => {
    getAppCheckToken().then(token => {
      appCheckTokenRef.current = token
    })
  })

  const makeResponse = async (
    uri: string,
    options: RequestInit
  ): Promise<Response> => {
    const headers = {
      ...options.headers,
      'X-Firebase-AppCheck': appCheckTokenRef.current ?? '',
    }
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}${uri}`, {
      ...options,
      headers,
    })
  }

  const processJob = async (
    body: FormData,
    queryParams: URLSearchParams
  ): Promise<{ job_id: number }> => {
    const response = makeResponse(`/process?${queryParams}`, {
      method: 'POST',
      body,
    })

    return (await response).json()
  }

  const processFile = async (
    jobId: string | number,
    queryParams: URLSearchParams
  ): Promise<Response> =>
    makeResponse(`/process/${jobId}?${queryParams}`, {
      method: 'POST',
    })

  const archiveJob = async (jobId: string | number): Promise<Response> =>
    makeResponse(`/archive/${jobId}`, {
      method: 'POST',
    })

  const getWebsocketUrl = (jobId: string | number) =>
    `${process.env.NEXT_PUBLIC_SERVER_WS_URL}/${jobId}?appCheckToken=${
      appCheckTokenRef.current ?? ''
    }`

  return {
    processJob,
    processFile,
    getWebsocketUrl,
    archiveJob,
  }
}
