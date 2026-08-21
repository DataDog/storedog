import { MAX_EVENTS, RESOURCE_DISPATCH_THRESHOLD } from './sessionMocking.constants'
import { formatTimestamp, generateEventId } from './sessionFormatting'
import type {
  CountableEventType,
  EventDispatchPayload,
  RumEvent,
  DatadogViewEvent,
  DatadogErrorEvent,
  DatadogActionEvent,
  DatadogResourceEvent,
  DatadogLongTaskEvent,
  DatadogVitalsEvent,
} from './sessionMocking.types'

// Buffered so the debug panel can backfill events dispatched before it mounts
// (e.g. the session-start and first-view events, which fire as soon as RUM initializes).
const eventBuffer: RumEvent[] = []

export function getBufferedRumEvents(): RumEvent[] {
  return eventBuffer
}

const UNKNOWN_VIEW_ID = 'unknown'

export class MockSession {
  private counters = {
    view: 0,
    error: 0,
    action: 0,
    long_task: 0,
    frustration: 0,
  }

  private resourceCounts = new Map<string, number>()
  private lastResourceDispatch = new Map<string, number>()

  private seenViewIds = new Set<string>()
  private sessionStarted = false

  hasStartedSession(): boolean {
    return this.sessionStarted
  }

  markSessionStarted(): void {
    this.sessionStarted = true
  }

  getCounter(type: CountableEventType): number {
    return this.counters[type]
  }

  incrementCounter(type: CountableEventType): void {
    this.counters[type]++
  }

  incrementResourceCount(viewId: string | undefined): number {
    const key = viewId ?? UNKNOWN_VIEW_ID
    const next = (this.resourceCounts.get(key) ?? 0) + 1
    this.resourceCounts.set(key, next)
    return next
  }

  getResourceCount(viewId: string | undefined): number {
    return this.resourceCounts.get(viewId ?? UNKNOWN_VIEW_ID) ?? 0
  }

  getLastResourceDispatch(viewId: string | undefined): number {
    return this.lastResourceDispatch.get(viewId ?? UNKNOWN_VIEW_ID) ?? 0
  }

  setLastResourceDispatch(viewId: string | undefined, value: number): void {
    this.lastResourceDispatch.set(viewId ?? UNKNOWN_VIEW_ID, value)
  }

  hasSeenView(viewId: string): boolean {
    return this.seenViewIds.has(viewId)
  }

  markViewAsSeen(viewId: string): void {
    this.seenViewIds.add(viewId)
  }
}

abstract class BaseEventHandler {
  protected static dispatchEvent(payload: EventDispatchPayload): void {
    const eventWithMetadata = {
      ...payload,
      id: generateEventId(),
      timestamp: formatTimestamp(),
    } as RumEvent

    eventBuffer.push(eventWithMetadata)
    if (eventBuffer.length > MAX_EVENTS) {
      eventBuffer.shift()
    }

    window.dispatchEvent(new CustomEvent('rum-event', { detail: eventWithMetadata }))
  }

  protected static ensureSessionStarted(session: MockSession): void {
    if (session.hasStartedSession()) {
      return
    }
    session.markSessionStarted()
    this.dispatchEvent({ type: 'session' })
  }

  protected static recordAndIncrement(
    session: MockSession,
    eventType: CountableEventType
  ): void {
    session.incrementCounter(eventType)
  }
}

export class ViewEventHandler extends BaseEventHandler {
  static handle(event: DatadogViewEvent, session: MockSession): void {
    this.ensureSessionStarted(session)

    const viewId = event.view?.id
    const isUpdate = viewId ? session.hasSeenView(viewId) : false

    if (viewId) {
      session.markViewAsSeen(viewId)
    }

    if (isUpdate) {
      return
    }

    session.incrementCounter('view')

    this.dispatchEvent({
      type: 'view',
      count: session.getCounter('view'),
      data: {
        url: event.view?.url || '',
        name: event.view?.name
      },
      viewId,
    })
  }
}

export class ResourceEventHandler extends BaseEventHandler {
  static handle(event: DatadogResourceEvent, session: MockSession): void {
    this.ensureSessionStarted(session)

    const viewId = event.view?.id
    const count = session.incrementResourceCount(viewId)

    const shouldDispatch =
      count === 1 ||
      count - session.getLastResourceDispatch(viewId) >= RESOURCE_DISPATCH_THRESHOLD

    if (shouldDispatch) {
      this.dispatchEvent({
        type: 'resource',
        count,
        viewId,
      })

      session.setLastResourceDispatch(viewId, count)
    }
  }
}

export class ErrorEventHandler extends BaseEventHandler {
  static handle(event: DatadogErrorEvent, session: MockSession): void {
    this.ensureSessionStarted(session)
    this.recordAndIncrement(session, 'error')

    this.dispatchEvent({
      type: 'error',
      data: { message: event.error?.message || 'Unknown error' },
      viewId: event.view?.id,
    })
  }
}

export class ActionEventHandler extends BaseEventHandler {
  static handle(event: DatadogActionEvent, session: MockSession): void {
    this.ensureSessionStarted(session)
    this.recordAndIncrement(session, 'action')

    this.dispatchEvent({
      type: 'action',
      data: { name: event.action?.target?.name },
      viewId: event.view?.id,
    })
  }
}

export class LongTaskEventHandler extends BaseEventHandler {
  static handle(event: DatadogLongTaskEvent, session: MockSession): void {
    this.ensureSessionStarted(session)
    this.recordAndIncrement(session, 'long_task')

    this.dispatchEvent({
      type: 'long_task',
      viewId: event.view?.id,
    })
  }
}

export class VitalsEventHandler extends BaseEventHandler {
  static handle(event: DatadogVitalsEvent, session: MockSession): void {
    this.ensureSessionStarted(session)
    this.dispatchEvent({
      type: 'vitals',
      data: event,
      viewId: event.view?.id,
    })
  }
}

export const ViewEvent = ViewEventHandler
export const ResourceEvent = ResourceEventHandler
export const ErrorEvent = ErrorEventHandler
export const ActionEvent = ActionEventHandler
export const LongTaskEvent = LongTaskEventHandler
export const VitalsEvent = VitalsEventHandler

export type { CountableEventType } from './sessionMocking.types'
