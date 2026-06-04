import { useState, useEffect } from 'react'
import api from '../../services/api'
import { ChartIcon, UserIcon, PackageIcon, ArrowLeftIcon, ShieldIcon, UsersIcon, BuildingIcon } from '../Icons'

// Groups define the sidebar structure. badgeKey maps to the sidebarCounts response field.
// urgentThreshold: badge turns orange when the count exceeds this number.
const GROUPS = [
  {
    label: 'Dashboard',
    items: [
      { key: 'overview', label: 'Overview',        Icon: ChartIcon },
    ],
  },
  {
    label: 'Logistics',
    items: [
      { key: 'parcels', label: 'All Parcels', Icon: PackageIcon, badgeKey: 'activeParcels', urgentThreshold: 5 },
    ],
  },
  {
    label: 'Management',
    items: [
      { key: 'users',   label: 'User Management', Icon: UserIcon                                             },
      { key: 'clients', label: 'Clients',          Icon: UsersIcon,   badgeKey: 'totalClients'               },
      { key: 'staff',   label: 'Staff',            Icon: BuildingIcon, badgeKey: 'totalStaff'                },
    ],
  },
]

export default function AdminSidebar({ active, onNavigate }) {
  const [counts, setCounts] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/admin/sidebar-counts')
        setCounts(res.data)
      } catch { /* badge just won't show — non-fatal */ }
    }
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [])

  return (
    // Override the shared .agent-sidebar padding so nav links can stretch edge-to-edge
    // (needed for the inset left-border active indicator to reach the sidebar's left wall)
    <aside className="agent-sidebar" style={{ padding: 0 }}>

      {/* ── Brand ──────────────────────────────────────────── */}
      <div style={{ padding: '22px 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'rgba(255,255,255,.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <ShieldIcon size={14}/>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', letterSpacing: '-.2px' }}>
            DeliverIt
          </span>
        </div>
        <div style={{
          fontSize: '.63rem',
          fontWeight: 700,
          letterSpacing: '1.3px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,.35)',
        }}>
          Admin Portal
        </div>
      </div>

      {/* ── Divider ─────────────────────────────────────────── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }}/>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
        {GROUPS.map((group, gi) => (
          <div key={group.label} style={{ marginTop: gi > 0 ? 18 : 4 }}>
            <div className="admin-nav-category">{group.label}</div>

            {group.items.map(({ key, label, Icon, badgeKey, urgentThreshold }) => {
              const badge    = badgeKey != null ? counts?.[badgeKey] : undefined
              const isUrgent = urgentThreshold != null && badge > urgentThreshold
              const isActive = active === key

              return (
                <button
                  key={key}
                  className={`admin-nav-link${isActive ? ' admin-nav-active' : ''}`}
                  onClick={() => onNavigate(key)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <Icon size={15}/>
                    <span>{label}</span>
                  </span>

                  {/* Only render once counts are loaded — prevents flicker */}
                  {counts != null && badge != null && (
                    <span className={`sidebar-badge${isUrgent ? ' sidebar-badge-urgent' : ''}`}>
                      {badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── Divider ─────────────────────────────────────────── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }}/>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div style={{ padding: '10px 8px 20px' }}>
        <a
          href="/"
          className="sidebar-link"
          style={{ borderRadius: 6, padding: '9px 10px' }}
        >
          <ArrowLeftIcon size={14}/> Back to Website
        </a>
      </div>
    </aside>
  )
}
