import { useState } from 'react'
import { SearchIcon, ShieldIcon, TruckIcon, BuildingIcon } from '../Icons'
import { SkeletonTable } from '../Skeleton'

// ── Avatar helpers ────────────────────────────────────────────
const PALETTE = ['#1a2e6e','#0891b2','#7c3aed','#15803d','#c2410c','#b45309','#0f766e']
function avatarBg(name) {
  let h = 0; for (const c of (name || '')) h = (h * 31 + c.charCodeAt(0)) & 0xff
  return PALETTE[h % PALETTE.length]
}
function initials(name) {
  const p = (name || '').trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : (name || '??').slice(0, 2).toUpperCase()
}

const ROLE_BADGE = {
  admin:  { bg: '#fdf4ff', color: '#7e22ce', label: 'Admin'  },
  agency: { bg: '#eff6ff', color: '#1d4ed8', label: 'Agent'  },
  driver: { bg: '#f0fdf4', color: '#166534', label: 'Driver' },
}

const ROLE_FILTERS = [
  { key: 'all',    label: 'All'    },
  { key: 'admin',  label: 'Admin'  },
  { key: 'agency', label: 'Agent'  },
  { key: 'driver', label: 'Driver' },
]

function RouteBadge({ user }) {
  if (user.role !== 'driver') return <span style={{ color: '#94a3b8', fontSize: '.82rem' }}>—</span>
  if (user.driver_type === 'intra') return (
    <span style={{
      background: '#f0fdf4', color: '#166534',
      padding: '2px 8px', borderRadius: 999,
      fontSize: '.72rem', fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      <BuildingIcon size={11}/> {user.wilaya || 'No wilaya'}
    </span>
  )
  if (user.driver_type === 'inter') return (
    <span style={{
      background: '#eff6ff', color: '#1d4ed8',
      padding: '2px 8px', borderRadius: 999,
      fontSize: '.72rem', fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      <TruckIcon size={11}/> {user.route_from} ↔ {user.route_to}
    </span>
  )
  return <span style={{ fontSize: '.72rem', color: '#94a3b8' }}>No route</span>
}

export default function StaffDisplay({ users, loading }) {
  const [search, setSearch]     = useState('')
  const [roleFilter, setRole]   = useState('all')

  const filtered = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.staff_id || '').toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  // Count per role for filter chips
  const counts = {
    all:    users.length,
    admin:  users.filter(u => u.role === 'admin').length,
    agency: users.filter(u => u.role === 'agency').length,
    driver: users.filter(u => u.role === 'driver').length,
  }

  if (loading) return <SkeletonTable rows={8} cells={6}/>


  return (
    <div className="parcels-section">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="parcels-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Search */}
          <div className="field-wrap" style={{ width: 300, background: '#f8fafc' }}>
            <span className="field-icon"><SearchIcon size={14}/></span>
            <input
              className="field-input"
              style={{ padding: '8px 0' }}
              type="text"
              placeholder="Search by name, email or staff ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Role filter chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ROLE_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setRole(f.key)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 999,
                  border: '1.5px solid',
                  borderColor: roleFilter === f.key ? '#1a2e6e' : '#e2e8f0',
                  background: roleFilter === f.key ? '#1a2e6e' : '#f8fafc',
                  color: roleFilter === f.key ? '#fff' : '#64748b',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  fontSize: '.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all .15s',
                }}
              >
                {f.label}
                <span style={{
                  background: roleFilter === f.key ? 'rgba(255,255,255,.2)' : '#e2e8f0',
                  color: roleFilter === f.key ? '#fff' : '#64748b',
                  padding: '0 5px',
                  borderRadius: 999,
                  fontSize: '.7rem',
                  fontWeight: 700,
                }}>
                  {counts[f.key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <span style={{ fontSize: '.82rem', color: '#94a3b8', fontWeight: 500, alignSelf: 'flex-start' }}>
          {filtered.length} member{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ────────────────────────────────────────── */}
      <div className="parcels-table-wrap">
        <table className="parcels-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Staff ID</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Route / Wilaya</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 14px', color: '#cbd5e1',
                    }}>
                      <ShieldIcon size={26}/>
                    </div>
                    <div style={{ fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      {users.length === 0 ? 'No staff members yet' : 'No staff match your search'}
                    </div>
                    <div style={{ fontSize: '.83rem' }}>
                      {users.length === 0
                        ? 'Create staff accounts to get started.'
                        : 'Try a different name, email or staff ID.'}
                    </div>
                  </div>
                </td>
              </tr>
            ) : filtered.map(u => {
              const badge = ROLE_BADGE[u.role] || { bg: '#f1f5f9', color: '#475569', label: u.role }
              return (
                <tr key={u.id}>
                  {/* Avatar + name + email */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: avatarBg(u.name),
                        color: '#fff', fontSize: '.72rem', fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, letterSpacing: '.03em',
                      }}>
                        {initials(u.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '.88rem' }}>{u.name}</div>
                        <div style={{ fontSize: '.76rem', color: '#94a3b8', marginTop: 1 }}>{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <code className="tracking-code">{u.staff_id || '—'}</code>
                  </td>

                  <td>
                    <span style={{
                      background: badge.bg, color: badge.color,
                      padding: '3px 10px', borderRadius: 999,
                      fontSize: '.75rem', fontWeight: 700,
                    }}>
                      {badge.label}
                    </span>
                  </td>

                  <td style={{ color: '#64748b', fontSize: '.85rem' }}>{u.phone || '—'}</td>

                  <td><RouteBadge user={u}/></td>

                  <td className="date-cell">{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
