import { useEffect, useRef } from 'react'
import ProfileButton from './ProfileButton'
import { BellIcon } from './Icons'

// Full-width navy top navbar shared across every dashboard.
//
// Props:
//   title         — string or node shown on the left (white, 16px, weight 600)
//   role          — passed to ProfileButton ('admin' | 'agency' | 'driver' | 'client')
//   onOpenProfile — opens the profile modal
//   showBell      — render the notification bell (default false)
//   notifCount    — unread count; shows the orange dot when > 0
//   bellOpen      — whether the notification dropdown is open (controlled)
//   onToggleBell  — toggles the dropdown
//   onCloseBell   — called on outside-click to close the dropdown
//   children      — notification dropdown panel, rendered below the bell when bellOpen
export default function TopBar({
  title,
  role = 'agency',
  onOpenProfile,
  showBell = false,
  notifCount = 0,
  bellOpen = false,
  onToggleBell,
  onCloseBell,
  children,
}) {
  const bellRef = useRef(null)

  // Close the notification dropdown when clicking outside the bell area
  useEffect(() => {
    if (!bellOpen) return
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) onCloseBell?.()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [bellOpen, onCloseBell])

  return (
    <div style={{
      height: 64,
      background: '#1a2e6e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Left — page title */}
      <div style={{
        color: '#fff',
        fontWeight: 600,
        fontSize: 16,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        whiteSpace: 'nowrap',
      }}>
        {title}
      </div>

      {/* Right — bell + profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {showBell && (
          <div ref={bellRef} style={{ position: 'relative' }}>
            <button
              onClick={onToggleBell}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                width: 40,
                height: 40,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                color: '#fff',
                transition: 'background .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              <BellIcon size={18}/>
              {notifCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  background: '#f97316',
                  borderRadius: '50%',
                  border: '2px solid #1a2e6e',
                }}/>
              )}
            </button>
            {bellOpen && children}
          </div>
        )}

        <ProfileButton role={role} variant="dark" onOpenProfile={onOpenProfile}/>
      </div>
    </div>
  )
}
