import { useEffect, useRef } from 'react'
import { PackageIcon, MapPinIcon, LinkIcon, PrinterIcon } from '../Icons'

export default function DeliverySlip({ parcel, onClose }) {
  const qrRef = useRef(null)

  const trackingUrl = `${window.location.origin}/?track=${parcel.tracking_code}`

  useEffect(() => {
    // Load QR code library
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
    script.onload = () => {
      if (qrRef.current && window.QRCode) {
        qrRef.current.innerHTML = ''
        new window.QRCode(qrRef.current, {
          text: trackingUrl,
          width: 120,
          height: 120,
          colorDark: '#1a2e6e',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.H,
        })
      }
    }
    document.head.appendChild(script)
  }, [trackingUrl])

  const handlePrint = () => {
    const qrImg = qrRef.current?.querySelector('img')?.src ||
                  qrRef.current?.querySelector('canvas')?.toDataURL() || ''

    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Delivery Slip — ${parcel.tracking_code}</title>
        <meta charset="UTF-8"/>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; padding: 20px; }
          .slip { max-width: 700px; margin: 0 auto; border: 2px solid #1a2e6e; border-radius: 12px; overflow: hidden; }

          .slip-header {
            background: #1a2e6e; color: #fff;
            display: flex; justify-content: space-between; align-items: center;
            padding: 16px 24px;
          }
          .slip-logo { font-size: 1.5rem; font-weight: 800; letter-spacing: -.5px; }
          .slip-logo span { color: #f97316; }
          .slip-title { font-size: .85rem; opacity: .7; margin-top: 2px; }
          .slip-date { font-size: .78rem; opacity: .7; text-align: right; }

          .slip-tracking {
            background: #f8fafc; border-bottom: 2px dashed #e2e8f0;
            display: flex; justify-content: space-between; align-items: center;
            padding: 14px 24px;
          }
          .slip-code-label { font-size: .7rem; color: #94a3b8; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 4px; }
          .slip-code { font-size: 1.4rem; font-weight: 800; color: #1a2e6e; letter-spacing: 2px; }
          .slip-status { background: #eff3ff; color: #1a2e6e; padding: 6px 14px; border-radius: 999px; font-size: .78rem; font-weight: 700; }

          .slip-body { display: grid; grid-template-columns: 1fr 1fr; }

          .slip-section { padding: 20px 24px; border-right: 1px solid #f1f5f9; }
          .slip-section:last-child { border-right: none; }
          .slip-section-title {
            font-size: .7rem; font-weight: 700; color: #94a3b8;
            text-transform: uppercase; letter-spacing: .08em;
            margin-bottom: 12px; padding-bottom: 8px;
            border-bottom: 1px solid #f1f5f9;
          }
          .slip-field { margin-bottom: 10px; }
          .slip-field-label { font-size: .7rem; color: #94a3b8; margin-bottom: 2px; }
          .slip-field-value { font-size: .88rem; font-weight: 600; color: #1e293b; }

          .slip-bottom {
            border-top: 2px dashed #e2e8f0;
            display: flex; align-items: center; justify-content: space-between;
            padding: 16px 24px; gap: 20px;
          }
          .slip-qr-wrap { text-align: center; }
          .slip-qr-wrap img { width: 120px; height: 120px; display: block; }
          .slip-qr-label { font-size: .7rem; color: #94a3b8; margin-top: 6px; }
          .slip-parcel-details { flex: 1; }
          .slip-detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f8fafc; font-size: .82rem; }
          .slip-detail-row:last-child { border-bottom: none; }
          .slip-detail-label { color: #94a3b8; }
          .slip-detail-value { font-weight: 600; color: #1e293b; }

          .slip-footer {
            background: #f8fafc; padding: 10px 24px;
            display: flex; justify-content: space-between; align-items: center;
            font-size: .75rem; color: #94a3b8; border-top: 1px solid #f1f5f9;
          }
          .barcode { font-family: monospace; font-size: .9rem; letter-spacing: 3px; color: #1a2e6e; }

          @media print {
            body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .slip { border-radius: 0; border: 2px solid #1a2e6e; }
          }
        </style>
      </head>
      <body>
        <div class="slip">
          <!-- Header -->
          <div class="slip-header">
            <div>
              <div class="slip-logo">Deliver<span>It</span></div>
              <div class="slip-title">Algeria's Trusted Delivery Network</div>
            </div>
            <div class="slip-date">
              <div>Printed on</div>
              <div style="font-weight:600;color:#fff">${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</div>
            </div>
          </div>

          <!-- Tracking code -->
          <div class="slip-tracking">
            <div>
              <div class="slip-code-label">Tracking Number</div>
              <div class="slip-code">${parcel.tracking_code}</div>
            </div>
            <div>
              <div class="slip-code-label">Delivery Type</div>
              <div class="slip-status">${parcel.delivery_type === 'inter' ? 'Inter-Wilaya' : 'Same Wilaya'}</div>
            </div>
            <div>
              <div class="slip-code-label">Payment</div>
              <div class="slip-status">${parcel.payment_method === 'cash' ? 'Cash on Delivery' : 'Online Payment'}</div>
            </div>
          </div>

          <!-- Sender / Receiver -->
          <div class="slip-body">
            <div class="slip-section">
              <div class="slip-section-title"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>Sender</div>
              <div class="slip-field"><div class="slip-field-label">Full Name</div><div class="slip-field-value">${parcel.sender_name || '—'}</div></div>
              <div class="slip-field"><div class="slip-field-label">Phone Number</div><div class="slip-field-value">${parcel.sender_phone || '—'}</div></div>
              <div class="slip-field"><div class="slip-field-label">Origin Wilaya</div><div class="slip-field-value">${parcel.origin_wilaya || parcel.pickup_location || '—'}</div></div>
            </div>
            <div class="slip-section">
              <div class="slip-section-title"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>Receiver</div>
              <div class="slip-field"><div class="slip-field-label">Full Name</div><div class="slip-field-value">${parcel.receiver_name}</div></div>
              <div class="slip-field"><div class="slip-field-label">Phone Number</div><div class="slip-field-value">${parcel.receiver_phone}</div></div>
              <div class="slip-field"><div class="slip-field-label">Destination Wilaya</div><div class="slip-field-value">${parcel.destination_wilaya || parcel.destination || '—'}</div></div>
              <div class="slip-field"><div class="slip-field-label">Delivery Address</div><div class="slip-field-value">${parcel.delivery_address || '—'}</div></div>
            </div>
          </div>

          <!-- QR + parcel details -->
          <div class="slip-bottom">
            <div class="slip-qr-wrap">
              <img src="${qrImg}" alt="QR Code"/>
              <div class="slip-qr-label">Scan to track</div>
            </div>
            <div class="slip-parcel-details">
              <div style="font-size:.7rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Parcel Information</div>
              <div class="slip-detail-row"><span class="slip-detail-label">Description</span><span class="slip-detail-value">${parcel.description || '—'}</span></div>
              <div class="slip-detail-row"><span class="slip-detail-label">Weight</span><span class="slip-detail-value">${parcel.weight ? parcel.weight + ' kg' : '—'}</span></div>
              <div class="slip-detail-row"><span class="slip-detail-label">Registration Date</span><span class="slip-detail-value">${new Date(parcel.created_at).toLocaleDateString('en-GB')}</span></div>
              <div class="slip-detail-row"><span class="slip-detail-label">Tracking URL</span><span class="slip-detail-value" style="font-size:.75rem;color:#1a2e6e">${trackingUrl}</span></div>
            </div>
          </div>

          <!-- Footer -->
          <div class="slip-footer">
            <div class="barcode">||| ${parcel.tracking_code} |||</div>
            <div>DeliverIt — info@deliverit.dz</div>
          </div>
        </div>
      </body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 600)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20, padding: '24px',
          width: 720, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 8px 40px rgba(0,0,0,.16)',
        }}
      >
        {/* Modal header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:'1.1rem', fontWeight:800, color:'#1a2e6e' }}>Delivery Slip</h2>
            <p style={{ fontSize:'.82rem', color:'#94a3b8', marginTop:2 }}>Print or save as PDF to give to the client</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={handlePrint} style={{ padding:'10px 20px', borderRadius:10, border:'none', background:'#1a2e6e', color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:'.88rem', cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
              <PrinterIcon size={15}/> Print / Save PDF
            </button>
            <button onClick={onClose} style={{ padding:'10px 16px', borderRadius:10, border:'1.5px solid #e2e8f0', background:'#f8fafc', color:'#64748b', fontFamily:'inherit', fontWeight:700, fontSize:'.88rem', cursor:'pointer' }}>
              Close
            </button>
          </div>
        </div>

        {/* Preview */}
        <div style={{ border:'2px solid #1a2e6e', borderRadius:12, overflow:'hidden', fontSize:'14px' }}>
          {/* Header */}
          <div style={{ background:'#1a2e6e', color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 24px' }}>
            <div>
              <div style={{ fontSize:'1.3rem', fontWeight:800 }}>Deliver<span style={{ color:'#f97316' }}>It</span></div>
              <div style={{ fontSize:'.78rem', opacity:.7, marginTop:2 }}>Algeria's Trusted Delivery Network</div>
            </div>
            <div style={{ textAlign:'right', fontSize:'.78rem', opacity:.7 }}>
              <div>Printed on</div>
              <div style={{ fontWeight:600, color:'#fff' }}>{new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</div>
            </div>
          </div>

          {/* Tracking */}
          <div style={{ background:'#f8fafc', borderBottom:'2px dashed #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 24px', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontSize:'.65rem', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>Tracking Number</div>
              <div style={{ fontSize:'1.3rem', fontWeight:800, color:'#1a2e6e', letterSpacing:2 }}>{parcel.tracking_code}</div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <span style={{ background:'#eff3ff', color:'#1a2e6e', padding:'5px 12px', borderRadius:999, fontSize:'.75rem', fontWeight:700 }}>
                {parcel.delivery_type === 'inter' ? 'Inter-Wilaya' : 'Same Wilaya'}
              </span>
              <span style={{ background:'#eff3ff', color:'#1a2e6e', padding:'5px 12px', borderRadius:999, fontSize:'.75rem', fontWeight:700 }}>
                {parcel.payment_method === 'cash' ? 'Cash on Delivery' : 'Online Payment'}
              </span>
            </div>
          </div>

          {/* Sender / Receiver */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:'1px solid #f1f5f9' }}>
            {[
              { title:<><PackageIcon size={11}/> Sender</>, fields: [
                { label:'Full Name',    value: parcel.sender_name || '—' },
                { label:'Phone',        value: parcel.sender_phone || '—' },
                { label:'Origin Wilaya', value: parcel.origin_wilaya || parcel.pickup_location || '—' },
              ]},
              { title:<><MapPinIcon size={11}/> Receiver</>, fields: [
                { label:'Full Name',         value: parcel.receiver_name },
                { label:'Phone',             value: parcel.receiver_phone },
                { label:'Destination Wilaya', value: parcel.destination_wilaya || parcel.destination || '—' },
                { label:'Delivery Address',   value: parcel.delivery_address || '—' },
              ]},
            ].map((col, i) => (
              <div key={i} style={{ padding:'18px 24px', borderRight: i===0 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ fontSize:'.65rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12, paddingBottom:8, borderBottom:'1px solid #f1f5f9' }}>{col.title}</div>
                {col.fields.map(f => (
                  <div key={f.label} style={{ marginBottom:8 }}>
                    <div style={{ fontSize:'.65rem', color:'#94a3b8' }}>{f.label}</div>
                    <div style={{ fontSize:'.85rem', fontWeight:600, color:'#1e293b' }}>{f.value}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* QR + details */}
          <div style={{ display:'flex', alignItems:'center', padding:'16px 24px', gap:20, borderBottom:'2px dashed #e2e8f0' }}>
            <div style={{ textAlign:'center', flexShrink:0 }}>
              <div ref={qrRef} style={{ width:120, height:120 }}/>
              <div style={{ fontSize:'.65rem', color:'#94a3b8', marginTop:6 }}>Scan to track</div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'.65rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>Parcel Information</div>
              {[
                { label:'Description',       value: parcel.description || '—' },
                { label:'Weight',            value: parcel.weight ? `${parcel.weight} kg` : '—' },
                { label:'Registration Date', value: new Date(parcel.created_at).toLocaleDateString('en-GB') },
              ].map(f => (
                <div key={f.label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f8fafc', fontSize:'.82rem' }}>
                  <span style={{ color:'#94a3b8' }}>{f.label}</span>
                  <span style={{ fontWeight:600, color:'#1e293b' }}>{f.value}</span>
                </div>
              ))}
              <div style={{ marginTop:8, fontSize:'.72rem', color:'#1a2e6e', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                <LinkIcon size={11}/> {trackingUrl}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background:'#f8fafc', padding:'10px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'.72rem', color:'#94a3b8' }}>
            <span style={{ fontFamily:'monospace', letterSpacing:3, color:'#1a2e6e', fontWeight:700 }}>||| {parcel.tracking_code} |||</span>
            <span>DeliverIt — info@deliverit.dz</span>
          </div>
        </div>
      </div>
    </div>
  )
}
