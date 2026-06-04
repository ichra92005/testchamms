import { useState, useMemo } from 'react'
import { CashIcon, CardIcon, SearchIcon } from '../Icons'
import StatusFilter from '../StatusFilter'
import { SkeletonTable } from '../Skeleton'
import { sortByStatus, isCompleted } from '../../utils/parcelSort'

const STATUS_COLORS = {
  pending:          { bg: '#fff7ed', color: '#c2410c', label: 'Pending' },
  registered:       { bg: '#eff6ff', color: '#1d4ed8', label: 'Registered' },
  assigned:         { bg: '#f0fdf4', color: '#15803d', label: 'Assigned' },
  out_for_delivery: { bg: '#fdf4ff', color: '#7e22ce', label: 'Out for Delivery' },
  delivered:        { bg: '#f0fdf4', color: '#166534', label: 'Delivered' },
  failed:           { bg: '#fef2f2', color: '#dc2626', label: 'Failed' },
}

export default function ParcelTable({ parcels, loading }) {
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('all')

  const filtered = useMemo(() => {
    const matched = parcels.filter(p => {
      const matchSearch = p.tracking_code?.toLowerCase().includes(search.toLowerCase()) ||
                          p.receiver_name?.toLowerCase().includes(search.toLowerCase()) ||
                          p.sender_name?.toLowerCase().includes(search.toLowerCase()) ||
                          p.destination?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      return matchSearch && matchStatus
    })
    return sortByStatus(matched)
  }, [parcels, search, statusFilter])

  if (loading) return <SkeletonTable rows={10} cells={6}/>

  return (
    <div className="parcels-section">
      <div className="parcels-header">
        <div className="table-filters">
          <div className="field-wrap" style={{width:300,background:'#f8fafc'}}>
            <span className="field-icon"><SearchIcon size={14}/></span>
            <input className="field-input" style={{padding:'8px 0'}} type="text" placeholder="Search parcels..." value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <StatusFilter value={statusFilter} onChange={setStatus}/>
        </div>
        <span style={{fontSize:'.88rem',color:'#64748b'}}>{filtered.length} parcels</span>
      </div>

      <div className="parcels-table-wrap">
        <table className="parcels-table">
          <thead>
            <tr>
              <th>Tracking Code</th><th>Sender</th><th>Receiver</th>
              <th>Route</th><th>Type</th><th>Payment</th><th>Status</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="8" style={{textAlign:'center',padding:32,color:'#94a3b8'}}>No parcels found</td></tr>
            ) : filtered.map(p => {
              const s = STATUS_COLORS[p.status] || { bg:'#f1f5f9', color:'#475569', label: p.status }
              const isInter = p.origin_wilaya && p.destination_wilaya && p.origin_wilaya !== p.destination_wilaya
              return (
                <tr key={p.id} style={isCompleted(p.status) ? { opacity: .65, background: '#fafafa' } : undefined}>
                  <td><code className="tracking-code">{p.tracking_code}</code></td>
                  <td>
                    <div className="receiver-name">{p.sender_name || '—'}</div>
                    <div className="receiver-phone">{p.sender_phone || ''}</div>
                  </td>
                  <td>
                    <div className="receiver-name">{p.receiver_name}</div>
                    <div className="receiver-phone">{p.receiver_phone}</div>
                  </td>
                  <td>
                    <div style={{fontSize:'.82rem',color:'#475569'}}>{p.origin_wilaya || p.pickup_location || '—'}</div>
                    <div style={{fontSize:'.75rem',color:'#94a3b8'}}>→ {p.destination_wilaya || p.destination || '—'}</div>
                  </td>
                  <td>
                    <span style={{
                      background: isInter ? '#eff6ff' : '#f0fdf4',
                      color: isInter ? '#1d4ed8' : '#166534',
                      padding:'3px 8px', borderRadius:999, fontSize:'.73rem', fontWeight:700
                    }}>
                      {isInter ? 'Inter' : 'Intra'}
                    </span>
                  </td>
                  <td>
                    <span style={{display:'flex',alignItems:'center',gap:5,fontSize:'.85rem',fontWeight:600}}>
                      {p.payment_method==='cash' ? <><CashIcon size={13}/> Cash</> : <><CardIcon size={13}/> Online</>}
                    </span>
                  </td>
                  <td>
                    <span style={{background:s.bg,color:s.color,padding:'4px 10px',borderRadius:999,fontSize:'.75rem',fontWeight:700}}>
                      {s.label}
                    </span>
                  </td>
                  <td className="date-cell">{new Date(p.created_at).toLocaleDateString('en-GB')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
