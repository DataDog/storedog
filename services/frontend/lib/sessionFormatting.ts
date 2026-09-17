export function formatUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash
  } catch {
    return url
  }
}

export function truncateMessage(message: string, maxLength: number): string {
  return message.length <= maxLength ? message : message.substring(0, maxLength) + '...'
}

/** RUM sends vital durations in nanoseconds. */
export function formatVitalDuration(nanoseconds: number): string {
  const ms = nanoseconds / 1e6
  if (ms < 1) {
    return `${Math.round(ms * 1000)} µs`
  }
  if (ms < 1000) {
    return `${Math.round(ms)} ms`
  }
  return `${(ms / 1000).toFixed(2)} s`
}

export function formatTimestamp(): string {
  return new Date().toLocaleTimeString()
}

export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
