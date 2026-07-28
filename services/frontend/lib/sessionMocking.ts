import { RESOURCE_DISPATCH_THRESHOLD, VIEW_TRACKED_PROPERTIES } from './sessionMocking.constants'
import { formatTimestamp, generateEventId } from './sessionFormatting'
import type {
  CountableEventType,
  EventDispatchPayload,
  AttributeChange,
  DatadogViewEvent,
  DatadogErrorEvent,
  DatadogActionEvent,
  DatadogResourceEvent,
  DatadogLongTaskEvent,
  DatadogVitalsEvent,
} from './sessionMocking.types'

export class MockSession {
  private counters = {
    view: 0,
    error: 0,
    action: 0,
    resource: 0,
    long_task: 0,
    frustration: 0,
    last_resource_dispatch: 0,
  }

  private seenViewIds = new Set<string>()
  private firstEventTime: number | null = null
  private viewStates = new Map<string, DatadogViewEvent['view']>()

  recordEventTime(): void {
    if (!this.firstEventTime) {
      this.firstEventTime = performance.now()
    }
  }

  getCounter(type: CountableEventType): number {
    return this.counters[type]
  }

  incrementCounter(type: CountableEventType): void {
    this.counters[type]++
  }

  getLastResourceDispatch(): number {
    return this.counters.last_resource_dispatch
  }

  setLastResourceDispatch(value: number): void {
    this.counters.last_resource_dispatch = value
  }

  hasSeenView(viewId: string): boolean {
    return this.seenViewIds.has(viewId)
  }

  markViewAsSeen(viewId: string): void {
    this.seenViewIds.add(viewId)
  }

  getTimeSpent(): number {
    if (!this.firstEventTime) return 0
    return performance.now() - this.firstEventTime
  }

  getPreviousViewState(viewId: string): DatadogViewEvent['view'] | undefined {
    return this.viewStates.get(viewId)
  }

  saveViewState(viewId: string, viewData: DatadogViewEvent['view']): void {
    this.viewStates.set(viewId, { ...viewData })
  }
}

abstract class BaseEventHandler {
  protected static dispatchEvent(payload: EventDispatchPayload): void {
    const eventWithMetadata = {
      ...payload,
      id: generateEventId(),
      timestamp: formatTimestamp(),
    }
    window.dispatchEvent(new CustomEvent('rum-event', { detail: eventWithMetadata }))
  }

  protected static calculateTimeSpentChanges(session: MockSession): AttributeChange[] {
    const timeSpent = Math.round(session.getTimeSpent())
    return [
      {
        field: 'session.time_spent',
        to: timeSpent,
      },
    ]
  }

  protected static recordAndIncrement(
    session: MockSession,
    eventType: CountableEventType
  ): void {
    session.recordEventTime()
    session.incrementCounter(eventType)
  }
}

export class ViewEventHandler extends BaseEventHandler {
  static handle(event: DatadogViewEvent, session: MockSession): void {
    session.recordEventTime()

    const viewId = event.view?.id
    const isUpdate = viewId ? session.hasSeenView(viewId) : false

    let updatedProperties: string[] = []
    if (isUpdate && viewId) {
      const previousView = session.getPreviousViewState(viewId)
      if (previousView) {
        updatedProperties = this.detectViewChanges(previousView, event.view)
      }
    }

    if (viewId) {
      session.markViewAsSeen(viewId)
      session.saveViewState(viewId, event.view)
    }

    if (!isUpdate) {
      session.incrementCounter('view')
    }

    const additionalChanges = this.calculateTimeSpentChanges(session)

    if (isUpdate && updatedProperties.includes('is_active')) {
      additionalChanges.push({
        field: 'session.is_active',
        to: event.view.is_active ?? false,
      })
    }

    this.dispatchEvent({
      type: 'view',
      count: session.getCounter('view'),
      data: { 
        url: event.view?.url || '', 
        name: event.view?.name 
      },
      sessionChange: !isUpdate
        ? {
            field: 'view.count',
            to: session.getCounter('view'),
          }
        : undefined,
      additionalChanges,
      isUpdate,
      updatedProperties: updatedProperties.length > 0 ? updatedProperties : undefined,
    })
  }

  private static detectViewChanges(
    previousView: DatadogViewEvent['view'],
    currentView: DatadogViewEvent['view']
  ): string[] {
    const changes: string[] = []

    for (const key of VIEW_TRACKED_PROPERTIES) {
      const prevValue = previousView[key]
      const currValue = currentView[key]
      if (prevValue !== currValue && currValue !== undefined) {
        changes.push(key)
      }
    }

    return changes
  }
}

export class ResourceEventHandler extends BaseEventHandler {
  static handle(event: DatadogResourceEvent, session: MockSession): void {
    this.recordAndIncrement(session, 'resource')

    const shouldDispatch =
      session.getCounter('resource') === 1 ||
      session.getCounter('resource') - session.getLastResourceDispatch() >= RESOURCE_DISPATCH_THRESHOLD

    if (shouldDispatch) {
      const additionalChanges = this.calculateTimeSpentChanges(session)

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

export class ErrorEventHandler extends BaseEventHandler {
  static handle(event: DatadogErrorEvent, session: MockSession): void {
    this.recordAndIncrement(session, 'error')

    const additionalChanges = this.calculateTimeSpentChanges(session)

    this.dispatchEvent({
      type: 'error',
      data: { message: event.error?.message || 'Unknown error' },
      sessionChange: {
        field: 'error.count',
        to: session.getCounter('error'),
      },
      additionalChanges,
    })
  }
}

export class ActionEventHandler extends BaseEventHandler {
  static handle(event: DatadogActionEvent, session: MockSession): void {
    this.recordAndIncrement(session, 'action')

    const additionalChanges = this.calculateTimeSpentChanges(session)

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

export class LongTaskEventHandler extends BaseEventHandler {
  static handle(event: DatadogLongTaskEvent, session: MockSession): void {
    this.recordAndIncrement(session, 'long_task')

    const additionalChanges = this.calculateTimeSpentChanges(session)

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

export class VitalsEventHandler extends BaseEventHandler {
  static handle(event: DatadogVitalsEvent, session: MockSession): void {
    session.recordEventTime()

    const additionalChanges = this.calculateTimeSpentChanges(session)

    this.dispatchEvent({
      type: 'vitals',
      data: event,
      additionalChanges,
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