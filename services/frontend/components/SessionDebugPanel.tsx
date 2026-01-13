import { useEffect, useState, useRef } from 'react'
import type { RumEvent } from '@lib/sessionMocking.types'
import { datadogRum } from '@datadog/browser-rum'
import { MAX_EVENTS } from '@lib/sessionMocking.constants'
import EventCard from './EventCard'
import styles from './SessionDebugPanel.module.css'

export default function SessionDebugPanel() {
  const [events, setEvents] = useState<RumEvent[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [newestEventId, setNewestEventId] = useState<string>('')
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)

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
      setEvents(prev => [eventDetail, ...prev].slice(0, MAX_EVENTS))
    }

    window.addEventListener('rum-event', handleRumEvent as EventListener)
    
    return () => {
      window.removeEventListener('rum-event', handleRumEvent as EventListener)
    }
  }, [])

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
          <span className="sr-only">Real User Monitoring </span>
          RUM Events
          <span aria-live="polite" aria-atomic="true" className="sr-only">
            {events.length} events
          </span>
          <span aria-hidden="true"> ({events.length})</span>
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
        className={styles.content}
        role="log"
        aria-live="polite"
        aria-label="RUM event log"
      >
        {events.length === 0 ? (
          <div className={styles.empty} role="status">
            Waiting for RUM events...
          </div>
        ) : (
          events.map((event) => (
            <EventCard 
              key={event.id}
              event={event}
              isNewest={event.id === newestEventId}
            />
          ))
        )}
      </div>
    </aside>
  )
}

