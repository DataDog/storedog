export type RumEventType = 'session' | 'view' | 'action' | 'error' | 'resource' | 'long_task' | 'vitals'
export type CountableEventType = 'view' | 'error' | 'action' | 'resource' | 'long_task' | 'frustration'

export type SessionChangeField = 'view.count' | 'error.count' | 'action.count' | 'resource.count' | 'long_task.count'
export type AttributeChangeField = 'session.time_spent' | 'time_spent' | string

export interface SessionChange {
  field: SessionChangeField
  to: number
}

export interface AttributeChange {
  field: AttributeChangeField
  to: number | string | boolean | object
}

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
  sessionChange?: SessionChange
  additionalChanges?: AttributeChange[]
}

export interface ViewRumEvent extends BaseRumEvent {
  type: 'view'
  count: number
  data: ViewEventData
  isUpdate?: boolean
  updatedProperties?: string[]
}

export interface ErrorRumEvent extends BaseRumEvent {
  type: 'error'
  data: ErrorEventData
}

export interface ActionRumEvent extends BaseRumEvent {
  type: 'action'
  data: ActionEventData
}

export interface ResourceRumEvent extends BaseRumEvent {
  type: 'resource'
  count: number
}

export interface LongTaskRumEvent extends BaseRumEvent {
  type: 'long_task'
}

export interface VitalsRumEvent extends BaseRumEvent {
  type: 'vitals'
  data: Record<string, unknown>
}

export type RumEvent = 
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
  sessionChange?: SessionChange
  additionalChanges?: AttributeChange[]
  isUpdate?: boolean
  updatedProperties?: string[]
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
}

export interface DatadogActionEvent {
  type: 'action'
  action: {
    target?: {
      name?: string
    }
  }
}

export interface DatadogResourceEvent {
  type: 'resource'
}

export interface DatadogLongTaskEvent {
  type: 'long_task'
}

export interface DatadogVitalsEvent {
  type: 'vitals'
  [key: string]: unknown
}
