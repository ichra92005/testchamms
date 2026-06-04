import { useRef } from 'react'

const STATUS_LABELS = {
  pending:          'Pending Validation',
  registered:       'Registered',
  assigned:         'Assigned to Driver',
  accepted:         'Accepted by Driver',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  confirmed:        'Reception Confirmed',
  failed:           'Failed',
  refused:          'Refused',
}

export default function TrackingSlip({ parcel, onClose }) {
  const slipRef = useRef(null)

  const handlePrint = () => {
    const content = slipRef.current.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tracking Slip — ${parcel.tracking_code}</title>
        <meta charset="UTF-8"/>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; }
          .slip { max-width: 600px; margin: 0 auto; padding: 32px 28px; border: 2px solid #1a2e6e; border-radius: 12px; }
          .slip-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1a2e6e; padding-bottom: 16px; margin-bottom: 20px; }
          .slip-logo { font-size: 1.4rem; font-weight: 800; color: #1a2e6e; }
          .slip-logo span { color: #f97316; }
          .slip-code { font-size: 1.1rem; font-weight: 800; color: #1a2e6e; background: #eff3ff; padding: 6px 14px; border-radius: 8px; letter-spacing: 1px; }
          .slip-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
          .slip-section { background: #f8fafc; border-radius: 8px; padding: 14px 16px; }
          .slip-section-title { font-size: .7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 10px; }
          .slip-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9; font-size: .82rem; }
          .slip-row:last-child { border-bottom: none; }
          .slip-label { color: #94a3b8; }
          .slip-value { font-weight: 600; color: #1e293b; text-align: right; max-width: 60%; }
          .slip-status { text-align: center; padding: 12px; background: #f0fdf4; border-radius: 8px; margin-bottom: 16px; }
          .slip-status-label { font-size: .75rem; color: #64748b; margin-bottom: 4px; }
          .slip-status-value { font-size: 1rem; font-weight: 800; color: #166534; }
          .slip-footer { text-align: center; font-size: .75rem; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 14px; margin-top: 4px; }
          .slip-barcode { font-family: monospace; font-size: 1.1rem; letter-spacing: 4px; color: #1a2e6e; display: block; margin: 4px 0; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  const date = new Date(parcel.created_at).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20, padding: '28px 24px',
          width: 660, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 8px 40px rgba(0,0,0,.16)',
        }}
      >
        {/* Modal header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontSize:'1.1rem', fontWeight:800, color:'#1a2e6e' }}>Tracking Slip</h2>
          <div style={{ display:'flex', gap:10 }}>
            <button
              onClick={handlePrint}
              style={{
                padding:'10px 20px', borderRadius:10, border:'none',
                background:'#1a2e6e', color:'#fff', fontFamily:'inherit',
                fontWeight:700, fontSize:'.88rem', cursor:'pointer',
                display:'flex', alignItems:'center', gap:8,
              }}
            >
              <PrinterIcon size={15}/> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{
                padding:'10px 16px', borderRadius:10, border:'1.5px solid #e2e8f0',
                background:'#f8fafc', color:'#64748b', fontFamily:'inherit',
                fontWeight:700, fontSize:'.88rem', cursor:'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Slip preview */}
        <div ref={slipRef}>
          <div className="slip">
            {/* Header */}
            <div className="slip-header">
              <div className="slip-logo">Deliver<span>It</span></div>
              <div>
                <div style={{ fontSize:'.7rem', color:'#94a3b8', marginBottom:4, textAlign:'right' }}>TRACKING CODE</div>
                <div className="slip-code">{parcel.tracking_code}</div>
              </div>
            </div>

            {/* Status */}
            <div className="slip-status">
              <div className="slip-status-label">CURRENT STATUS</div>
              <div className="slip-status-value">{STATUS_LABELS[parcel.status] || parcel.status}</div>
            </div>

            {/* Info grid */}
            <div className="slip-grid">
              {/* Sender */}
              <div className="slip-section">
                <div className="slip-section-title">Sender</div>
                <div className="slip-row"><span className="slip-label">Name</span><span className="slip-value">{parcel.sender_name || '—'}</span></div>
                <div className="slip-row"><span className="slip-label">Phone</span><span className="slip-value">{parcel.sender_phone || '—'}</span></div>
                <div className="slip-row"><span className="slip-label">Wilaya</span><span className="slip-value">{parcel.origin_wilaya || parcel.pickup_location || '—'}</span></div>
              </div>

              {/* Receiver */}
              <div className="slip-section">
                <div className="slip-section-title">Receiver</div>
                <div className="slip-row"><span className="slip-label">Name</span><span className="slip-value">{parcel.receiver_name}</span></div>
                <div className="slip-row"><span className="slip-label">Phone</span><span className="slip-value">{parcel.receiver_phone}</span></div>
                <div className="slip-row"><span className="slip-label">Wilaya</span><span className="slip-value">{parcel.destination_wilaya || parcel.destination || '—'}</span></div>
              </div>
            </div>

            {/* Parcel details */}
            <div className="slip-section" style={{ marginBottom: 16 }}>
              <div className="slip-section-title">Parcel Details</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
                <div className="slip-row"><span className="slip-label">Description</span><span className="slip-value">{parcel.description || '—'}</span></div>
                <div className="slip-row"><span className="slip-label">Weight</span><span className="slip-value">{parcel.weight ? `${parcel.weight} kg` : '—'}</span></div>
                <div className="slip-row"><span className="slip-label">Payment</span><span className="slip-value">{parcel.payment_method === 'cash' ? 'Cash on Delivery' : 'Online Payment'}</span></div>
                <div className="slip-row"><span className="slip-label">Type</span><span className="slip-value">{parcel.delivery_type === 'inter' ? 'Inter-wilaya' : 'Same wilaya'}</span></div>
                <div className="slip-row"><span className="slip-label">Address</span><span className="slip-value">{parcel.delivery_address || '—'}</span></div>
                <div className="slip-row"><span className="slip-label">Date</span><span className="slip-value">{date}</span></div>
              </div>
            </div>

            {/* Footer */}
            <div className="slip-footer">
              <span className="slip-barcode">||| {parcel.tracking_code} |||</span>
              <p>DeliverIt — Algeria's Trusted Delivery Network</p>
              <p style={{ marginTop:4 }}>Generated on {new Date().toLocaleString('en-GB')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
