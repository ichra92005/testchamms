import { useState } from 'react'
import { updateStatus } from '../../services/api'
import {
  UserIcon, PhoneIcon, MapPinIcon, HomeIcon,
  PackageIcon, CashIcon, CardIcon, CheckIcon, XIcon, WeightIcon
} from '../Icons'

// ── Custom Confirm Dialog ─────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel, danger = false }) {
  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onCancel}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '32px 28px',
          width: 400,
          maxWidth: '90vw',
          boxShadow: '0 8px 40px rgba(0,0,0,.18)',
          textAlign: 'center',
          animation: 'slideUp .2s ease',
        }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: danger ? '#fef2f2' : '#eff6ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          {danger
            ? <XIcon size={24} style={{ color: '#dc2626' }}/>
            : <CheckIcon size={24} style={{ color: '#1d4ed8' }}/>
          }
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: '.9rem', color: '#64748b', lineHeight: 1.6, marginBottom: 28 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px', borderRadius: 10,
              border: '1.5px solid #e2e8f0', background: '#f8fafc',
              fontFamily: 'inherit', fontWeight: 700, fontSize: '.92rem',
              color: '#475569', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px', borderRadius: 10, border: 'none',
              background: danger ? '#dc2626' : '#1a2e6e',
              fontFamily: 'inherit', fontWeight: 700, fontSize: '.92rem',
              color: '#fff', cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Info Row ──────────────────────────────────────────────────
function InfoRow({ label, value, icon }) {
  return (
    <div className="val-info-row">
      <div className="val-info-label">{label}</div>
      <div className="val-info-value">
        {icon && <span className="val-info-icon">{icon}</span>}
        {value || <span style={{color:'#94a3b8',fontStyle:'italic'}}>Not provided</span>}
      </div>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div className="val-section">
      <div className="val-section-title">{icon} {title}</div>
      {children}
    </div>
  )
}

