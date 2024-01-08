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

  const makeResponse = async <T>(uri: string, options: RequestInit) => {
    const headers = {
      ...options.headers,
      'X-Firebase-AppCheck': appCheckTokenRef.current ?? '',
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${uri}`, {
      ...options,
      headers,
    })

    return (await response.json()) as T
  }

  const processJob = async (body: FormData, queryParams: URLSearchParams) =>
    makeResponse<{ job_id: number }>(`/process?${queryParams}`, {
      method: 'POST',
      body,
    })

  const processFile = async (
    jobId: string | number,
    queryParams: URLSearchParams
  ) =>
    makeResponse<undefined>(`/process/${jobId}?${queryParams}`, {
      method: 'POST',
    })

  const archiveJob = async (jobId: string | number) =>
    makeResponse<undefined>(`/archive/${jobId}`, {
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
