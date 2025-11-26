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

// Track seen view IDs to detect view updates
const seenViewIds = new Set<string>()

// Session counters for tracking RUM events
const sessionCounters = {
  view: 0,
  error: 0,
  action: 0,
  resource: 0,
  long_task: 0,
  frustration: 0,
  last_resource_dispatch: 0,
  first_event_time: null as number | null
}

// Track previous cart status for change detection
let previousCartStatus: any = null

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
      // Record first event time
      if (!sessionCounters.first_event_time) {
        sessionCounters.first_event_time = performance.now()
      }
      
      // Track cart status changes
      const currentCartStatus = event.context?.cart_status
      
      const cartStatusChanged = currentCartStatus && 
        JSON.stringify(currentCartStatus) !== JSON.stringify(previousCartStatus)
      
      if (currentCartStatus) {
        previousCartStatus = currentCartStatus
      }
      
      // Dispatch events to UI and mock session attribute changes
      if (event.type === 'resource') {
        sessionCounters.resource++
        
        // Only dispatch every 10 resources
        if (sessionCounters.resource === 1 || sessionCounters.resource - sessionCounters.last_resource_dispatch >= 10) {
          const additionalChanges = []
          
          // Add cart status if it changed
          if (cartStatusChanged && currentCartStatus) {
            additionalChanges.push({
              field: 'context.cart_status.cartTotal',
              to: currentCartStatus.cartTotal
            })
          }
          
          // Log to Datadog
          const updates = [`@session.resource.count:${sessionCounters.resource}`]
          if (cartStatusChanged && currentCartStatus?.cartTotal) {
            updates.push(`@context.cart_status.cartTotal:${currentCartStatus.cartTotal}`)
          }
          datadogLogs.logger.info(`RUM Event: resource | Session: ${updates.join(', ')}`)
          
          window.dispatchEvent(new CustomEvent('rum-event', {
            detail: { 
              type: 'resource',
              count: sessionCounters.resource,
              sessionChange: {
                field: 'resource.count',
                to: sessionCounters.resource
              },
              additionalChanges: additionalChanges.length > 0 ? additionalChanges : undefined
            }
          }))
          sessionCounters.last_resource_dispatch = sessionCounters.resource
        }
      } else if (event.type === 'view') {
        // Check if this view ID has been seen before (indicating an update)
        const viewId = event.view?.id
        const isUpdate = viewId && seenViewIds.has(viewId)
        if (viewId) {
          seenViewIds.add(viewId)
        }
        
        // Only increment view count for new views (not updates)
        if (!isUpdate) {
          sessionCounters.view++
        }
        
        // Mock time_spent as time since first RUM event (in milliseconds)
        const timeSpent = performance.now() - sessionCounters.first_event_time
        
        const additionalChanges = [
          {
            field: 'session.time_spent',
            to: Math.round(timeSpent)
          }
        ]
        
        // Add cart status if it changed
        if (cartStatusChanged && currentCartStatus) {
          additionalChanges.push({
            field: 'context.cart_status.cartTotal',
            to: currentCartStatus.cartTotal
          })
        }
        
        // Log to Datadog
        const updates = [`@session.view.count:${sessionCounters.view}`, `@session.time_spent:${Math.round(timeSpent)}`]
        if (cartStatusChanged && currentCartStatus?.cartTotal) {
          updates.push(`@context.cart_status.cartTotal:${currentCartStatus.cartTotal}`)
        }
        const viewPath = event.view?.url_path || event.view?.name || 'view'
        datadogLogs.logger.info(`RUM Event: view - ${viewPath} | Session: ${updates.join(', ')}`)
        
        window.dispatchEvent(new CustomEvent('rum-event', {
          detail: { 
            type: 'view',
            count: sessionCounters.view,
            data: { url_path: event.view?.url_path, name: event.view?.name },
            sessionChange: {
              field: 'view.count',
              to: sessionCounters.view
            },
            additionalChanges,
            isUpdate
          }
        }))
      } else if (event.type === 'error') {
        sessionCounters.error++
        
        const additionalChanges = []
        
        // Add cart status if it changed
        if (cartStatusChanged && currentCartStatus) {
          additionalChanges.push({
            field: 'context.cart_status.cartTotal',
            to: currentCartStatus.cartTotal
          })
        }
        
        // Log to Datadog
        const updates = [`@session.error.count:${sessionCounters.error}`]
        if (cartStatusChanged && currentCartStatus?.cartTotal) {
          updates.push(`@context.cart_status.cartTotal:${currentCartStatus.cartTotal}`)
        }
        datadogLogs.logger.info(`RUM Event: error - ${event.error?.message} | Session: ${updates.join(', ')}`)
        
        window.dispatchEvent(new CustomEvent('rum-event', {
          detail: { 
            type: 'error',
            data: { message: event.error?.message },
            sessionChange: {
              field: 'error.count',
              to: sessionCounters.error
            },
            additionalChanges: additionalChanges.length > 0 ? additionalChanges : undefined
          }
        }))
      } else if (event.type === 'action') {
        sessionCounters.action++
        
        const additionalChanges = []
        
        // Add cart status if it changed
        if (cartStatusChanged && currentCartStatus) {
          additionalChanges.push({
            field: 'context.cart_status.cartTotal',
            to: currentCartStatus.cartTotal
          })
        }
        
        // Log to Datadog
        const updates = [`@session.action.count:${sessionCounters.action}`]
        if (cartStatusChanged && currentCartStatus?.cartTotal) {
          updates.push(`@context.cart_status.cartTotal:${currentCartStatus.cartTotal}`)
        }
        datadogLogs.logger.info(`RUM Event: action - ${event.action?.target?.name} | Session: ${updates.join(', ')}`)
        
        window.dispatchEvent(new CustomEvent('rum-event', {
          detail: { 
            type: 'action',
            data: { name: event.action?.target?.name },
            sessionChange: {
              field: 'action.count',
              to: sessionCounters.action
            },
            additionalChanges: additionalChanges.length > 0 ? additionalChanges : undefined
          }
        }))
      } else if (event.type === 'long_task') {
        sessionCounters.long_task++
        
        const additionalChanges = []
        
        // Add cart status if it changed
        if (cartStatusChanged && currentCartStatus) {
          additionalChanges.push({
            field: 'context.cart_status.cartTotal',
            to: currentCartStatus.cartTotal
          })
        }
        
        // Log to Datadog
        const updates = [`@session.long_task.count:${sessionCounters.long_task}`]
        if (cartStatusChanged && currentCartStatus?.cartTotal) {
          updates.push(`@context.cart_status.cartTotal:${currentCartStatus.cartTotal}`)
        }
        datadogLogs.logger.info(`RUM Event: long_task | Session: ${updates.join(', ')}`)
        
        window.dispatchEvent(new CustomEvent('rum-event', {
          detail: { 
            type: 'long_task',
            sessionChange: {
              field: 'long_task.count',
              to: sessionCounters.long_task
            },
            additionalChanges: additionalChanges.length > 0 ? additionalChanges : undefined
          }
        }))
      } else {
        // Other event types
        const additionalChanges = []
        
        // Add cart status if it changed
        if (cartStatusChanged && currentCartStatus) {
          additionalChanges.push({
            field: 'context.cart_status.cartTotal',
            to: currentCartStatus.cartTotal
          })
        }
        
        // Log to Datadog
        if (cartStatusChanged && currentCartStatus?.cartTotal) {
          datadogLogs.logger.info(`RUM Event: ${event.type} | Session: @context.cart_status.cartTotal:${currentCartStatus.cartTotal}`)
        } else {
          datadogLogs.logger.info(`RUM Event: ${event.type}`)
        }
        
        window.dispatchEvent(new CustomEvent('rum-event', {
          detail: { 
            type: event.type,
            data: event,
            additionalChanges: additionalChanges.length > 0 ? additionalChanges : undefined
          }
        }))
      }
      
      if (
        event.type === 'error' &&
        event.error.message ===
          'The resource you were looking for could not be found.'
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

    // Only initialize if we have real credentials from nginx
    if (!appId || !clientToken) {
      console.error('[RUM Init] Missing RUM credentials from nginx cookies. RUM will not be initialized.')
      return
      // appId = "placeholder-app-id"
      // clientToken = "placeholder-client-token"
    }

    // Initialize RUM with dynamic config
    datadogRum.init(getRumConfig(appId, clientToken))

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
      datadogRum.stopSession()
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
