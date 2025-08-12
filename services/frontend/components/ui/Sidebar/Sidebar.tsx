import cn from 'clsx'
import s from './Sidebar.module.css'
import { useEffect, useRef } from 'react'
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'
interface SidebarProps {
  children: any
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ children, onClose }) => {
  const sidebarRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const contentRef = useRef() as React.MutableRefObject<HTMLDivElement>

  const onKeyDownSidebar = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.code === 'Escape') {
      onClose()
    }
  }

  const focusFirstElement = () => {
    // Use setTimeout to ensure DOM is fully rendered before focusing
    const focusTimeout = setTimeout(() => {
      if (!sidebarRef.current) return

      // Priority order for focus targets:
      // 1. Element with first-focus-target ID (specific focus intent)
      // 2. First input field (for forms)
      // 3. First button
      // 4. First link
      // 5. Sidebar container
      const priorityTarget = sidebarRef.current.querySelector('#first-focus-target')
      const firstInput = sidebarRef.current.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled])')
      const firstButton = sidebarRef.current.querySelector('button:not([disabled])')
      const firstLink = sidebarRef.current.querySelector('a[href]')
      
      const firstFocusable = priorityTarget || firstInput || firstButton || firstLink
      
      if (firstFocusable) {
        (firstFocusable as HTMLElement).focus()
      } else {
        // Fallback to focusing the sidebar container
        sidebarRef.current.focus()
      }
    }, 100)

    return () => clearTimeout(focusTimeout)
  }

  useEffect(() => {
    const cleanup = focusFirstElement()

    const contentElement = contentRef.current
    if (contentElement) {
      disableBodyScroll(contentElement, { reserveScrollBarGap: true })
    }

    return () => {
      cleanup()
      clearAllBodyScrollLocks()
    }
  }, [])

  // Re-focus when sidebar content changes (different views)
  useEffect(() => {
    focusFirstElement()
  }, [children])

  return (
    <div
      className={cn(s.root)}
      ref={sidebarRef}
      onKeyDown={onKeyDownSidebar}
      tabIndex={1}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className={s.backdrop} onClick={onClose} />
        <section className="absolute inset-y-0 right-0 w-full md:w-auto max-w-full flex outline-none md:pl-10">
          <div className="h-full w-full md:w-screen md:max-w-md">
            <div className={s.sidebar} ref={contentRef}>
              {children}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Sidebar
