'use client'

import type { FC } from 'react'
import { FirebaseAppCheckProvider } from '@/providers/FirebaseAppCheckProvider'
import { FirebaseAppProvider } from 'reactfire'
import { NextUIProvider } from '@nextui-org/react'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

type Props = {
  children: React.ReactNode
}

export const Providers: FC<Props> = ({ children }) => {
  return (
    <>
      <FirebaseAppProvider firebaseConfig={firebaseConfig}>
        <FirebaseAppCheckProvider>
          <NextUIProvider>{children}</NextUIProvider>
        </FirebaseAppCheckProvider>
      </FirebaseAppProvider>
    </>
  )
}
