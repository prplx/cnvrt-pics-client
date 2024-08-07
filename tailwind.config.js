/** @type {import('tailwindcss').Config} */
import { nextui } from '@nextui-org/react'
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    fontFamily: {
      body: ['"Inter"'],
    },
    extend: {
      colors: {
        emerald: '#50C27D',
        purple: '#9353d3',
        ['purple-dark']: '#7828c8',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    nextui({
      defaultTheme: 'dark',
    }),
  ],
}
