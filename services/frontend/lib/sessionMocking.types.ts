export type RumEventType = 'session' | 'view' | 'action' | 'error' | 'resource' | 'long_task' | 'vitals'
export type CountableEventType = 'view' | 'error' | 'action' | 'long_task' | 'frustration'

export interface ViewEventData {
  url: string
  name?: string
}

export interface ErrorEventData {
  message: string
}

export interface ActionEventData {
  name?: string
}

interface BaseRumEvent {
  id: string
  timestamp: string
}

export interface SessionRumEvent extends BaseRumEvent {
  type: 'session'
}

export interface ViewRumEvent extends BaseRumEvent {
  type: 'view'
  count: number
  data: ViewEventData
  viewId?: string
}

export interface ErrorRumEvent extends BaseRumEvent {
  type: 'error'
  data: ErrorEventData
  viewId?: string
}

export interface ActionRumEvent extends BaseRumEvent {
  type: 'action'
  data: ActionEventData
  viewId?: string
}

export interface ResourceRumEvent extends BaseRumEvent {
  type: 'resource'
  count: number
  viewId?: string
}

export interface LongTaskRumEvent extends BaseRumEvent {
  type: 'long_task'
  viewId?: string
}

export interface VitalsRumEvent extends BaseRumEvent {
  type: 'vitals'
  data: Record<string, unknown>
  viewId?: string
}

export type RumEvent =
  | SessionRumEvent
  | ViewRumEvent
  | ErrorRumEvent
  | ActionRumEvent
  | ResourceRumEvent
  | LongTaskRumEvent
  | VitalsRumEvent

export interface EventDispatchPayload {
  type: RumEventType
  count?: number
  data?: ViewEventData | ErrorEventData | ActionEventData | Record<string, unknown>
  viewId?: string
}

export interface DatadogViewEvent {
  type: 'view'
  view: {
    id: string
    url: string
    name?: string
    loading_time?: number
    cumulative_layout_shift?: number
    first_contentful_paint?: number
    largest_contentful_paint?: number
    first_input_delay?: number
    interaction_to_next_paint?: number
    time_spent?: number
    resource_count?: number
    error_count?: number
    action_count?: number
    long_task_count?: number
    is_active?: boolean
  }
}

export interface DatadogErrorEvent {
  type: 'error'
  error: {
    message: string
  }
  view?: {
    id?: string
  }
}

export interface DatadogActionEvent {
  type: 'action'
  action: {
    target?: {
      name?: string
    }
  }
  view?: {
    id?: string
  }
}

export interface DatadogResourceEvent {
  type: 'resource'
  view?: {
    id?: string
  }
}

export interface DatadogLongTaskEvent {
  type: 'long_task'
  view?: {
    id?: string
  }
}

export interface DatadogVitalsEvent {
  type: 'vitals'
  view?: {
    id?: string
  }
  [key: string]: unknown
}
