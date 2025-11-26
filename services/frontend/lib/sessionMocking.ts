import { datadogLogs } from '@datadog/browser-logs'

// Event type metadata - shared between dispatching and display
export const EVENT_COLORS: Record<string, { bg: string; text: string }> = {
  session: { bg: 'rgb(99, 44, 166)', text: '#ffffff' },
  view: { bg: 'rgb(0, 107, 194)', text: '#ffffff' },
  action: { bg: 'rgb(147, 100, 205)', text: '#ffffff' },
  error: { bg: '#ef4444', text: '#ffffff' },
  resource: { bg: '#60a5fa', text: '#ffffff' },
  long_task: { bg: '#fcc028', text: '#000000' },
  vitals: { bg: '#06b6d4', text: '#ffffff' },
}

export function getEventTypeColor(type: string) {
  return EVENT_COLORS[type] || { bg: '#64748b', text: '#ffffff' }
}

// Activity interface for type safety
export interface Activity {
  timestamp: string
  type: string
  count?: number
  data?: any
  sessionChange?: {
    field: string
    to: any
  }
  additionalChanges?: Array<{
    field: string
    to: any
  }>
  isUpdate?: boolean
}

// MockSession class - tracks all session state and counters
export class MockSession {
  // Counters for each event type
  private counters = {
    view: 0,
    error: 0,
    action: 0,
    resource: 0,
    long_task: 0,
    frustration: 0,
    last_resource_dispatch: 0,
  }

  // State tracking
  private seenViewIds = new Set<string>()
  private firstEventTime: number | null = null
  private previousCartStatus: any = null

  // Initialize first event time if not already set
  recordEventTime() {
    if (!this.firstEventTime) {
      this.firstEventTime = performance.now()
    }
  }

  // Counter getters
  getCounter(type: 'view' | 'error' | 'action' | 'resource' | 'long_task' | 'frustration') {
    return this.counters[type]
  }

  // Counter setters
  incrementCounter(type: 'view' | 'error' | 'action' | 'resource' | 'long_task' | 'frustration') {
    this.counters[type]++
  }

  // Resource-specific tracking
  getLastResourceDispatch() {
    return this.counters.last_resource_dispatch
  }

  setLastResourceDispatch(value: number) {
    this.counters.last_resource_dispatch = value
  }

  // View tracking
  hasSeenView(viewId: string): boolean {
    return this.seenViewIds.has(viewId)
  }

  markViewAsSeen(viewId: string) {
    this.seenViewIds.add(viewId)
  }

  // Time tracking
  getTimeSpent(): number {
    if (!this.firstEventTime) return 0
    return performance.now() - this.firstEventTime
  }

  // Cart status tracking
  checkCartStatusChange(currentCartStatus: any): boolean {
    const changed =
      currentCartStatus && JSON.stringify(currentCartStatus) !== JSON.stringify(this.previousCartStatus)

    if (currentCartStatus) {
      this.previousCartStatus = currentCartStatus
    }

    return changed
  }

  getCurrentCartStatus() {
    return this.previousCartStatus
  }
}

// Base event handler with common functionality
abstract class BaseEventHandler {
  protected static dispatchEvent(detail: any) {
    window.dispatchEvent(new CustomEvent('rum-event', { detail }))
  }

  protected static formatCartChange(cartTotal: any) {
    return {
      field: 'context.cart_status.cartTotal',
      to: cartTotal,
    }
  }

  protected static buildLogUpdates(updates: string[]): string {
    return updates.join(', ')
  }
}

