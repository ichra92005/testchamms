import { useState } from 'react'
import { SearchIcon, UsersIcon } from '../Icons'
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

export default function ClientsDisplay({ users, loading }) {
  const [search, setSearch] = useState('')

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone || '').includes(search)
  )

  if (loading) return <SkeletonTable rows={8} cells={5}/>


  return (
    <div className="parcels-section">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="parcels-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="field-wrap" style={{ width: 280, background: '#f8fafc' }}>
            <span className="field-icon"><SearchIcon size={14}/></span>
            <input
              className="field-input"
              style={{ padding: '8px 0' }}
              type="text"
              placeholder="Search by name, email or phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <span style={{ fontSize: '.82rem', color: '#94a3b8', fontWeight: 500 }}>
          {filtered.length} client{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ────────────────────────────────────────── */}
      <div className="parcels-table-wrap">
        <table className="parcels-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="4">
                  <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 14px', color: '#cbd5e1',
                    }}>
                      <UsersIcon size={26}/>
                    </div>
                    <div style={{ fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      {users.length === 0 ? 'No clients yet' : 'No clients match your search'}
                    </div>
                    <div style={{ fontSize: '.83rem' }}>
                      {users.length === 0
                        ? 'Clients will appear here once they register.'
                        : 'Try a different name, email or phone number.'}
                    </div>
                  </div>
                </td>
              </tr>
            ) : filtered.map(u => (
              <tr key={u.id}>
                {/* Avatar + name */}
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
                    </div>
                  </div>
                </td>

                <td style={{ color: '#64748b', fontSize: '.85rem' }}>{u.email}</td>
                <td style={{ color: '#64748b', fontSize: '.85rem' }}>{u.phone || '—'}</td>
                <td className="date-cell">{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
