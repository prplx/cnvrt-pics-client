'use client'

import type { FC } from 'react'
import { AppCheckProvider, useFirebaseApp } from 'reactfire'
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from 'firebase/app-check'

type Props = {
  children: React.ReactNode
}

export const FirebaseAppCheckProvider: FC<Props> = ({ children }) => {
  const app = useFirebaseApp()

  if (typeof window === 'undefined') {
    return <>{children}</>
  }

  const provider = new ReCaptchaEnterpriseProvider(
    process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_SITE_KEY!
  )

  const sdk = initializeAppCheck(app, {
    provider,
    isTokenAutoRefreshEnabled: true,
  })

  return <AppCheckProvider sdk={sdk}>{children}</AppCheckProvider>
}