// ViewEvent handler
export class ViewEvent extends BaseEventHandler {
  static handle(event: any, session: MockSession, logger: typeof datadogLogs) {
    session.recordEventTime()

    const viewId = event.view?.id
    const isUpdate = viewId && session.hasSeenView(viewId)

    console.log('[RUM beforeSend] View event:', {
      viewId,
      isUpdate,
      currentCount: session.getCounter('view'),
      urlPath: event.view?.url_path,
    })

    if (viewId) {
      session.markViewAsSeen(viewId)
    }

    // Only increment view count for new views (not updates)
    if (!isUpdate) {
      session.incrementCounter('view')
      console.log('[RUM beforeSend] Incremented view count to:', session.getCounter('view'))
    } else {
      console.log('[RUM beforeSend] Skipping increment - this is an update')
    }

    const timeSpent = Math.round(session.getTimeSpent())
    const cartStatusChanged = session.checkCartStatusChange(event.context?.cart_status)
    const currentCartStatus = session.getCurrentCartStatus()

    const additionalChanges = [
      {
        field: 'session.time_spent',
        to: timeSpent,
      },
    ]

    if (cartStatusChanged && currentCartStatus) {
      additionalChanges.push(this.formatCartChange(currentCartStatus.cartTotal))
    }

    // Log to Datadog
    const updates = [
      `@session.view.count:${session.getCounter('view')}`,
      `@session.time_spent:${timeSpent}`,
    ]
    if (cartStatusChanged && currentCartStatus?.cartTotal) {
      updates.push(`@context.cart_status.cartTotal:${currentCartStatus.cartTotal}`)
    }
    const viewPath = event.view?.url_path || event.view?.name || 'view'
    logger.logger.info(`RUM Event: view - ${viewPath} | Session: ${this.buildLogUpdates(updates)}`)

    // Dispatch to UI
    this.dispatchEvent({
      type: 'view',
      count: session.getCounter('view'),
      data: { url_path: event.view?.url_path, name: event.view?.name },
      sessionChange: {
        field: 'view.count',
        to: session.getCounter('view'),
      },
      additionalChanges,
      isUpdate,
    })
  }
}

// ResourceEvent handler
export class ResourceEvent extends BaseEventHandler {
  static handle(event: any, session: MockSession, logger: typeof datadogLogs) {
    session.recordEventTime()
    session.incrementCounter('resource')

    const cartStatusChanged = session.checkCartStatusChange(event.context?.cart_status)
    const currentCartStatus = session.getCurrentCartStatus()

    // Only dispatch every 10 resources
    if (
      session.getCounter('resource') === 1 ||
      session.getCounter('resource') - session.getLastResourceDispatch() >= 10
    ) {
      const additionalChanges = []

      if (cartStatusChanged && currentCartStatus) {
        additionalChanges.push(this.formatCartChange(currentCartStatus.cartTotal))
      }

      // Log to Datadog
      const updates = [`@session.resource.count:${session.getCounter('resource')}`]
      if (cartStatusChanged && currentCartStatus?.cartTotal) {
        updates.push(`@context.cart_status.cartTotal:${currentCartStatus.cartTotal}`)
      }
      logger.logger.info(`RUM Event: resource | Session: ${this.buildLogUpdates(updates)}`)

      // Dispatch to UI
      this.dispatchEvent({
        type: 'resource',
        count: session.getCounter('resource'),
        sessionChange: {
          field: 'resource.count',
          to: session.getCounter('resource'),
        },
        additionalChanges: additionalChanges.length > 0 ? additionalChanges : undefined,
      })

      session.setLastResourceDispatch(session.getCounter('resource'))
    }
  }
}

// ErrorEvent handler
export class ErrorEvent extends BaseEventHandler {
  static handle(event: any, session: MockSession, logger: typeof datadogLogs) {
    session.recordEventTime()
    session.incrementCounter('error')

    const cartStatusChanged = session.checkCartStatusChange(event.context?.cart_status)
    const currentCartStatus = session.getCurrentCartStatus()

    const additionalChanges = []

    if (cartStatusChanged && currentCartStatus) {
      additionalChanges.push(this.formatCartChange(currentCartStatus.cartTotal))
    }

    // Log to Datadog
    const updates = [`@session.error.count:${session.getCounter('error')}`]
    if (cartStatusChanged && currentCartStatus?.cartTotal) {
      updates.push(`@context.cart_status.cartTotal:${currentCartStatus.cartTotal}`)
    }
    logger.logger.info(
      `RUM Event: error - ${event.error?.message} | Session: ${this.buildLogUpdates(updates)}`
    )

    // Dispatch to UI
    this.dispatchEvent({
      type: 'error',
      data: { message: event.error?.message },
      sessionChange: {
        field: 'error.count',
        to: session.getCounter('error'),
      },
      additionalChanges: additionalChanges.length > 0 ? additionalChanges : undefined,
    })
  }
}

