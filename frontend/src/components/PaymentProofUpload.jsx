import { useState, useRef } from 'react'
import api from '../services/api'
import { CheckIcon, CardIcon } from './Icons'

export default function PaymentProofUpload({ parcel, onSuccess }) {
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [uploaded, setUploaded] = useState(!!parcel.payment_proof)
  const inputRef                = useRef(null)

  if (parcel.payment_method !== 'online') return null

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { setError('File too large. Max 5MB.'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError('')
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true); setError('')
    try {
      const formData = new FormData()
      formData.append('proof', file)
      await api.post(`/parcels/${parcel.tracking_code}/payment-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUploaded(true)
      onSuccess?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      background: uploaded ? '#f0fdf4' : '#eff6ff',
      border: `1.5px solid ${uploaded ? '#bbf7d0' : '#bfdbfe'}`,
      borderRadius: 16, padding: '20px 24px', marginBottom: 28,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: uploaded ? 0 : 16 }}>
        <CardIcon size={18} style={{ color: uploaded ? '#166534' : '#1d4ed8' }}/>
        <div>
          <p style={{ fontWeight:700, color: uploaded?'#166534':'#1d4ed8', fontSize:'.92rem' }}>
            {uploaded ? 'Payment proof submitted' : 'Online payment — upload proof'}
          </p>
          {!uploaded && (
            <p style={{ fontSize:'.82rem', color:'#64748b', marginTop:2 }}>
              Please upload a photo or screenshot of your payment receipt
            </p>
          )}
        </div>
        {uploaded && <CheckIcon size={20} style={{ color:'#22c55e', marginLeft:'auto' }}/>}
      </div>

      {!uploaded && (
        <>
          {error && <div className="form-error" style={{marginBottom:12}}>{error}</div>}

          {preview ? (
            <div style={{ marginBottom:14 }}>
              <img src={preview} alt="Preview" style={{ maxHeight:180, borderRadius:10, border:'1px solid #e2e8f0', display:'block' }}/>
              <button
                onClick={() => { setFile(null); setPreview(null) }}
                style={{ marginTop:8, background:'none', border:'none', color:'#94a3b8', fontSize:'.82rem', cursor:'pointer' }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              style={{
                border: '2px dashed #bfdbfe', borderRadius:12, padding:'24px 16px',
                textAlign:'center', cursor:'pointer', marginBottom:14,
                background:'#fff', transition:'border-color .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor='#1d4ed8'}
              onMouseLeave={e => e.currentTarget.style.borderColor='#bfdbfe'}
            >
              <p style={{ fontSize:'.88rem', color:'#64748b', fontWeight:600 }}>
                Click to select image
              </p>
              <p style={{ fontSize:'.78rem', color:'#94a3b8', marginTop:4 }}>
                JPG, PNG or WEBP — max 5MB
              </p>
            </div>
          )}

          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{display:'none'}}/>

          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={!file || loading}
            style={{ display:'flex', alignItems:'center', gap:8 }}
          >
            <CheckIcon size={15}/>
            {loading ? 'Uploading...' : 'Submit Payment Proof'}
          </button>
        </>
      )}
    </div>
  )
}
