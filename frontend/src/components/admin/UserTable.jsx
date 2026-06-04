import { useState } from 'react'
import api from '../../services/api'
import { PlusIcon, TrashIcon, SearchIcon, TruckIcon, BuildingIcon } from '../Icons'
import { SkeletonTable } from '../Skeleton'
import UserDetailModal from './UserDetailModal'

function EditIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

const ROLE_BADGE = {
  admin:   { bg: '#fdf4ff', color: '#7e22ce', label: 'Admin'  },
  agency:  { bg: '#eff6ff', color: '#1d4ed8', label: 'Agent'  },
  agent:   { bg: '#eff6ff', color: '#1d4ed8', label: 'Agent'  },
  driver:  { bg: '#f0fdf4', color: '#166534', label: 'Driver' },
  client:  { bg: '#fff7ed', color: '#c2410c', label: 'Client' },
}

export default function UserTable({ users, loading, onCreateNew, onRefresh, toast }) {
  const [search, setSearch]       = useState('')
  const [roleFilter, setRole]     = useState('all')
  const [deleting, setDeleting]   = useState(null)
  const [editUser, setEditUser]   = useState(null)

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole   = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return
    setDeleting(id)
    try {
      await api.delete(`/admin/users/${id}`)
      onRefresh()
      toast?.warning('Staff deleted')
    }
    catch {
      if (toast) toast.error('Failed to delete user')
      else alert('Failed to delete user.')
    }
    finally { setDeleting(null) }
  }

  const getDriverRoute = (u) => {
    if (u.role !== 'driver') return null
    if (u.driver_type === 'intra') return (
      <span style={{background:'#f0fdf4',color:'#166534',padding:'2px 8px',borderRadius:999,fontSize:'.72rem',fontWeight:600,display:'flex',alignItems:'center',gap:4}}>
        <BuildingIcon size={11}/> {u.wilaya || 'No wilaya'}
      </span>
    )
    if (u.driver_type === 'inter') return (
      <span style={{background:'#eff6ff',color:'#1d4ed8',padding:'2px 8px',borderRadius:999,fontSize:'.72rem',fontWeight:600,display:'flex',alignItems:'center',gap:4}}>
        <TruckIcon size={11}/> {u.route_from} ↔ {u.route_to}
      </span>
    )
    return <span style={{fontSize:'.72rem',color:'#94a3b8'}}>No route set</span>
  }

  if (loading) return <SkeletonTable rows={8} cells={6}/>

  return (
    <div className="parcels-section">
      <div className="parcels-header">
        <div className="table-filters">
          <div className="field-wrap" style={{width:260,background:'#f8fafc'}}>
            <span className="field-icon"><SearchIcon size={14}/></span>
            <input className="field-input" style={{padding:'8px 0'}} type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <select className="role-select" value={roleFilter} onChange={e => setRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="agency">Agent</option>
            <option value="driver">Driver</option>
          </select>
        </div>
        <button className="btn-primary" onClick={onCreateNew}>
          <span style={{display:'flex',alignItems:'center',gap:8}}><PlusIcon size={15}/> Create Staff Account</span>
        </button>
      </div>

      <div className="parcels-table-wrap">
        <table className="parcels-table">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Staff ID</th>
              <th>Phone</th><th>Role</th><th>Route / Wilaya</th><th>Joined</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="8" style={{textAlign:'center',padding:32,color:'#94a3b8'}}>No users found</td></tr>
            ) : filtered.map(u => {
              const badge = ROLE_BADGE[u.role] || { bg:'#f1f5f9', color:'#475569', label: u.role }
              return (
                <tr key={u.id}>
                  <td>
                    <span className="receiver-name" style={{color:'#1a2e6e',fontWeight:700}}>
                      {u.name}
                    </span>
                  </td>
                  <td style={{color:'#64748b',fontSize:'.85rem'}}>{u.email}</td>
                  <td><code className="tracking-code">{u.staff_id || '—'}</code></td>
                  <td style={{color:'#64748b',fontSize:'.85rem'}}>{u.phone || '—'}</td>
                  <td><span style={{background:badge.bg,color:badge.color,padding:'3px 10px',borderRadius:999,fontSize:'.75rem',fontWeight:700}}>{badge.label}</span></td>
                  <td>{getDriverRoute(u) || <span style={{color:'#94a3b8',fontSize:'.82rem'}}>—</span>}</td>
                  <td className="date-cell">{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button
                        className="btn-action"
                        style={{background:'#f0fdf4',color:'#166534',display:'flex',alignItems:'center',gap:5}}
                        onClick={() => setEditUser(u)}
                        title="Edit user"
                      >
                        <EditIcon size={13}/> Edit
                      </button>
                      <button
                        className="btn-action"
                        style={{background:'#fef2f2',color:'#dc2626',display:'flex',alignItems:'center',gap:5}}
                        onClick={() => handleDelete(u.id)}
                        disabled={deleting === u.id}
                        title="Delete user"
                      >
                        <TrashIcon size={13}/> {deleting === u.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editUser && (
        <UserDetailModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => { setEditUser(null); onRefresh() }}
        />
      )}
    </div>
  )
}
