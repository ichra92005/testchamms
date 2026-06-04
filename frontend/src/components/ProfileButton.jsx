import { useState, useEffect, useRef } from 'react'
import { UserIcon, LogoutIcon } from './Icons'

// ── Inline chevron (not in Icons.jsx) ────────────────────────
function ChevronDown({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

// ── Role config ───────────────────────────────────────────────
const ROLE_CFG = {
  admin:  { color: '#7c3aed', bg: '#fdf4ff', label: 'Admin'  },
  agency: { color: '#1d4ed8', bg: '#eff6ff', label: 'Agent'  },
  driver: { color: '#166534', bg: '#f0fdf4', label: 'Driver' },
  client: { color: '#c2410c', bg: '#fff7ed', label: 'Client' },
}

function initials(name) {
  const parts = (name || '').trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (name || '?').slice(0, 2).toUpperCase()
}

// ── Avatar circle ─────────────────────────────────────────────
function Avatar({ name, color, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      fontSize: size <= 32 ? '.68rem' : '.78rem',
      fontWeight: 800,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, letterSpacing: '.04em',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {initials(name)}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
// variant: "light" (staff dashboards — white topbar)
//          "dark"  (client dashboard  — navy navbar)
export default function ProfileButton({ onOpenProfile, variant = 'light' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const isStaff = !!localStorage.getItem('staff_token')
  const name  = isStaff
    ? (localStorage.getItem('staff_name')  || 'User')
    : (localStorage.getItem('client_name') || 'User')
  const email = isStaff
    ? (localStorage.getItem('staff_email')  || '')
    : (localStorage.getItem('client_email') || '')
  const role  = isStaff
    ? (localStorage.getItem('staff_role') || 'agency')
    : 'client'

  const cfg = ROLE_CFG[role] || ROLE_CFG.client

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleProfile = () => { setOpen(false); onOpenProfile?.() }
  const handleLogout  = () => { localStorage.clear(); window.location.href = '/' }

  // Style tokens that differ between variants
  const isDark = variant === 'dark'
  const btn = isDark ? {
    background:  open ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.1)',
    border:      '1px solid rgba(255,255,255,.22)',
    nameColor:   '#fff',
    roleColor:   'rgba(255,255,255,.75)',
    chevronColor:'rgba(255,255,255,.65)',
    hoverBg:     'rgba(255,255,255,.15)',
  } : {
    background:  open ? '#f1f5f9' : '#fff',
    border:      '1.5px solid #e2e8f0',
    nameColor:   '#1e293b',
    roleColor:   cfg.color,
    chevronColor:'#94a3b8',
    hoverBg:     '#f8fafc',
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>

      {/* ── Trigger ──────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 10px 5px 5px',
          background: btn.background,
          border: btn.border,
          borderRadius: 10,
          cursor: 'pointer',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          transition: 'background .15s',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = btn.hoverBg }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = btn.background }}
      >
        <Avatar name={name} color={cfg.color} size={32}/>

        <div style={{ textAlign: 'left', lineHeight: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '.82rem', fontWeight: 700,
            color: btn.nameColor,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            maxWidth: 110,
          }}>
            {name}
          </div>
          <div style={{ fontSize: '.69rem', fontWeight: 600, color: btn.roleColor, marginTop: 3 }}>
            {cfg.label}
          </div>
        </div>

        <div style={{
          color: btn.chevronColor,
          display: 'flex', alignItems: 'center',
          transition: 'transform .2s',
          transform: open ? 'rotate(180deg)' : 'none',
          marginLeft: 2,
        }}>
          <ChevronDown size={13}/>
        </div>
      </button>

      {/* ── Dropdown ─────────────────────────────────────── */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 260,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,.12)',
          border: '1px solid #e2e8f0',
          zIndex: 500,
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          <style>{`
            @keyframes profileDropIn {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            .profile-drop { animation: profileDropIn .16s ease; }
            .profile-item {
              width: 100%; display: flex; align-items: center; gap: 10;
              padding: 9px 16px; background: none; border: none;
              cursor: pointer; font-family: inherit; font-size: .84rem;
              font-weight: 500; text-align: left; transition: background .12s;
            }
            .profile-item:hover { background: #f8fafc; }
            .profile-item-danger { color: #dc2626; }
            .profile-item-danger:hover { background: #fef2f2 !important; }
          `}</style>

          <div className="profile-drop">
            {/* Header */}
            <div style={{
              padding: '14px 16px 12px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <Avatar name={name} color={cfg.color} size={42}/>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '.88rem', fontWeight: 700, color: '#1e293b',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {name}
                </div>
                {email && (
                  <div style={{
                    fontSize: '.73rem', color: '#64748b', marginTop: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {email}
                  </div>
                )}
                <span style={{
                  display: 'inline-block', marginTop: 5,
                  fontSize: '.68rem', fontWeight: 700,
                  padding: '2px 8px', borderRadius: 999,
                  background: cfg.bg, color: cfg.color,
                }}>
                  {cfg.label}
                </span>
              </div>
            </div>

            {/* My Profile */}
            <div style={{ padding: '5px 0' }}>
              <button className="profile-item" onClick={handleProfile} style={{ color: '#374151', gap: 10 }}>
                <UserIcon size={15} style={{ color: '#64748b', flexShrink: 0 }}/>
                My Profile
              </button>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#f1f5f9' }}/>

            {/* Logout */}
            <div style={{ padding: '5px 0 6px' }}>
              <button className="profile-item profile-item-danger" onClick={handleLogout} style={{ gap: 10 }}>
                <LogoutIcon size={15} style={{ flexShrink: 0 }}/>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
