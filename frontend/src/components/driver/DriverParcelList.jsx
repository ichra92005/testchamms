import { useState } from 'react'
import { updateStatus, refuseParcel } from '../../services/api'
import { MapPinIcon, HomeIcon, CashIcon, CardIcon, CheckIcon, XIcon, TruckIcon, PackageIcon } from '../Icons'
import LiveLocationTracker from './LiveLocationTracker'

const STATUS_COLORS = {
  assigned:         { bg: '#eff6ff', color: '#1d4ed8', label: 'Pending Acceptance' },
  accepted:         { bg: '#f0fdf4', color: '#15803d', label: 'Accepted' },
  out_for_delivery: { bg: '#fdf4ff', color: '#7e22ce', label: 'Out for Delivery' },
  delivered:        { bg: '#f0fdf4', color: '#166534', label: 'Delivered' },
  failed:           { bg: '#fef2f2', color: '#dc2626', label: 'Failed' },
  refused:          { bg: '#fef2f2', color: '#dc2626', label: 'Refused' },
}

const REFUSE_REASONS = [
  'Too far destination',
  'Vehicle unavailable',
  'Already at full capacity',
  'Other',
]

function RefuseModal({ parcel, onClose, onSuccess, toast }) {
  const [reason, setReason]       = useState('')
  const [otherText, setOtherText] = useState('')
  const [loading, setLoading]     = useState(false)

  const handleSubmit = async () => {
    const finalReason = reason === 'Other' ? otherText.trim() : reason
    if (!finalReason) { toast?.error('Please select a reason.'); return }
    setLoading(true)
    try {
      await refuseParcel(parcel.id, finalReason)
      toast?.success('Parcel refused — returned to agent for reassignment')
      onSuccess()
    } catch {
      toast?.error('Failed to refuse parcel.')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{width:440}} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><XIcon size={18}/></button>
        <h2 className="modal-title">Refuse Delivery</h2>
        <p className="modal-sub">Parcel <strong>{parcel.tracking_code}</strong> will be returned to the agent for reassignment.</p>

        <div className="field-group">
          <label className="field-label">Reason for Refusal</label>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
            {REFUSE_REASONS.map(r => (
              <label key={r} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',border:`1.5px solid ${reason===r?'#dc2626':'#e2e8f0'}`,borderRadius:10,cursor:'pointer',background:reason===r?'#fef2f2':'#f8fafc',fontFamily:'inherit',fontSize:'.88rem',fontWeight:reason===r?700:500,color:reason===r?'#dc2626':'#475569',transition:'all .18s'}}>
                <input type="radio" name="refuse_reason" value={r} checked={reason===r} onChange={() => setReason(r)} style={{accentColor:'#dc2626'}}/>
                {r}
              </label>
            ))}
          </div>

          {reason === 'Other' && (
            <div className="field-group" style={{marginTop:-4}}>
              <label className="field-label">Please specify</label>
              <div className="field-wrap">
                <input className="field-input" placeholder="Describe the reason..." value={otherText}
                  onChange={e => setOtherText(e.target.value)} autoFocus/>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            style={{display:'flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:10,border:'none',background:'#dc2626',color:'#fff',fontFamily:'inherit',fontWeight:700,fontSize:'.9rem',cursor:loading?'not-allowed':'pointer',opacity:loading?.7:1}}>
            <XIcon size={15}/> {loading ? 'Refusing...' : 'Confirm Refusal'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ReportIssueModal({ parcel, onClose, onSuccess, toast }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const issues = ['Address not found','Receiver not available','Receiver refused delivery','Damaged parcel','Wrong address','Other']

  const handleSubmit = async () => {
    if (!reason) { toast?.error('Please select a reason.'); return }
    setLoading(true)
    try {
      await updateStatus(parcel.id, 'failed', reason)
      toast?.success('Delivery issue reported')
      onSuccess()
    } catch {
      toast?.error('Failed to report issue.')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{width:440}} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><XIcon size={18}/></button>
        <h2 className="modal-title">Report Delivery Issue</h2>
        <p className="modal-sub">Parcel: <strong>{parcel.tracking_code}</strong></p>
        <div className="field-group">
          <label className="field-label">Reason for Failed Delivery</label>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
            {issues.map(issue => (
              <label key={issue} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',border:`1.5px solid ${reason===issue?'#1a2e6e':'#e2e8f0'}`,borderRadius:10,cursor:'pointer',background:reason===issue?'#eff3ff':'#f8fafc',fontFamily:'inherit',fontSize:'.88rem',fontWeight:reason===issue?700:500,color:reason===issue?'#1a2e6e':'#475569',transition:'all .2s'}}>
                <input type="radio" name="reason" value={issue} checked={reason===issue} onChange={() => setReason(issue)} style={{accentColor:'#1a2e6e'}}/>
                {issue}
              </label>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{background:'#dc2626'}} onClick={handleSubmit} disabled={loading}>
            <span style={{display:'flex',alignItems:'center',gap:8}}><XIcon size={15}/> {loading?'Reporting...':'Mark as Failed'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function ParcelCard({ parcel, onRefresh, toast }) {
  const [loading, setLoading]       = useState(null)
  const [showIssue, setShowIssue]   = useState(false)
  const [showRefuse, setShowRefuse] = useState(false)
  const s = STATUS_COLORS[parcel.status] || { bg:'#f1f5f9', color:'#475569', label: parcel.status }

  const handle = async (status, successMsg) => {
    setLoading(status)
    try {
      await updateStatus(parcel.id, status)
      toast?.success(successMsg || 'Status updated')
      onRefresh()
    } catch {
      toast?.error('Failed to update status')
    } finally { setLoading(null) }
  }

  return (
    <>
      <div className="driver-card">
        <div className="driver-card-header">
          <code className="tracking-code">{parcel.tracking_code}</code>
          <span style={{background:s.bg,color:s.color,padding:'4px 12px',borderRadius:999,fontSize:'.78rem',fontWeight:700}}>{s.label}</span>
        </div>

        <div style={{padding:'0 0 4px'}}>
          <LiveLocationTracker parcelId={parcel.id} active={parcel.status === 'out_for_delivery'}/>
        </div>

        <div className="driver-card-body">
          <div className="driver-info-grid">
            <div className="driver-info-item">
              <span className="driver-info-label">RECEIVER</span>
              <span className="driver-info-value">{parcel.receiver_name}</span>
              <span className="driver-info-sub">{parcel.receiver_phone}</span>
            </div>
            <div className="driver-info-item">
              <span className="driver-info-label">DESTINATION</span>
              <span className="driver-info-value" style={{display:'flex',alignItems:'center',gap:5}}><MapPinIcon size={14}/> {parcel.destination_wilaya||parcel.destination}</span>
            </div>
            <div className="driver-info-item">
              <span className="driver-info-label">PAYMENT</span>
              <span className="driver-info-value" style={{display:'flex',alignItems:'center',gap:5}}>
                {parcel.payment_method==='cash'?<><CashIcon size={14}/> Cash on Delivery</>:<><CardIcon size={14}/> Online</>}
              </span>
            </div>
          </div>

          {/* Delivery address — full-width prominent row */}
          <div style={{
            marginTop:12, padding:'12px 14px',
            background:'#eff6ff', borderRadius:10,
            border:'1px solid #bfdbfe',
            display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12,
          }}>
            <div style={{display:'flex',alignItems:'flex-start',gap:8,flex:1,minWidth:0}}>
              <HomeIcon size={15} style={{color:'#1d4ed8',flexShrink:0,marginTop:2}}/>
              <div style={{minWidth:0}}>
                <div style={{fontSize:'.72rem',fontWeight:700,color:'#3b82f6',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:3}}>Delivery Address</div>
                <div style={{fontSize:'.92rem',fontWeight:600,color:'#1e293b',lineHeight:1.45,wordBreak:'break-word'}}>
                  {parcel.delivery_address || parcel.pickup_location || '—'}
                  {parcel.destination_wilaya && parcel.delivery_address
                    ? <span style={{color:'#475569',fontWeight:500}}>, {parcel.destination_wilaya}</span>
                    : null}
                </div>
              </div>
            </div>
            {['accepted','out_for_delivery'].includes(parcel.status) && (parcel.delivery_address || parcel.pickup_location) && (
              <button
                onClick={() => window.open(
                  `https://www.google.com/maps/search/${encodeURIComponent(
                    (parcel.delivery_address || parcel.pickup_location) + ' ' + (parcel.destination_wilaya || '') + ' Algeria'
                  )}`, '_blank'
                )}
                style={{
                  display:'flex', alignItems:'center', gap:5, flexShrink:0,
                  background:'#1d4ed8', color:'#fff',
                  border:'none', borderRadius:8, padding:'7px 12px',
                  fontFamily:'inherit', fontSize:'.78rem', fontWeight:700,
                  cursor:'pointer', whiteSpace:'nowrap',
                }}
              >
                <MapPinIcon size={13}/> Get Directions
              </button>
            )}
          </div>
        </div>

        <div className="driver-card-actions">
          {parcel.status==='assigned' && (
            <>
              <button className="driver-btn" style={{background:'#fef2f2',color:'#dc2626'}}
                onClick={() => setShowRefuse(true)} disabled={!!loading}>
                <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><XIcon size={15}/> Refuse</span>
              </button>
              <button className="driver-btn" style={{background:'#f0fdf4',color:'#166534'}}
                onClick={() => handle('accepted','Delivery accepted')} disabled={!!loading}>
                <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><CheckIcon size={15}/> {loading==='accepted'?'...':'Accept'}</span>
              </button>
            </>
          )}
          {parcel.status==='accepted' && (
            <button className="driver-btn out-for-delivery"
              onClick={() => handle('out_for_delivery','Out for delivery — GPS started')} disabled={!!loading}>
              <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><TruckIcon size={15}/> {loading?'...':'Start Delivery'}</span>
            </button>
          )}
          {parcel.status==='out_for_delivery' && (
            <>
              <button className="driver-btn delivered"
                onClick={() => handle('delivered','Parcel delivered successfully')} disabled={!!loading}>
                <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><CheckIcon size={15}/> {loading==='delivered'?'...':'Mark Delivered'}</span>
              </button>
              <button className="driver-btn failed" onClick={() => setShowIssue(true)} disabled={!!loading}>
                <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><XIcon size={15}/> Report Issue</span>
              </button>
            </>
          )}
          {parcel.status==='delivered' && <div className="driver-done success"><span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><CheckIcon size={15}/> Successfully Delivered</span></div>}
          {parcel.status==='failed'    && <div className="driver-done danger"><span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><XIcon size={15}/> Delivery Failed</span></div>}
          {parcel.status==='refused'   && <div className="driver-done danger"><span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><XIcon size={15}/> Delivery Refused</span></div>}
        </div>
      </div>

      {showRefuse && (
        <RefuseModal parcel={parcel} toast={toast}
          onClose={() => setShowRefuse(false)}
          onSuccess={() => { setShowRefuse(false); onRefresh() }}
        />
      )}
      {showIssue && (
        <ReportIssueModal parcel={parcel} toast={toast}
          onClose={() => setShowIssue(false)}
          onSuccess={() => { setShowIssue(false); onRefresh() }}
        />
      )}
    </>
  )
}

export default function DriverParcelList({ parcels, loading, onRefresh, toast }) {
  if (loading) return <div className="parcels-empty"><div className="spinner"/><p>Loading your parcels...</p></div>
  if (parcels.length === 0) return (
    <div className="parcels-empty">
      <PackageIcon size={48} style={{opacity:.2,marginBottom:16}}/>
      <h3>No parcels found</h3><p>No parcels in this category</p>
    </div>
  )
  return <div className="driver-cards-grid">{parcels.map(p => <ParcelCard key={p.id} parcel={p} onRefresh={onRefresh} toast={toast}/>)}</div>
}
