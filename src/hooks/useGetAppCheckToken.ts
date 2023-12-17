import { useCallback, useContext } from 'react'
import { getToken } from 'firebase/app-check'
import { AppCheckSdkContext } from 'reactfire'

export function useGetAppCheckToken() {
  const sdk = useContext(AppCheckSdkContext)

  return useCallback(async () => {
    try {
      if (!sdk) {
        return
      }

      const forceRefresh = false
      const { token } = await getToken(sdk, forceRefresh)

      return token
    } catch (e) {
      return
    }
  }, [sdk])
}
