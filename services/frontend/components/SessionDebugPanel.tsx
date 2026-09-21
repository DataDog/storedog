import { useEffect, useLayoutEffect, useState, useRef } from 'react'
import type { RumEvent } from '@lib/sessionMocking.types'
import { datadogRum } from '@datadog/browser-rum'
import { MAX_EVENTS } from '@lib/sessionMocking.constants'
import { getBufferedRumEvents } from '@lib/sessionMocking'
import { buildSessionTree } from '@lib/sessionEventTree'
import EventCard from './EventCard'
import styles from './SessionDebugPanel.module.css'

/** Mirrors the min-width / max-width on .container in SessionDebugPanel.module.css. */
const PANEL_MIN_WIDTH = 320
const PANEL_MAX_WIDTH = 720
const PANEL_DEFAULT_WIDTH = 420
const KEYBOARD_RESIZE_STEP = 16

const WIDTH_STORAGE_KEY = 'rum_panel_width'
const OPEN_STORAGE_KEY = 'rum_panel_open'

/** Matches the max-width: min(50vw, 720px) cap so the panel can't eat the store. */
function getMaxWidth(): number {
  if (typeof window === 'undefined') {
    return PANEL_MAX_WIDTH
  }
  return Math.min(window.innerWidth / 2, PANEL_MAX_WIDTH)
}

// The store reflows around the panel at every viewport width, so the cap always
// wins: on a viewport too narrow for the floor, holding the floor would eat the
// store's half rather than the panel's. Mirrors min-width: min(320px, 50vw).
function getMinWidth(): number {
  return Math.min(PANEL_MIN_WIDTH, getMaxWidth())
}

function clampWidth(width: number): number {
  return Math.max(getMinWidth(), Math.min(width, getMaxWidth()))
}

// localStorage throws rather than returning null in some privacy modes, and a
// debug panel is never worth breaking the store over.
function readStoredWidth(): number {
  try {
    const stored = Number(localStorage.getItem(WIDTH_STORAGE_KEY))
    return Number.isFinite(stored) && stored > 0 ? clampWidth(stored) : PANEL_DEFAULT_WIDTH
  } catch {
    return PANEL_DEFAULT_WIDTH
  }
}

function readStoredVisibility(): boolean {
  try {
    return localStorage.getItem(OPEN_STORAGE_KEY) !== 'false'
  } catch {
    return true
  }
}

export default function SessionDebugPanel() {
  const [events, setEvents] = useState<RumEvent[]>([])
  // Safe to read storage during init: _app only mounts this after an effect sets
  // showDebugPanel, so the panel never server-renders and can't mismatch.
  const [isVisible, setIsVisible] = useState(readStoredVisibility)
  const [width, setWidth] = useState(readStoredWidth)
  const [newestEventId, setNewestEventId] = useState<string>('')
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  // Holds the live width mid-drag, when width state is deliberately not updating.
  const widthRef = useRef(width)

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

  const applyWidth = (next: number) => {
    widthRef.current = next
    setWidth(next)
  }

  // Drag writes the CSS variable directly rather than going through state: one
  // React render per pointermove is what makes a resize handle feel sticky.
  const handleResizePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    document.documentElement.setAttribute('data-rum-resizing', '')
  }

  const handleResizePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return
    }
    // The panel is flush to the left edge, so the pointer's x is the width.
    const next = clampWidth(event.clientX)
    widthRef.current = next
    document.documentElement.style.setProperty('--rum-panel-width', `${next}px`)
  }

  const handleResizePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    document.documentElement.removeAttribute('data-rum-resizing')
    applyWidth(widthRef.current)
  }

  const handleResizeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const next =
      event.key === 'ArrowLeft'
        ? widthRef.current - KEYBOARD_RESIZE_STEP
        : event.key === 'ArrowRight'
        ? widthRef.current + KEYBOARD_RESIZE_STEP
        : event.key === 'Home'
        ? PANEL_MIN_WIDTH
        : event.key === 'End'
        ? getMaxWidth()
        : null

    if (next === null) {
      return
    }
    event.preventDefault()
    applyWidth(clampWidth(next))
  }

  // Single writer for the variable the store's body padding reads. Cleanup stops
  // an unmount from leaving the store permanently indented.
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--rum-panel-width', isVisible ? `${width}px` : '0px')

    return () => {
      root.style.removeProperty('--rum-panel-width')
    }
  }, [isVisible, width])

  useEffect(() => {
    try {
      localStorage.setItem(WIDTH_STORAGE_KEY, String(width))
      localStorage.setItem(OPEN_STORAGE_KEY, String(isVisible))
    } catch {
      // Persistence is a convenience; a blocked store shouldn't break the panel.
    }
  }, [width, isVisible])

  // The 50vw cap moves with the viewport, so a width that was legal before a
  // window resize may not be anymore.
  useEffect(() => {
    const handleWindowResize = () => {
      const clamped = clampWidth(widthRef.current)
      if (clamped !== widthRef.current) {
        applyWidth(clamped)
      }
    }

    window.addEventListener('resize', handleWindowResize)
    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

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

  // useLayoutEffect runs synchronously after DOM mutations (before paint), so the
  // new EventCard has already been laid out and scrollHeight reflects the true bottom.
  // Keying on events.length (rather than newestEventId) guarantees this fires for
  // every appended event, even if an event id were ever repeated.
  useLayoutEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [events.length])

  if (!isVisible) {
    return (
      <button 
        ref={toggleButtonRef}
        onClick={() => handleToggleVisibility(true)} 
        className={styles.toggleBtn}
        aria-label="Show live RUM events panel"
        aria-expanded="false"
      >
        {/* Short label because the tab renders vertically; the aria-label above
            carries the full description for screen readers. */}
        RUM Events
      </button>
    )
  }

  const { session, views } = buildSessionTree(events)

  return (
    <aside 
      ref={panelRef}
      className={styles.container}
      role="complementary"
      aria-label="Live RUM Events Panel"
      tabIndex={-1}
    >
      <div className={styles.header}>
        <h2 id="rum-panel-title" className={styles.title}>
          <span className={styles.srOnly}>Real User Monitoring </span>
          RUM Events
        </h2>
        <div className={styles.headerButtons}>
          <button 
            onClick={() => handleToggleVisibility(false)} 
            className={styles.closeBtn}
            aria-label="Hide live RUM events panel"
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

      <div
        className={styles.resizeHandle}
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        onPointerCancel={handleResizePointerUp}
        onKeyDown={handleResizeKeyDown}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize RUM events panel"
        aria-valuenow={width}
        aria-valuemin={PANEL_MIN_WIDTH}
        aria-valuemax={PANEL_MAX_WIDTH}
        tabIndex={0}
      />
    </aside>
  )
}

