import type {
  RumEvent,
  SessionRumEvent,
  ViewRumEvent,
  VitalsRumEvent,
} from './sessionMocking.types'

export interface ViewGroup {
  kind: 'view'
  view: ViewRumEvent
  children: RumEvent[]
}

export interface OperationNode {
  kind: 'operation'
  event: VitalsRumEvent
}

/**
 * Operations belong to the session rather than a view (one can start on one
 * view and finish on another), so they sit alongside views in arrival order.
 */
export type SessionChild = ViewGroup | OperationNode

export interface SessionTree {
  session: SessionRumEvent | null
  children: SessionChild[]
}

export function isOperationStep(event: RumEvent): event is VitalsRumEvent {
  return event.type === 'vital' && event.data.vitalType === 'operation_step'
}

// Datadog only surfaces an Operation once it succeeds, so the start step and
// failed end steps are left out of the tree.
function isSuccessfulOperation(event: VitalsRumEvent): boolean {
  return event.data.stepType === 'end' && !event.data.failureReason
}

export function buildSessionTree(events: RumEvent[]): SessionTree {
  const tree: SessionTree = { session: null, children: [] }
  const views: ViewGroup[] = []

  for (const event of events) {
    if (event.type === 'session') {
      tree.session = event
      continue
    }

    if (event.type === 'view') {
      const group: ViewGroup = { kind: 'view', view: event, children: [] }
      views.push(group)
      tree.children.push(group)
      continue
    }

    if (isOperationStep(event)) {
      if (isSuccessfulOperation(event)) {
        tree.children.push({ kind: 'operation', event })
      }
      continue
    }

    const targetGroup =
      views.find(group => group.view.viewId && group.view.viewId === event.viewId) ??
      views[views.length - 1]

    if (targetGroup) {
      targetGroup.children.push(event)
    }
  }

  return tree
}
