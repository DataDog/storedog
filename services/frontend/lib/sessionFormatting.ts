import { MILLISECONDS_TO_NANOSECONDS, TIME_SPENT_FIELDS } from './sessionMocking.constants'
import type { TimeSpentField } from './sessionMocking.constants'

export function formatUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash
  } catch {
    return url
  }
}

function isTimeSpentField(field: string): field is TimeSpentField {
  return TIME_SPENT_FIELDS.includes(field as TimeSpentField)
}

export function formatChangeValue(field: string, value: unknown): string | number {
  if (isTimeSpentField(field) && typeof value === 'number') {
    return Math.round(value * MILLISECONDS_TO_NANOSECONDS)
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }
  if (typeof value === 'number' || typeof value === 'string') {
    return value
  }
  return String(value)
}

export function truncateMessage(message: string, maxLength: number): string {
  return message.length <= maxLength ? message : message.substring(0, maxLength) + '...'
}

export function formatTimestamp(): string {
  return new Date().toLocaleTimeString()
}

export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
