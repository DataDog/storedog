import '@assets/main.css'
import '@assets/chrome-bug.css'
import 'keen-slider/keen-slider.min.css'

import { FC, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { CartProvider, useCart } from '@lib/CartContext'

import { Head } from '@components/common'
import { ManagedUIContext } from '@components/ui/context'
import { datadogRum } from '@datadog/browser-rum'
import ErrorBoundary from '@components/ErrorBoundary'

datadogRum.init({
  applicationId: `${
    process.env.NEXT_PUBLIC_DD_APPLICATION_ID || 'DD_APPLICATION_ID_PLACEHOLDER'
  }`,
  clientToken: `${
    process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN || 'DD_CLIENT_TOKEN_PLACEHOLDER'
  }`,
  site: `${process.env.NEXT_PUBLIC_DD_SITE || 'datadoghq.com'}`,
  service: `${process.env.NEXT_PUBLIC_DD_SERVICE || 'frontend'}`,
  version: `${process.env.NEXT_PUBLIC_DD_VERSION || '1.0.0'}`,
  env: `${process.env.NEXT_PUBLIC_DD_ENV || 'development'}`,
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
})

const Noop: FC = ({ children }) => <>{children}</>

const CartWatcher = () => {
  const { cart } = useCart()
  useEffect(() => {
    if (!cart) {
      return
    }

    datadogRum.setGlobalContextProperty('cart_status', {
      cartTotal: cart.totalPrice,
      lineItems: cart.lineItems,
    })

    datadogRum.addAction('Cart Updated', {
      cartTotal: cart.totalPrice,
      discounts: cart.discounts,
      id: cart.id,
      lineItems: cart.lineItems,
    })
  }, [cart])

  return null
}

export default function MyApp({ Component, pageProps }: AppProps) {
  const Layout = (Component as any).Layout || Noop

  useEffect(() => {
    document.body.classList?.remove('loading')
    if (window?.location.search.includes('end_session=true')) {
      datadogRum.stopSession()
    }
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
