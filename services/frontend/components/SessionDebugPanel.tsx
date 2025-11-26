import { useEffect, useState } from 'react'

interface Activity {
  timestamp: string
  type: string
  count?: number
  data?: any
  sessionChange?: {
    field: string
    to: any
  }
  additionalChanges?: Array<{
    field: string
    to: any
  }>
}

// Event type color mapping (matches interactive app)
const EVENT_COLORS: Record<string, { bg: string, text: string }> = {
  session: { bg: 'rgb(99, 44, 166)', text: '#ffffff' },
  view: { bg: 'rgb(0, 107, 194)', text: '#ffffff' },
  action: { bg: 'rgb(147, 100, 205)', text: '#ffffff' },
  error: { bg: '#ef4444', text: '#ffffff' },
  resource: { bg: '#60a5fa', text: '#ffffff' },
  long_task: { bg: '#fcc028', text: '#000000' },
  vitals: { bg: '#06b6d4', text: '#ffffff' }
}

function getEventTypeColor(type: string) {
  return EVENT_COLORS[type] || { bg: '#64748b', text: '#ffffff' }
}

export default function SessionDebugPanel() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [newestActivityId, setNewestActivityId] = useState<number>(0)

  useEffect(() => {
    console.log('[SessionDebugPanel] Component mounted, setting up event listener')
    
    // Listen for RUM events
    const handleRumEvent = (event: any) => {
      const { type, count, data, sessionChange, additionalChanges } = event.detail
      
      const activityId = Date.now()
      const newActivity: Activity = {
        timestamp: new Date().toLocaleTimeString(),
        type,
        count,
        data,
        sessionChange,
        additionalChanges
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
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          padding: '10px 15px',
          backgroundColor: '#6C2BD9',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 10000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        Show Session Debug
      </button>
    )
  }

  return (
    <>
      <style>{`
        @keyframes slideInFade {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .new-activity {
          animation: slideInFade 0.3s ease-out;
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '400px',
          maxHeight: '500px',
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 10000,
          fontFamily: 'monospace',
          fontSize: '12px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#6C2BD9',
          color: 'white',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <strong>RUM Activity ({activities.length})</strong>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0 4px'
          }}
        >
          ×
        </button>
      </div>
      
      <div
        style={{
          padding: '12px',
          overflowY: 'auto',
          flexGrow: 1
        }}
      >
        {activities.length === 0 ? (
          <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
            Waiting for RUM activity...
          </div>
        ) : (
          activities.map((activity, idx) => {
            const colors = getEventTypeColor(activity.type)
            const isNewest = idx === 0
            
            return (
              <div
                key={idx}
                className={isNewest ? 'new-activity' : ''}
                style={{
                  padding: '10px',
                  marginBottom: '10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderLeft: `4px solid ${colors.bg}`,
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '6px'
                }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      backgroundColor: colors.bg,
                      color: colors.text
                    }}
                  >
                    {activity.type}
                  </span>
                  {activity.count && (
                    <span style={{ fontSize: '11px', color: '#718096', fontWeight: 600 }}>
                      {activity.count} total
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: '#718096', marginLeft: 'auto' }}>
                    {activity.timestamp}
                  </span>
                </div>
                
                {activity.data?.message && (
                  <div style={{ color: '#2d3748', fontSize: '12px', marginBottom: '4px' }}>
                    {activity.data.message.length > 60 
                      ? activity.data.message.substring(0, 60) + '...' 
                      : activity.data.message}
                  </div>
                )}
                {activity.data?.url_path && (
                  <div style={{ color: '#2d3748', fontSize: '12px', marginBottom: '4px', fontFamily: 'monospace' }}>
                    {activity.data.url_path}
                  </div>
                )}
                {activity.data?.name && (
                  <div style={{ 
                    color: '#2d3748', 
                    fontSize: '12px', 
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {activity.data.name}
                  </div>
                )}
                
                {(activity.sessionChange || activity.additionalChanges) && (
                  <div style={{ 
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    {activity.sessionChange && (
                      <span style={{ 
                        display: 'inline-block',
                        fontSize: '11px',
                        color: '#4a5568',
                        fontWeight: 600,
                        fontFamily: 'monospace',
                        backgroundColor: '#f3f4f6',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        marginRight: '6px',
                        marginBottom: '4px'
                      }}>
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
                        <span
                          key={idx}
                          style={{ 
                            display: 'inline-block',
                            fontSize: '11px',
                            color: '#4a5568',
                            fontWeight: 600,
                            fontFamily: 'monospace',
                            backgroundColor: '#f3f4f6',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            marginRight: '6px',
                            marginBottom: '4px'
                          }}
                        >
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
    </>
  )
}

