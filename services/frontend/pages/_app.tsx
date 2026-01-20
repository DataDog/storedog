import '@assets/main.css'
import '@assets/chrome-bug.css'
import 'keen-slider/keen-slider.min.css'

import { FC, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { CartProvider, useCart } from '@lib/CartContext'

import { Head } from '@components/common'
import { ManagedUIContext } from '@components/ui/context'
import ErrorBoundary from '@components/ErrorBoundary'
import { datadogRum } from '@datadog/browser-rum'

datadogRum.init({
  applicationId: `${
    process.env.NEXT_PUBLIC_DD_APPLICATION_ID || 'DD_APPLICATION_ID_PLACEHOLDER'
  }`,
  clientToken: `${
    process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN || 'DD_CLIENT_TOKEN_PLACEHOLDER'
  }`,
  site: 'datadoghq.com',
  service: `${process.env.NEXT_PUBLIC_DD_SERVICE_FRONTEND || 'DD_SERVICE_PLACEHOLDER'}`,
  version: `${process.env.NEXT_PUBLIC_DD_VERSION_FRONTEND || 'DD_VERSION_PLACEHOLDER'}`,
  env: `${process.env.NEXT_PUBLIC_DD_ENV || 'DD_ENV_PLACEHOLDER'}`,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  silentMultipleInit: true,
  defaultPrivacyLevel: 'mask-user-input',
  allowedTracingUrls: [
    {
      match: /https:\/\/.*\.env.play.instruqt\.com/,
      propagatorTypes: ['tracecontext', 'datadog', 'b3', 'b3multi'],
    },
    {
      match: /^http:\/\/localhost(:\d+)?$/,
      propagatorTypes: ['tracecontext', 'datadog', 'b3', 'b3multi'],
    },
    {
      match: /.*/,
      propagatorTypes: ['tracecontext', 'datadog', 'b3', 'b3multi'],
    },
  ],
  traceSampleRate: 100,
  allowUntrustedEvents: true,
  beforeSend: (event) => {
    if (
      event.type === 'error' &&
      event.error.message ===
        'The resource you were looking for could not be found.'
    ) {
      console.log(event)
      return false
    }
    return true
  },
})

const Noop: FC = ({ children }) => <>{children}</>

const CartWatcher = () => {
  const { cart } = useCart()
  useEffect(() => {
    if (!cart) {
      return
    }

  }, [cart])

  return null
}

export default function MyApp({ Component, pageProps }: AppProps) {
  const Layout = (Component as any).Layout || Noop

  useEffect(() => {
    document.body.classList?.remove('loading')
  }, [])

  return (
    <>
      <CartProvider>
        <Head />
        <ManagedUIContext>
          <CartWatcher />
          <Layout pageProps={pageProps}>
            <ErrorBoundary>
              <Component {...pageProps} />
            </ErrorBoundary>
          </Layout>
        </ManagedUIContext>
      </CartProvider>
    </>
  )
}
