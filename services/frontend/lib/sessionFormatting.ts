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

export function formatTimestamp(): string {
  return new Date().toLocaleTimeString()
}

export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
