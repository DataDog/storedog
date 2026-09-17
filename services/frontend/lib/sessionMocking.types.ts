export type RumEventType = 'session' | 'view' | 'action' | 'error' | 'resource' | 'long_task' | 'vital'
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

export interface ResourceEventData {
  url: string
}

export interface VitalEventData {
  name?: string
  /** 'duration' for custom vitals, 'operation_step' for Operations */
  vitalType?: string
  description?: string
  /** Nanoseconds, as sent on the wire. Only set on duration vitals. */
  duration?: number
  /** Operation steps only */
  stepType?: string
  failureReason?: string
  operationKey?: string
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
  data: ResourceEventData
  viewId?: string
}

export interface LongTaskRumEvent extends BaseRumEvent {
  type: 'long_task'
  viewId?: string
}

export interface VitalsRumEvent extends BaseRumEvent {
  type: 'vital'
  data: VitalEventData
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
  data?:
    | ViewEventData
    | ErrorEventData
    | ActionEventData
    | ResourceEventData
    | VitalEventData
    | Record<string, unknown>
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
  resource: {
    url: string
  }
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
  type: 'vital'
  /** Field names here are the wire format, hence the snake_case. */
  vital?: {
    id?: string
    name?: string
    type?: string
    description?: string
    duration?: number
    step_type?: string
    operation_key?: string
    failure_reason?: string
  }
  view?: {
    id?: string
  }
  [key: string]: unknown
}
