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
  updatedProperties?: string[]
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
  private viewStates = new Map<string, any>()

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

  // View state tracking for detecting updates
  getPreviousViewState(viewId: string) {
    return this.viewStates.get(viewId)
  }

  saveViewState(viewId: string, viewData: any) {
    this.viewStates.set(viewId, viewData)
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

    // Detect what properties changed for view updates
    let updatedProperties: string[] = []
    if (isUpdate && viewId) {
      const previousView = session.getPreviousViewState(viewId)
      console.log('[RUM beforeSend] Comparing views for update:', {
        hasPreviousView: !!previousView,
        previousViewKeys: previousView ? Object.keys(previousView) : [],
        currentViewKeys: event.view ? Object.keys(event.view) : [],
      })
      if (previousView) {
        updatedProperties = this.detectViewChanges(previousView, event.view)
      }
    }

    console.log('[RUM beforeSend] View event:', {
      viewId,
      isUpdate,
      currentCount: session.getCounter('view'),
      url: event.view?.url,
      updatedProperties,
    })

    if (viewId) {
      session.markViewAsSeen(viewId)
      // Save current view state for future comparison
      session.saveViewState(viewId, { ...event.view })
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
    const url = event.view?.url
    const viewPath = url || event.view?.name || 'view'
    logger.logger.info(`RUM Event: view - ${viewPath} | Session: ${this.buildLogUpdates(updates)}`)

    // Dispatch to UI
    this.dispatchEvent({
      type: 'view',
      count: session.getCounter('view'),
      data: { url, name: event.view?.name },
      // Only show sessionChange for new views (when count actually changes)
      sessionChange: !isUpdate ? {
        field: 'view.count',
        to: session.getCounter('view'),
      } : undefined,
      additionalChanges,
      isUpdate,
      updatedProperties: updatedProperties.length > 0 ? updatedProperties : undefined,
    })
  }

  private static detectViewChanges(previousView: any, currentView: any): string[] {
    const changes: string[] = []
    const keysToCheck = [
      'loading_time',
      'cumulative_layout_shift',
      'first_contentful_paint',
      'largest_contentful_paint',
      'first_input_delay',
      'interaction_to_next_paint',
      'time_spent',
      'resource_count',
      'error_count',
      'action_count',
      'long_task_count',
    ]

    console.log('[ViewEvent] Checking for changes in properties:', keysToCheck)
    for (const key of keysToCheck) {
      const prevValue = previousView[key]
      const currValue = currentView[key]
      if (prevValue !== currValue && currValue !== undefined) {
        console.log(`[ViewEvent] Change detected in ${key}:`, { from: prevValue, to: currValue })
        changes.push(key)
      }
    }
    console.log('[ViewEvent] Total changes detected:', changes)

    return changes
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
      const timeSpent = Math.round(session.getTimeSpent())
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
        `@session.resource.count:${session.getCounter('resource')}`,
        `@session.time_spent:${timeSpent}`,
      ]
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
        additionalChanges,
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

    const timeSpent = Math.round(session.getTimeSpent())
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
      `@session.error.count:${session.getCounter('error')}`,
      `@session.time_spent:${timeSpent}`,
    ]
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
      additionalChanges,
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

    const timeSpent = Math.round(session.getTimeSpent())
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
      `@session.action.count:${session.getCounter('action')}`,
      `@session.time_spent:${timeSpent}`,
    ]
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
      additionalChanges,
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

    const timeSpent = Math.round(session.getTimeSpent())
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
      `@session.long_task.count:${session.getCounter('long_task')}`,
      `@session.time_spent:${timeSpent}`,
    ]
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
      additionalChanges,
    })
  }
}

// GenericEvent handler for other event types
export class GenericEvent extends BaseEventHandler {
  static handle(event: any, session: MockSession, logger: typeof datadogLogs) {
    session.recordEventTime()

    const cartStatusChanged = session.checkCartStatusChange(event.context?.cart_status)
    const currentCartStatus = session.getCurrentCartStatus()

    const timeSpent = Math.round(session.getTimeSpent())
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
    const updates = [`@session.time_spent:${timeSpent}`]
    if (cartStatusChanged && currentCartStatus?.cartTotal) {
      updates.push(`@context.cart_status.cartTotal:${currentCartStatus.cartTotal}`)
    }
    logger.logger.info(`RUM Event: ${event.type} | Session: ${this.buildLogUpdates(updates)}`)

    // Dispatch to UI
    this.dispatchEvent({
      type: event.type,
      data: event,
      additionalChanges,
    })
  }
}

