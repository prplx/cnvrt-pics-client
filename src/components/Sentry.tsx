'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/react'
import { isProduction } from '@/lib/utils'

export const SentryCmp = () => {
  useEffect(() => {
    import('@sentry/react').then(() => {
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          integrations: [
            ...(isProduction()
              ? [Sentry.replayIntegration({ maskAllText: false })]
              : []),
          ],
          tracesSampleRate: 1.0,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
          environment: process.env.NODE_ENV,
          tunnel: process.env.NEXT_PUBLIC_SENTRY_TUNNEL_URL,
        })
      }
    })
  }, [])

  return null
}
