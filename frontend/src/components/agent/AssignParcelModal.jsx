import { useState, useEffect } from 'react'
import api, { assignParcel } from '../../services/api'
import { UserIcon, TruckIcon, CheckIcon, XIcon, MapPinIcon } from '../Icons'

export default function AssignParcelModal({ parcel, onClose, onSuccess }) {
  const [drivers, setDrivers]   = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    const fetchDrivers = async () => {
      setFetching(true)
      try {
        console.log('parcel object:', parcel)
        const res = await api.get(`/users/drivers?parcel_id=${parcel.id}`)
        setDrivers(res.data)
      } catch {
        setError('Failed to load drivers.')
      } finally { setFetching(false) }
    }
    fetchDrivers()
  }, [parcel.id])

  const handleAssign = async () => {
    if (!selected) return
    setLoading(true); setError('')
    try {
      await assignParcel(parcel.id, selected)
      onSuccess()
    } catch {
      setError('Failed to assign parcel.')
      setLoading(false)
    }
  }

  const isInter = parcel.delivery_type === 'inter' ||
    (parcel.origin_wilaya && parcel.destination_wilaya && parcel.origin_wilaya !== parcel.destination_wilaya)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{width:480}} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><XIcon size={18}/></button>
        <h2 className="modal-title">Assign Parcel to Driver</h2>
        <p className="modal-sub">
          <code style={{background:'#eff3ff',padding:'2px 8px',borderRadius:6,fontWeight:700,color:'#1a2e6e'}}>{parcel.tracking_code}</code>
        </p>

        {/* Route info */}
        <div style={{background: isInter?'#eff6ff':'#f0fdf4', border:`1px solid ${isInter?'#bfdbfe':'#bbf7d0'}`, borderRadius:10, padding:'10px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:8, fontSize:'.85rem', fontWeight:600, color: isInter?'#1d4ed8':'#166534'}}>
          <MapPinIcon size={15}/>
          {isInter
            ? `Inter-wilaya: ${parcel.origin_wilaya||parcel.pickup_location} → ${parcel.destination_wilaya||parcel.destination}`
            : `Intra-wilaya: ${parcel.origin_wilaya||parcel.pickup_location}`}
          <span style={{marginLeft:'auto',fontSize:'.75rem',opacity:.8}}>
            Showing {isInter ? 'inter-wilaya' : 'intra-wilaya'} drivers only
          </span>
        </div>

        {error && <div className="form-error">{error}</div>}

        {fetching ? (
          <div style={{textAlign:'center',padding:32,color:'#94a3b8'}}>
            <div className="spinner" style={{margin:'0 auto 12px'}}/>
            <p>Loading available drivers...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div style={{textAlign:'center',padding:32,color:'#94a3b8'}}>
            <TruckIcon size={40} style={{opacity:.2,display:'block',margin:'0 auto 12px'}}/>
            <p style={{fontWeight:600,color:'#475569',marginBottom:6}}>No drivers available</p>
            <p style={{fontSize:'.84rem'}}>
              {isInter
                ? `No inter-wilaya driver assigned to the route ${parcel.origin_wilaya||parcel.pickup_location} ↔ ${parcel.destination_wilaya||parcel.destination}.`
                : `No intra-wilaya driver assigned to ${parcel.origin_wilaya||parcel.pickup_location}.`}
            </p>
            <p style={{fontSize:'.8rem',marginTop:8,color:'#94a3b8'}}>Ask the admin to create a driver for this route.</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
            {drivers.map(d => (
              <label key={d.id} style={{
                display:'flex', alignItems:'center', gap:14,
                padding:'14px 16px', border:`1.5px solid ${selected===d.id?'#1a2e6e':'#e2e8f0'}`,
                borderRadius:12, cursor:'pointer', background: selected===d.id?'#eff3ff':'#f8fafc',
                transition:'all .2s',
              }}>
                <input type="radio" name="driver" value={d.id} checked={selected===d.id}
                  onChange={() => setSelected(d.id)} style={{accentColor:'#1a2e6e'}}/>
                <div style={{width:40,height:40,borderRadius:10,background:'#dde3f5',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <TruckIcon size={18} style={{color:'#1a2e6e'}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,color:'#1e293b',fontSize:'.92rem'}}>{d.name}</div>
                  <div style={{fontSize:'.78rem',color:'#64748b',marginTop:2,display:'flex',alignItems:'center',gap:6}}>
                    <span>{d.phone}</span>
                    <span style={{color:'#cbd5e1'}}>•</span>
                    <code style={{background:'#f1f5f9',padding:'1px 6px',borderRadius:4,fontSize:'.72rem'}}>{d.staff_id}</code>
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  {d.driver_type === 'inter' ? (
                    <div style={{fontSize:'.75rem',color:'#1d4ed8',fontWeight:600,background:'#eff6ff',padding:'3px 8px',borderRadius:999}}>
                      {d.route_from} ↔ {d.route_to}
                    </div>
                  ) : (
                    <div style={{fontSize:'.75rem',color:'#166534',fontWeight:600,background:'#f0fdf4',padding:'3px 8px',borderRadius:999}}>
                      {d.wilaya}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleAssign} disabled={!selected || loading}>
            <span style={{display:'flex',alignItems:'center',gap:8}}>
              <CheckIcon size={15}/> {loading ? 'Assigning...' : 'Assign Driver'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
