export const MAX_EVENTS = 100
export const MESSAGE_TRUNCATE_LENGTH = 60
export const RESOURCE_DISPATCH_THRESHOLD = 10
export const MILLISECONDS_TO_NANOSECONDS = 1000000

export const VIEW_TRACKED_PROPERTIES = [
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
  'is_active',
] as const

export const TIME_SPENT_FIELDS = ['session.time_spent', 'time_spent'] as const

export type TimeSpentField = typeof TIME_SPENT_FIELDS[number]
