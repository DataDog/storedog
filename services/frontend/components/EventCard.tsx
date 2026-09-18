import type { RumEvent } from '@lib/sessionMocking.types'
import { formatUrl, truncateMessage, formatVitalDuration } from '@lib/sessionFormatting'
import { MESSAGE_TRUNCATE_LENGTH } from '@lib/sessionMocking.constants'
import styles from './SessionDebugPanel.module.css'

interface EventCardProps {
  event: RumEvent
  isNewest: boolean
  children?: React.ReactNode
}

interface SessionEventDisplay {
  type: 'session'
}

interface ViewEventDisplay {
  type: 'view'
  url: string
  name: string | null
}

interface ErrorEventDisplay {
  type: 'error'
  message: string
}

interface ActionEventDisplay {
  type: 'action'
  name: string | null
}

interface ResourceEventDisplay {
  type: 'resource'
  url: string
}

interface LongTaskEventDisplay {
  type: 'long_task'
}

interface VitalEventDisplay {
  type: 'vital'
  /** Operation steps are vital events, but read as "operation" on the card. */
  label: 'vital' | 'operation'
  name: string | null
  /** Duration for custom vitals, step outcome for Operation steps. */
  detail: string | null
  /** Distinguishes an instance of a vital, e.g. which ad slot. */
  description: string | null
  status: 'start' | 'success' | 'failed' | null
}

type EventDisplayData =
  | SessionEventDisplay
  | ViewEventDisplay
  | ErrorEventDisplay
  | ActionEventDisplay
  | ResourceEventDisplay
  | LongTaskEventDisplay
  | VitalEventDisplay

function useEventDisplayData(event: RumEvent): EventDisplayData {
  switch (event.type) {
    case 'session':
      return {
        type: 'session',
      }

    case 'view':
      return {
        type: 'view',
        url: formatUrl(event.data.url),
        name: event.data.name ?? null,
      }

    case 'error':
      return {
        type: 'error',
        message: truncateMessage(event.data.message, MESSAGE_TRUNCATE_LENGTH),
      }

    case 'action':
      return {
        type: 'action',
        name: event.data.name ?? null,
      }

    case 'resource':
      return {
        type: 'resource',
        url: formatUrl(event.data.url),
      }

    case 'long_task':
      return {
        type: 'long_task',
      }

    case 'vital': {
      const { name, vitalType, duration, description, stepType, failureReason } = event.data

      // Operations arrive as two vital events (a start step and an end step)
      // rather than one event carrying a duration.
      const isOperationStep = vitalType === 'operation_step'
      const status = !isOperationStep
        ? null
        : stepType === 'start'
        ? 'start'
        : failureReason
        ? 'failed'
        : 'success'

      const detail = isOperationStep
        ? failureReason
          ? `${status} · ${failureReason}`
          : status
        : typeof duration === 'number'
        ? formatVitalDuration(duration)
        : null

      return {
        type: 'vital',
        label: isOperationStep ? 'operation' : 'vital',
        name: name ?? null,
        detail: detail ?? null,
        // The ad vital sets description to the slot, which duplicates the name
        // on screen for other vitals — only show it when it adds something.
        description: description && description !== name ? description : null,
        status,
      }
    }
  }
}

interface CardProps {
  type: string
  isNewest: boolean
  timestamp: string
  headerContent?: React.ReactNode
  children?: React.ReactNode
}

function Card({ type, isNewest, timestamp, headerContent, children }: CardProps) {
  return (
    <article
      className={`${styles.card} ${isNewest ? styles.newEvent : ''}`}
      data-event-type={type}
      aria-label={`${type} event`}
    >
      <div className={styles.cardHeader}>
        <span className={styles.badge} data-event-type={type} role="status" aria-label={`Event type: ${type}`}>
          <span aria-hidden="true">{type}</span>
        </span>
        {headerContent}
        <time className={styles.timestamp}>
          <span className={styles.srOnly}>Timestamp: </span>
          {timestamp}
        </time>
      </div>
      {children}
    </article>
  )
}

export default function EventCard({ event, isNewest, children }: EventCardProps) {
  const data = useEventDisplayData(event)

  const commonProps = {
    type: data.type,
    isNewest,
    timestamp: event.timestamp,
  }

  switch (data.type) {
    case 'session':
      return (
        <Card {...commonProps}>
          {children && <div className={styles.nestedContent}>{children}</div>}
        </Card>
      )

    case 'view':
      return (
        <Card
          {...commonProps}
          headerContent={<span className={styles.url}>{data.url}</span>}
        >
          {data.name && <div className={styles.name}>{data.name}</div>}
          {children && <div className={styles.nestedContent}>{children}</div>}
        </Card>
      )

    case 'error':
      return (
        <Card {...commonProps}>
          <div className={styles.message}>{data.message}</div>
        </Card>
      )

    case 'action':
      return (
        <Card {...commonProps}
        headerContent={<span className={styles.name}>{data.name ? `Click on ${data.name}` : data.name}</span>}
        />
      )

    case 'resource':
      return (
        <Card
          {...commonProps}
          headerContent={<span className={styles.url}>{data.url}</span>}
        />
      )

    case 'long_task':
      return <Card {...commonProps} />

    case 'vital':
      return (
        <Card
          {...commonProps}
          type={data.label}
          headerContent={
            <>
              {data.name && <span className={styles.vitalName}>{data.name}</span>}
              {data.detail && (
                <span className={styles.vitalDetail} data-vital-status={data.status}>
                  {data.detail}
                </span>
              )}
            </>
          }
        >
          {data.description && (
            <div className={styles.name}>Description: {data.description}</div>
          )}
        </Card>
      )
  }
}