// ActionEvent handler
export class ActionEvent extends BaseEventHandler {
  static handle(event: any, session: MockSession, logger: typeof datadogLogs) {
    session.recordEventTime()
    session.incrementCounter('action')

    const cartStatusChanged = session.checkCartStatusChange(event.context?.cart_status)
    const currentCartStatus = session.getCurrentCartStatus()

    const additionalChanges = []

    if (cartStatusChanged && currentCartStatus) {
      additionalChanges.push(this.formatCartChange(currentCartStatus.cartTotal))
    }

    // Log to Datadog
    const updates = [`@session.action.count:${session.getCounter('action')}`]
    if (cartStatusChanged && currentCartStatus?.cartTotal) {
      updates.push(`@context.cart_status.cartTotal:${currentCartStatus.cartTotal}`)
    }
    logger.logger.info(
      `RUM Event: action - ${event.action?.target?.name} | Session: ${this.buildLogUpdates(updates)}`
    )

    // Dispatch to UI
    this.dispatchEvent({
      type: 'action',
      data: { name: event.action?.target?.name },
      sessionChange: {
        field: 'action.count',
        to: session.getCounter('action'),
      },
      additionalChanges: additionalChanges.length > 0 ? additionalChanges : undefined,
    })
  }
}

// LongTaskEvent handler
export class LongTaskEvent extends BaseEventHandler {
  static handle(event: any, session: MockSession, logger: typeof datadogLogs) {
    session.recordEventTime()
    session.incrementCounter('long_task')

    const cartStatusChanged = session.checkCartStatusChange(event.context?.cart_status)
    const currentCartStatus = session.getCurrentCartStatus()

    const additionalChanges = []

    if (cartStatusChanged && currentCartStatus) {
      additionalChanges.push(this.formatCartChange(currentCartStatus.cartTotal))
    }

    // Log to Datadog
    const updates = [`@session.long_task.count:${session.getCounter('long_task')}`]
    if (cartStatusChanged && currentCartStatus?.cartTotal) {
      updates.push(`@context.cart_status.cartTotal:${currentCartStatus.cartTotal}`)
    }
    logger.logger.info(`RUM Event: long_task | Session: ${this.buildLogUpdates(updates)}`)

    // Dispatch to UI
    this.dispatchEvent({
      type: 'long_task',
      sessionChange: {
        field: 'long_task.count',
        to: session.getCounter('long_task'),
      },
      additionalChanges: additionalChanges.length > 0 ? additionalChanges : undefined,
    })
  }
}

// GenericEvent handler for other event types
export class GenericEvent extends BaseEventHandler {
  static handle(event: any, session: MockSession, logger: typeof datadogLogs) {
    session.recordEventTime()

    const cartStatusChanged = session.checkCartStatusChange(event.context?.cart_status)
    const currentCartStatus = session.getCurrentCartStatus()

    const additionalChanges = []

    if (cartStatusChanged && currentCartStatus) {
      additionalChanges.push(this.formatCartChange(currentCartStatus.cartTotal))
    }

    // Log to Datadog
    if (cartStatusChanged && currentCartStatus?.cartTotal) {
      logger.logger.info(
        `RUM Event: ${event.type} | Session: @context.cart_status.cartTotal:${currentCartStatus.cartTotal}`
      )
    } else {
      logger.logger.info(`RUM Event: ${event.type}`)
    }

    // Dispatch to UI
    this.dispatchEvent({
      type: event.type,
      data: event,
      additionalChanges: additionalChanges.length > 0 ? additionalChanges : undefined,
    })
  }
}

