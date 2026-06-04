import { useState } from 'react'
import { PackageIcon, UserIcon, CashIcon, CardIcon, CheckIcon, XIcon, PlusIcon, SearchIcon, PrinterIcon, AlertIcon } from '../Icons'
import ParcelValidationModal from './ParcelValidationModal'
import DeliverySlip from './DeliverySlip'

const STATUS_COLORS = {
  pending:          { bg: '#fff7ed', color: '#c2410c', label: 'Pending Validation' },
  registered:       { bg: '#eff6ff', color: '#1d4ed8', label: 'Registered' },
  assigned:         { bg: '#f0fdf4', color: '#15803d', label: 'Assigned' },
  out_for_delivery: { bg: '#fdf4ff', color: '#7e22ce', label: 'Out for Delivery' },
  delivered:        { bg: '#f0fdf4', color: '#166534', label: 'Delivered' },
  confirmed:        { bg: '#f0fdf4', color: '#166534', label: 'Confirmed' },
  failed:           { bg: '#fef2f2', color: '#dc2626', label: 'Failed' },
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#f1f5f9', color: '#475569', label: status }
  return <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: 999, fontSize: '.78rem', fontWeight: 700 }}>{s.label}</span>
}

export default function ParcelList({ parcels, loading, onAssign, onRefresh, onCreateNew, toast }) {
  const [validateTarget, setValidateTarget] = useState(null)
  const [slipTarget, setSlipTarget]         = useState(null)
  const [search, setSearch]                 = useState('')

  const filtered = parcels.filter(p =>
    p.tracking_code?.toLowerCase().includes(search.toLowerCase()) ||
    p.receiver_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sender_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.destination?.toLowerCase().includes(search.toLowerCase()) ||
    p.destination_wilaya?.toLowerCase().includes(search.toLowerCase())
  )

  const handleValidationSuccess = (result) => {
    setValidateTarget(null)
    onRefresh()
    if (result === 'validated') toast?.success('Parcel validated successfully')
    if (result === 'rejected')  toast?.error('Parcel rejected')
  }

  if (loading) return <div className="parcels-empty"><div className="spinner"/><p>Loading parcels...</p></div>

  if (parcels.length === 0) return (
    <div className="parcels-empty">
      <PackageIcon size={48} style={{opacity:.2,marginBottom:16}}/>
      <h3>No parcels yet</h3>
      <p>Register the first parcel to get started</p>
      <button className="btn-primary" onClick={onCreateNew} style={{marginTop:20}}>
        <span style={{display:'flex',alignItems:'center',gap:8}}><PlusIcon size={15}/> Register New Parcel</span>
      </button>
    </div>
  )

  return (
    <>
      <div className="parcels-section">
        <div className="parcels-header">
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div className="field-wrap" style={{width:260,background:'#f8fafc'}}>
              <span className="field-icon"><SearchIcon size={14}/></span>
              <input className="field-input" placeholder="Search parcels..." value={search} onChange={e => setSearch(e.target.value)} style={{padding:'8px 0'}}/>
            </div>
            <span style={{fontSize:'.85rem',color:'#94a3b8'}}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          <button className="btn-primary" onClick={onCreateNew}>
            <span style={{display:'flex',alignItems:'center',gap:8}}><PlusIcon size={15}/> Register New Parcel</span>
          </button>
        </div>

        <div className="parcels-table-wrap">
          <table className="parcels-table">
            <thead>
              <tr>
                <th>Tracking Code</th><th>Sender</th><th>Receiver</th>
                <th>Route</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <code className="tracking-code">{p.tracking_code}</code>
                    {p.payment_method === 'online' && (
                      <div style={{marginTop:4}}>
                        <span style={{fontSize:'.68rem',fontWeight:700,padding:'2px 6px',borderRadius:999,background:p.payment_proof?'#f0fdf4':'#fff7ed',color:p.payment_proof?'#166534':'#c2410c'}}>
                          {p.payment_proof
                          ? <span style={{display:'flex',alignItems:'center',gap:3}}><CheckIcon size={10}/> Proof</span>
                          : <span style={{display:'flex',alignItems:'center',gap:3}}><AlertIcon size={10}/> No proof</span>}
                        </span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="receiver-name">{p.sender_name || '—'}</div>
                    <div className="receiver-phone">{p.sender_phone || ''}</div>
                  </td>
                  <td>
                    <div className="receiver-name">{p.receiver_name}</div>
                    <div className="receiver-phone">{p.receiver_phone}</div>
                  </td>
                  <td>
                    <div style={{fontSize:'.82rem',color:'#475569'}}>{p.origin_wilaya||p.pickup_location||'—'}</div>
                    <div style={{fontSize:'.75rem',color:'#94a3b8'}}>→ {p.destination_wilaya||p.destination||'—'}</div>
                  </td>
                  <td>
                    <span style={{display:'flex',alignItems:'center',gap:6,fontSize:'.85rem',fontWeight:600}}>
                      {p.payment_method==='cash'?<><CashIcon size={14}/> Cash</>:<><CardIcon size={14}/> Online</>}
                    </span>
                  </td>
                  <td><StatusBadge status={p.status}/></td>
                  <td className="date-cell">{new Date(p.created_at).toLocaleDateString('en-GB')}</td>
                  <td>
                    <div className="action-btns" style={{gap:6}}>
                      <button className="btn-action" style={{background:'#f8fafc',color:'#1a2e6e',display:'flex',alignItems:'center',gap:4}}
                        onClick={() => setSlipTarget(p)} title="Print delivery slip">
                        <PrinterIcon size={14}/>
                      </button>
                      {p.status === 'pending' && (
                        <button className="btn-action register" onClick={() => setValidateTarget(p)}>
                          <span style={{display:'flex',alignItems:'center',gap:5}}><SearchIcon size={13}/> Validate</span>
                        </button>
                      )}
                      {p.status === 'registered' && (
                        <button className="btn-action assign" onClick={() => onAssign(p)}>
                          <span style={{display:'flex',alignItems:'center',gap:5}}><UserIcon size={13}/> Assign</span>
                        </button>
                      )}
                      {p.status === 'assigned'  && <span className="text-muted">Awaiting pickup</span>}
                      {p.status === 'delivered' && <span className="text-success" style={{display:'flex',alignItems:'center',gap:5}}><CheckIcon size={13}/> Done</span>}
                      {p.status === 'failed'    && <span className="text-danger"  style={{display:'flex',alignItems:'center',gap:5}}><XIcon size={13}/> Failed</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {validateTarget && <ParcelValidationModal parcel={validateTarget} onClose={() => setValidateTarget(null)} onSuccess={handleValidationSuccess}/>}
      {slipTarget && <DeliverySlip parcel={slipTarget} onClose={() => setSlipTarget(null)}/>}
    </>
  )
}
