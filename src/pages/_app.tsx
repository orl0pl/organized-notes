import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider, AdaptiveProvider, Button } from '@znui/react'

export default function App({ Component, pageProps }: AppProps) {
  return (
  <AdaptiveProvider >
    <Component {...pageProps} />
  </AdaptiveProvider >
)

}
