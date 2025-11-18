import '@assets/main.css'
import '@assets/chrome-bug.css'
import 'keen-slider/keen-slider.min.css'

import { FC, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { CartProvider, useCart } from '@lib/CartContext'

import { Head } from '@components/common'
import { ManagedUIContext } from '@components/ui/context'
import { datadogRum, RumInitConfiguration } from '@datadog/browser-rum'
import ErrorBoundary from '@components/ErrorBoundary'

// RUM configuration factory - generates config with dynamic application ID and client token
function getRumConfig(applicationId: string, clientToken: string): RumInitConfiguration {
  return {
    applicationId,
    clientToken,
    site: (process.env.NEXT_PUBLIC_DD_SITE || 'datadoghq.com') as
      | 'datadoghq.com'
      | 'datadoghq.eu'
      | 'us3.datadoghq.com'
      | 'us5.datadoghq.com'
      | 'ap1.datadoghq.com',
    service: `${process.env.NEXT_PUBLIC_DD_SERVICE_FRONTEND || 'store-frontend'}`,
    version: `${process.env.NEXT_PUBLIC_DD_VERSION_FRONTEND || '1.0.0'}`,
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
    beforeSend: (event: any) => {
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
  }
}

// Helper to read cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

// Initialize RUM only on client-side with cookie/localStorage support
function useInitializeRum() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') {
      return
    }

    // Check if already initialized
    if ((window as any).__DD_RUM_INITIALIZED__) {
      return
    }

    // Priority: Cookie (set by nginx) > localStorage (legacy) > env var
    const appId = 
      getCookie('rum_app_id') ||
      localStorage.getItem('rum_app_id') || 
      process.env.NEXT_PUBLIC_DD_APPLICATION_ID || 
      'DD_APPLICATION_ID_PLACEHOLDER'

    const clientToken = 
      getCookie('rum_client_token') ||
      process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN || 
      'DD_CLIENT_TOKEN_PLACEHOLDER'

    console.log('[RUM Init] Using application ID:', appId)
    console.log('[RUM Init] Using client token:', clientToken?.substring(0, 8) + '...')

    // Initialize RUM with dynamic config
    datadogRum.init(getRumConfig(appId, clientToken))

    // Mark as initialized
    ;(window as any).__DD_RUM_INITIALIZED__ = true
  }, []) // Empty deps - only run once on mount
}

const Noop: FC = ({ children }) => <>{children}</>

const CartWatcher = () => {
  const { cart } = useCart()
  useEffect(() => {
    if (!cart) {
      return
    }

    datadogRum.setGlobalContextProperty('cart_status', {
      cartTotal: cart.totalPrice,
    })
  }, [cart])

  return null
}

export default function MyApp({ Component, pageProps }: AppProps) {
  const Layout = (Component as any).Layout || Noop

  // Initialize RUM first (must be before other RUM calls)
  useInitializeRum()

  useEffect(() => {
    document.body.classList?.remove('loading')
    if (window?.location.search.includes('end_session=true')) {
      datadogRum.stopSession()
    }
  }, [])

  useEffect(() => {
    // if user exists in local storage, set user or create a new user
  if (localStorage.getItem('rum_user')) {
    const user = JSON.parse(localStorage.getItem('rum_user') || '')
    datadogRum.setUser(user)
  } else {
    const anonymousUser = {
      id: Math.random().toString(36).substring(2, 15),
      name: 'Learning Center User',
      email: 'learning-center-user@example.com',
    }
    localStorage.setItem('rum_user', JSON.stringify(anonymousUser))
    datadogRum.setUser(anonymousUser)
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
