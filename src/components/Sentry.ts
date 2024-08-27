'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/react'

export const SentryCmp = () => {
  useEffect(() => {
    import('@sentry/react').then(() => {
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          integrations: [Sentry.replayIntegration()],
          tracesSampleRate: 1.0,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
          environment: process.env.NODE_ENV,
        })
      }
    })
  }, [])

  return null
}