// ── Main Modal ────────────────────────────────────────────────
export default function ParcelValidationModal({ parcel, onClose, onSuccess }) {
  const [notes, setNotes]         = useState('')
  const [loading, setLoading]     = useState(null)
  const [error, setError]         = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const handleValidate = async () => {
    setLoading('validate'); setError('')
    try {
      await updateStatus(parcel.id, 'registered')
      onSuccess('validated')
    } catch {
      setError('Failed to validate parcel.')
      setLoading(null)
    }
  }

  const handleReject = async () => {
    setShowConfirm(false)
    setLoading('reject'); setError('')
    try {
      await updateStatus(parcel.id, 'failed')
      onSuccess('rejected')
    } catch {
      setError('Failed to reject parcel.')
      setLoading(null)
    }
  }

  const isInterWilaya = parcel.origin_wilaya && parcel.destination_wilaya &&
                        parcel.origin_wilaya !== parcel.destination_wilaya

  const proofUrl = parcel.payment_proof
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${parcel.payment_proof}`
    : null

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="val-modal" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="val-modal-header">
            <div>
              <h2 className="val-modal-title">Parcel Validation</h2>
              <p className="val-modal-sub">Review all information carefully before confirming</p>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <code className="tracking-code" style={{fontSize:'.9rem'}}>{parcel.tracking_code}</code>
              <button className="modal-close-btn" onClick={onClose}><XIcon size={18}/></button>
            </div>
          </div>

          {/* Delivery type banner */}
          <div className={`val-delivery-banner ${isInterWilaya?'inter':'intra'}`}>
            <MapPinIcon size={15}/>
            {isInterWilaya
              ? `Inter-wilaya: ${parcel.origin_wilaya||parcel.pickup_location} → ${parcel.destination_wilaya||parcel.destination}`
              : `Same wilaya: ${parcel.origin_wilaya||parcel.pickup_location}`}
          </div>

          {error && <div className="form-error" style={{margin:'0 16px 16px'}}>{error}</div>}

          {/* Body */}
          <div className="val-modal-body">
            <Section title="Sender Information" icon={<UserIcon size={15}/>}>
              <InfoRow label="Full Name"     value={parcel.sender_name}  icon={<UserIcon size={13}/>}/>
              <InfoRow label="Phone"         value={parcel.sender_phone} icon={<PhoneIcon size={13}/>}/>
              <InfoRow label="Origin Wilaya" value={parcel.origin_wilaya||parcel.pickup_location} icon={<MapPinIcon size={13}/>}/>
            </Section>

            <Section title="Receiver Information" icon={<UserIcon size={15}/>}>
              <InfoRow label="Full Name"          value={parcel.receiver_name}  icon={<UserIcon size={13}/>}/>
              <InfoRow label="Phone"              value={parcel.receiver_phone} icon={<PhoneIcon size={13}/>}/>
              <InfoRow label="Destination Wilaya" value={parcel.destination_wilaya||parcel.destination} icon={<MapPinIcon size={13}/>}/>
              <InfoRow label="Delivery Address"   value={parcel.delivery_address} icon={<HomeIcon size={13}/>}/>
            </Section>

            <Section title="Parcel Details" icon={<PackageIcon size={15}/>}>
              <InfoRow label="Description"   value={parcel.description}/>
              <InfoRow label="Weight"        value={parcel.weight?`${parcel.weight} kg`:null} icon={<WeightIcon size={13}/>}/>
              <InfoRow
                label="Payment"
                value={parcel.payment_method==='cash'?'Cash on Delivery':'Online Payment'}
                icon={parcel.payment_method==='cash'?<CashIcon size={13}/>:<CardIcon size={13}/>}
              />
              <InfoRow label="Registered on" value={new Date(parcel.created_at).toLocaleString('en-GB')}/>
            </Section>
          </div>

          {/* Payment proof */}
          {parcel.payment_method === 'online' && (
            <div style={{padding:'0 28px 20px'}}>
              <div style={{
                background: proofUrl?'#f0fdf4':'#fff7ed',
                border:`1.5px solid ${proofUrl?'#bbf7d0':'#fed7aa'}`,
                borderRadius:12, padding:'16px 20px'
              }}>
                <p style={{fontWeight:700,fontSize:'.88rem',color:proofUrl?'#166534':'#c2410c',marginBottom:proofUrl?12:0}}>
                  {proofUrl?'Payment Proof Submitted':'No payment proof uploaded yet'}
                </p>
                {proofUrl && (
                  <a href={proofUrl} target="_blank" rel="noreferrer">
                    <img src={proofUrl} alt="Payment proof" style={{maxHeight:200,borderRadius:10,border:'1px solid #e2e8f0',display:'block',cursor:'pointer'}}/>
                    <p style={{fontSize:'.78rem',color:'#64748b',marginTop:6}}>Click to open full image</p>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="val-notes">
            <label className="field-label">Validation Notes (optional)</label>
            <textarea className="field-textarea" placeholder="Add any notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={2}/>
          </div>

          {/* Actions */}
          <div className="val-actions">
            <button className="val-btn-reject" onClick={() => setShowConfirm(true)} disabled={!!loading}>
              <span style={{display:'flex',alignItems:'center',gap:8}}>
                <XIcon size={15}/> {loading==='reject'?'Rejecting...':'Reject Parcel'}
              </span>
            </button>
            <button className="val-btn-validate" onClick={handleValidate} disabled={!!loading}>
              <span style={{display:'flex',alignItems:'center',gap:8}}>
                <CheckIcon size={15}/> {loading==='validate'?'Validating...':'Validate & Confirm'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom confirm dialog */}
      {showConfirm && (
        <ConfirmDialog
          title="Reject this parcel?"
          message="This parcel will be marked as failed and cannot be undone. Are you sure you want to reject it?"
          confirmLabel="Yes, Reject"
          danger={true}
          onConfirm={handleReject}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}
