import { ThemeProvider } from '@znui/react'
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <ThemeProvider scheme='system'>
        <Html lang="en">
          <Head />
          <body>
            <Main />
            <NextScript />
          </body>
        </Html>
        </ThemeProvider>
  )
}
