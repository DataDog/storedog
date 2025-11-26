import { useEffect, useState } from 'react'
import { Activity, getEventTypeColor } from '@lib/sessionMocking'
import styles from './SessionDebugPanel.module.css'

export default function SessionDebugPanel() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [newestActivityId, setNewestActivityId] = useState<number>(0)

  useEffect(() => {
    console.log('[SessionDebugPanel] Component mounted, setting up event listener')
    
    // Listen for RUM events
    const handleRumEvent = (event: any) => {
      const { type, count, data, sessionChange, additionalChanges, isUpdate } = event.detail
      
      const activityId = Date.now()
      const newActivity: Activity = {
        timestamp: new Date().toLocaleTimeString(),
        type,
        count,
        data,
        sessionChange,
        additionalChanges,
        isUpdate
      }
      
      setNewestActivityId(activityId)
      setActivities(prev => [newActivity, ...prev].slice(0, 100))
    }

    window.addEventListener('rum-event', handleRumEvent)
    console.log('[SessionDebugPanel] Event listener added')
    
    return () => {
      console.log('[SessionDebugPanel] Component unmounting, removing event listener')
      window.removeEventListener('rum-event', handleRumEvent)
    }
  }, [])

  if (!isVisible) {
    return (
      <button onClick={() => setIsVisible(true)} className={styles.toggleBtn}>
        Show Session Debug
      </button>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <strong>RUM Activity ({activities.length})</strong>
        <button onClick={() => setIsVisible(false)} className={styles.closeBtn}>
          ×
        </button>
      </div>
    
      <div className={styles.content}>
        {activities.length === 0 ? (
          <div className={styles.empty}>
            Waiting for RUM activity...
          </div>
        ) : (
          activities.map((activity, idx) => {
            const colors = getEventTypeColor(activity.type)
            const isNewest = idx === 0
            
            return (
              <div
                key={idx}
                className={`${styles.card} ${isNewest ? styles.newActivity : ''}`}
                style={{ borderLeft: `4px solid ${colors.bg}` }}
              >
                <div className={styles.cardHeader}>
                  <span
                    className={styles.badge}
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text
                    }}
                  >
                    {activity.type}{activity.type === 'view' && activity.isUpdate ? ' (updated)' : ''}
                  </span>
                  {activity.type === 'view' && activity.data?.url ? (
                    <span className={styles.url}>
                      {(() => {
                        try {
                          const url = new URL(activity.data.url)
                          return url.pathname + url.search + url.hash
                        } catch {
                          return activity.data.url
                        }
                      })()}
                    </span>
                  ) : activity.count ? (
                    <span className={styles.count}>
                      {activity.count} total
                    </span>
                  ) : null}
                  <span className={styles.timestamp}>
                    {activity.timestamp}
                  </span>
                </div>
                
                {activity.data?.message && (
                  <div className={styles.message}>
                    {activity.data.message.length > 60 
                      ? activity.data.message.substring(0, 60) + '...' 
                      : activity.data.message}
                  </div>
                )}
                {activity.data?.name && (
                  <div className={styles.name}>
                    {activity.data.name}
                  </div>
                )}
                
                {activity.isUpdate && activity.updatedProperties && activity.updatedProperties.length > 0 && (
                  <div className={styles.updateInfo}>
                    Updated: {activity.updatedProperties.join(', ')}
                  </div>
                )}
                
                {(activity.sessionChange || activity.additionalChanges) && (
                  <div className={styles.changes}>
                    {activity.sessionChange && (
                      <span className={styles.changeBadge}>
                        @session.{activity.sessionChange.field}:{typeof activity.sessionChange.to === 'object' ? JSON.stringify(activity.sessionChange.to) : activity.sessionChange.to}
                      </span>
                    )}
                    {activity.additionalChanges?.map((change, idx) => {
                      // Format values for better readability
                      let displayValue
                      if (change.field === 'session.time_spent' || change.field === 'time_spent') {
                        // Show in nanoseconds (raw value from performance.now() is milliseconds, multiply by 1M)
                        displayValue = Math.round(change.to * 1000000)
                      } else if (typeof change.to === 'object') {
                        displayValue = JSON.stringify(change.to)
                      } else {
                        displayValue = change.to
                      }
                      
                      return (
                        <span key={idx} className={styles.changeBadge}>
                          @{change.field}:{displayValue}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

