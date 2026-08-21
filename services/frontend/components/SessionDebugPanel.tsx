import { useEffect, useState, useRef } from 'react'
import type { ResourceRumEvent, RumEvent } from '@lib/sessionMocking.types'
import { datadogRum } from '@datadog/browser-rum'
import { MAX_EVENTS } from '@lib/sessionMocking.constants'
import { getBufferedRumEvents } from '@lib/sessionMocking'
import { buildSessionTree } from '@lib/sessionEventTree'
import EventCard from './EventCard'
import styles from './SessionDebugPanel.module.css'

export default function SessionDebugPanel() {
  const [events, setEvents] = useState<RumEvent[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [newestEventId, setNewestEventId] = useState<string>('')
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleStopSession = () => {
    datadogRum.stopSession()
  }

  const handleToggleVisibility = (show: boolean) => {
    setIsVisible(show)
    setTimeout(() => {
      if (show && panelRef.current) {
        panelRef.current.focus()
      } else if (!show && toggleButtonRef.current) {
        toggleButtonRef.current.focus()
      }
    }, 0)
  }

  useEffect(() => {
    const handleRumEvent = (domEvent: CustomEvent) => {
      const eventDetail = domEvent.detail as RumEvent

      setNewestEventId(eventDetail.id)
      setEvents(prev => [...prev, eventDetail].slice(-MAX_EVENTS))
    }

    window.addEventListener('rum-event', handleRumEvent as EventListener)

    // Backfill events dispatched before this panel mounted (e.g. session-start,
    // first view) so they aren't missed while the listener wasn't attached yet.
    const buffered = getBufferedRumEvents()
    if (buffered.length > 0) {
      setNewestEventId(buffered[buffered.length - 1].id)
      setEvents(prev => [...buffered, ...prev].slice(-MAX_EVENTS))
    }

    return () => {
      window.removeEventListener('rum-event', handleRumEvent as EventListener)
    }
  }, [])

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [newestEventId])

  if (!isVisible) {
    return (
      <button 
        ref={toggleButtonRef}
        onClick={() => handleToggleVisibility(true)} 
        className={styles.toggleBtn}
        aria-label="Show RUM event debug panel"
        aria-expanded="false"
      >
        Show Session Debug
      </button>
    )
  }

  const totalEventCount = (() => {
    const nonResourceCount = events.filter(e => e.type !== 'resource').length

    const latestResourceCountByView = new Map<string, number>()
    events
      .filter((e): e is ResourceRumEvent => e.type === 'resource')
      .forEach(e => {
        const key = e.viewId ?? ''
        latestResourceCountByView.set(key, Math.max(latestResourceCountByView.get(key) ?? 0, e.count))
      })
    const totalResourceCount = [...latestResourceCountByView.values()].reduce((sum, count) => sum + count, 0)

    return nonResourceCount + totalResourceCount
  })()

  const { session, views } = buildSessionTree(events)

  return (
    <aside 
      ref={panelRef}
      className={styles.container}
      role="complementary"
      aria-label="RUM Event Debug Panel"
      tabIndex={-1}
    >
      <div className={styles.header}>
        <h2 id="rum-panel-title" className={styles.title}>
          <span className={styles.srOnly}>Real User Monitoring </span>
          RUM Events
          <span aria-live="polite" aria-atomic="true" className={styles.srOnly}>
            {totalEventCount} events
          </span>
          <span aria-hidden="true"> ({totalEventCount})</span>
        </h2>
        <div className={styles.headerButtons}>
          <button 
            onClick={handleStopSession} 
            className={styles.stopBtn}
            aria-label="Stop current RUM session"
          >
            Stop Session
          </button>
          <button 
            onClick={() => handleToggleVisibility(false)} 
            className={styles.closeBtn}
            aria-label="Hide RUM event debug panel"
            aria-expanded="true"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    
      <div
        ref={contentRef}
        className={styles.content}
        role="log"
        aria-live="polite"
        aria-label="RUM event log"
      >
        {!session ? (
          <div className={styles.empty} role="status">
            Waiting for RUM events...
          </div>
        ) : (
          <EventCard event={session} isNewest={session.id === newestEventId}>
            {views.map(({ view, children }) => (
              <EventCard key={view.id} event={view} isNewest={view.id === newestEventId}>
                {children.map(child => (
                  <EventCard
                    key={child.id}
                    event={child}
                    isNewest={child.id === newestEventId}
                  />
                ))}
              </EventCard>
            ))}
          </EventCard>
        )}
      </div>
    </aside>
  )
}

