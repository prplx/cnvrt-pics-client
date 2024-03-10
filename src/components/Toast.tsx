'use client'

import { ToastContainer } from 'react-toastify'

export const Toast = () => {
  return (
    <ToastContainer
      position='top-center'
      autoClose={5000}
      closeOnClick
      theme='dark'
    />
  )
}
