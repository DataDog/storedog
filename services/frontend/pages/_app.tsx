import '@assets/main.css'
import '@assets/chrome-bug.css'
import 'keen-slider/keen-slider.min.css'

import { FC, useEffect, useState } from 'react'
import type { AppProps } from 'next/app'
import { CartProvider, useCart } from '@lib/CartContext'

import { Head } from '@components/common'
import { ManagedUIContext } from '@components/ui/context'
import { datadogRum, RumInitConfiguration } from '@datadog/browser-rum'
import ErrorBoundary from '@components/ErrorBoundary'
import SessionDebugPanel from '@components/SessionDebugPanel'
import { datadogLogs } from '@datadog/browser-logs'
import {
  MockSession,
  ViewEvent,
  ResourceEvent,
  ErrorEvent,
  ActionEvent,
  LongTaskEvent,
  GenericEvent,
} from '@lib/sessionMocking'

// Initialize mock session
const mockSession = new MockSession()

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
    defaultPrivacyLevel: 'allow',
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
      // Route to appropriate event handler
      if (event.type === 'view') {
        ViewEvent.handle(event, mockSession, datadogLogs)
      } else if (event.type === 'resource') {
        ResourceEvent.handle(event, mockSession, datadogLogs)
      } else if (event.type === 'error') {
        ErrorEvent.handle(event, mockSession, datadogLogs)
      } else if (event.type === 'action') {
        ActionEvent.handle(event, mockSession, datadogLogs)
      } else if (event.type === 'long_task') {
        LongTaskEvent.handle(event, mockSession, datadogLogs)
      } else {
        GenericEvent.handle(event, mockSession, datadogLogs)
      }

      // Filter out specific errors
      if (
        event.type === 'error' &&
        event.error.message === 'The resource you were looking for could not be found.'
      ) {
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

    // Only use cookie (set by nginx at runtime)
    let appId = getCookie('rum_app_id')
    let clientToken = getCookie('rum_client_token')

    // Debug: Log all cookies
    console.log('[RUM Init] All cookies:', document.cookie)
    console.log('[RUM Init] rum_app_id cookie:', appId)
    console.log('[RUM Init] rum_client_token cookie:', clientToken)

    // Only initialize if we have real credentials from nginx
    if (!appId || !clientToken) {
      console.error('[RUM Init] Missing RUM credentials from nginx cookies. RUM will not be initialized.')
      return
      // appId = "placeholder-app-id"
      // clientToken = "placeholder-client-token"
    }

    // Initialize RUM with dynamic config
    console.log('[RUM Init] Initializing with App ID:', appId, 'Token:', clientToken.substring(0, 8) + '...')
    datadogRum.init(getRumConfig(appId, clientToken))
    console.log('[RUM Init] ✅ SDK initialized successfully')

    // Initialize Logs SDK with same credentials
    datadogLogs.init({
      clientToken: clientToken,
      site: (process.env.NEXT_PUBLIC_DD_SITE || 'datadoghq.com') as 'datadoghq.com' | 'datadoghq.eu' | 'us3.datadoghq.com' | 'us5.datadoghq.com' | 'ap1.datadoghq.com',
      service: `${process.env.NEXT_PUBLIC_DD_SERVICE_FRONTEND || 'store-frontend'}`,
      version: `${process.env.NEXT_PUBLIC_DD_VERSION_FRONTEND || '1.0.0'}`,
      env: `${process.env.NEXT_PUBLIC_DD_ENV || 'development'}`,
      forwardErrorsToLogs: true,
      sessionSampleRate: 100,
    })

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
  const [showDebugPanel, setShowDebugPanel] = useState(false)

  // Initialize RUM first (must be before other RUM calls)
  useInitializeRum()

  useEffect(() => {
    document.body.classList?.remove('loading')
    if (window?.location.search.includes('end_session=true')) {
      console.log('[RUM] Attempting to stop session...')
      // Wait for RUM to be initialized before stopping session
      const stopSession = () => {
        if ((window as any).__DD_RUM_INITIALIZED__) {
          console.log('[RUM] Stopping session')
          datadogRum.stopSession()
        } else {
          console.log('[RUM] SDK not initialized yet, waiting...')
          setTimeout(stopSession, 100)
        }
      }
      stopSession()
    }
  }, [])

  useEffect(() => {
    // if user exists in local storage, set user or create a new user
    if (localStorage.getItem('rum_user')) {
      const user = JSON.parse(localStorage.getItem('rum_user') || '')
      datadogRum.setUser(user)
      
      // Show debug panel only for learning center user
      if (user.email === 'learning-center-user@example.com') {
        setShowDebugPanel(true)
      }
    } else {
      const anonymousUser = {
        id: Math.random().toString(36).substring(2, 15),
        name: 'Learning Center User',
        email: 'learning-center-user@example.com',
      }
      localStorage.setItem('rum_user', JSON.stringify(anonymousUser))
      datadogRum.setUser(anonymousUser)
      setShowDebugPanel(true) // This is the learning center user
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
      {showDebugPanel && <SessionDebugPanel />}
    </>
  )
}
