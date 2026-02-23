import type { RumEvent } from '@lib/sessionMocking.types'
import { formatUrl, formatChangeValue, truncateMessage } from '@lib/sessionFormatting'
import { MESSAGE_TRUNCATE_LENGTH } from '@lib/sessionMocking.constants'
import styles from './SessionDebugPanel.module.css'

interface EventCardProps {
  event: RumEvent
  isNewest: boolean
}

interface DisplayChange {
  field: string
  value: string | number
  ariaLabel: string
}

interface BaseEventDisplay {
  type: string
  counterChange: DisplayChange | null
  attributeChanges: DisplayChange[]
}

interface ViewEventDisplay extends BaseEventDisplay {
  type: 'view'
  url: string
  count: number
  name: string | null
  isUpdate: boolean
  updatePropertiesText: string | null
}

interface ErrorEventDisplay extends BaseEventDisplay {
  type: 'error'
  message: string
}

interface ActionEventDisplay extends BaseEventDisplay {
  type: 'action'
  name: string | null
}

interface ResourceEventDisplay extends BaseEventDisplay {
  type: 'resource'
  count: number
}

interface LongTaskEventDisplay extends BaseEventDisplay {
  type: 'long_task'
}

interface VitalsEventDisplay extends BaseEventDisplay {
  type: 'vitals'
}

type EventDisplayData = 
  | ViewEventDisplay 
  | ErrorEventDisplay 
  | ActionEventDisplay 
  | ResourceEventDisplay 
  | LongTaskEventDisplay 
  | VitalsEventDisplay

function getEventLabel(data: EventDisplayData): string {
  if (data.type === 'view' && data.isUpdate) {
    return 'view event updated'
  }
  return `${data.type} event`
}

function getBadgeText(data: EventDisplayData): string {
  if (data.type === 'view' && data.isUpdate) {
    return 'view (updated)'
  }
  return data.type
}

function getBadgeAriaLabel(data: EventDisplayData): string {
  if (data.type === 'view' && data.isUpdate) {
    return 'Event type: view, updated'
  }
  return `Event type: ${data.type}`
}

function prepareChanges(event: RumEvent) {
  const counterChange = event.sessionChange
    ? {
        field: event.sessionChange.field,
        value: formatChangeValue(event.sessionChange.field, event.sessionChange.to),
        ariaLabel: `Session ${event.sessionChange.field} changed to ${formatChangeValue(event.sessionChange.field, event.sessionChange.to)}`,
      }
    : null
  
  const attributeChanges = event.additionalChanges?.map(change => ({
    field: change.field,
    value: formatChangeValue(change.field, change.to),
    ariaLabel: `Attribute ${change.field} changed to ${formatChangeValue(change.field, change.to)}`,
  })) ?? []
  
  return { counterChange, attributeChanges }
}

function useEventDisplayData(event: RumEvent): EventDisplayData {
  const changes = prepareChanges(event)
  
  switch (event.type) {
    case 'view':
      return {
        type: 'view',
        url: formatUrl(event.data.url),
        count: event.count,
        name: event.data.name ?? null,
        isUpdate: event.isUpdate ?? false,
        updatePropertiesText: event.isUpdate && event.updatedProperties?.length
          ? event.updatedProperties.join(', ')
          : null,
        ...changes,
      }
    
    case 'error':
      return {
        type: 'error',
        message: truncateMessage(event.data.message, MESSAGE_TRUNCATE_LENGTH),
        ...changes,
      }
    
    case 'action':
      return {
        type: 'action',
        name: event.data.name ?? null,
        ...changes,
      }
    
    case 'resource':
      return {
        type: 'resource',
        count: event.count,
        ...changes,
      }
    
    case 'long_task':
      return {
        type: 'long_task',
        ...changes,
      }
    
    case 'vitals':
      return {
        type: 'vitals',
        ...changes,
      }
  }
}

function ChangesList({ counterChange, attributeChanges }: { 
  counterChange: DisplayChange | null
  attributeChanges: DisplayChange[]
}) {
  if (!counterChange && attributeChanges.length === 0) return null
  
  return (
    <div className={styles.changes} role="list" aria-label="Session attribute changes">
      {counterChange && (
        <span className={styles.changeBadge} role="listitem" aria-label={counterChange.ariaLabel}>
          <span aria-hidden="true">@session.{counterChange.field}:{counterChange.value}</span>
        </span>
      )}
      {attributeChanges.map((change, idx) => (
        <span key={`${change.field}-${idx}`} className={styles.changeBadge} role="listitem" aria-label={change.ariaLabel}>
          <span aria-hidden="true">@{change.field}:{change.value}</span>
        </span>
      ))}
    </div>
  )
}

interface CardProps {
  type: string
  isNewest: boolean
  timestamp: string
  badgeText: string
  badgeAriaLabel: string
  eventLabel: string
  headerContent?: React.ReactNode
  children?: React.ReactNode
  counterChange: DisplayChange | null
  attributeChanges: DisplayChange[]
}

function Card({ type, isNewest, timestamp, badgeText, badgeAriaLabel, eventLabel, headerContent, children, counterChange, attributeChanges }: CardProps) {
  return (
    <article 
      className={`${styles.card} ${isNewest ? styles.newEvent : ''}`} 
      data-event-type={type} 
      aria-label={eventLabel}
    >
      <div className={styles.cardHeader}>
        <span className={styles.badge} data-event-type={type} role="status" aria-label={badgeAriaLabel}>
          <span aria-hidden="true">{badgeText}</span>
        </span>
        {headerContent}
        <time className={styles.timestamp}>
          <span className={styles.srOnly}>Timestamp: </span>
          {timestamp}
        </time>
      </div>
      {children}
      <ChangesList counterChange={counterChange} attributeChanges={attributeChanges} />
    </article>
  )
}

export default function EventCard({ event, isNewest }: EventCardProps) {
  const data = useEventDisplayData(event)
  
  const commonProps = {
    type: data.type,
    isNewest,
    timestamp: event.timestamp,
    badgeText: getBadgeText(data),
    badgeAriaLabel: getBadgeAriaLabel(data),
    eventLabel: getEventLabel(data),
    counterChange: data.counterChange,
    attributeChanges: data.attributeChanges,
  }
  
  switch (data.type) {
    case 'view':
      return (
        <Card 
          {...commonProps}
          headerContent={<span className={styles.url}>{formatUrl(data.url)}</span>}
        >
          {data.name && <div className={styles.name}>{data.name}</div>}
          {data.updatePropertiesText && (
            <div className={styles.updateInfo}>Updated: {data.updatePropertiesText}</div>
          )}
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
        <Card {...commonProps}>
          {data.name && <div className={styles.name}>{data.name}</div>}
        </Card>
      )
    
    case 'resource':
      return (
        <Card 
          {...commonProps}
          headerContent={<span className={styles.count}>{data.count} total</span>}
        />
      )
    
    case 'long_task':
    case 'vitals':
      return <Card {...commonProps} />
  }
}
