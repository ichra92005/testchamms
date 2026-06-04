import { useState } from 'react'
import { createParcel } from '../../services/api'
import { validateName, validatePhone, validateWeight, validateDescription } from '../../utils/validation'
import { UserIcon, PhoneIcon, HomeIcon, WeightIcon, CashIcon, CardIcon, CheckIcon, AlertIcon } from '../Icons'
import WilayaCommuneSelector from '../WilayaCommuneSelector'

const ERR = ({ msg }) => msg
  ? <p style={{color:'#dc2626',fontSize:'.75rem',marginTop:4,display:'flex',alignItems:'center',gap:3}}><AlertIcon size={13}/> {msg}</p>
  : null

function Field({ label, icon, type = 'text', placeholder, value, onChange, required, error }) {
  return (
    <div className="field-group">
      <label className="field-label">{label} {required && <span style={{color:'#dc2626'}}>*</span>}</label>
      <div className={`field-wrap ${error ? 'field-wrap-error' : ''}`}>
        {icon && <span className="field-icon">{icon}</span>}
        <input className="field-input" type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}/>
      </div>
      <ERR msg={error}/>
    </div>
  )
}

export default function CreateParcelForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    sender_name:'', sender_phone:'', origin_wilaya:'', origin_commune:'',
    receiver_name:'', receiver_phone:'', destination_wilaya:'', destination_commune:'', delivery_address:'',
    description:'', weight:'', payment_method:'cash',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const u = (k) => (v) => {
    setForm(f => ({ ...f, [k]: v }))
    setFieldErrors(e => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    const nameErr = validateName(form.sender_name);   if (nameErr)  e.sender_name      = nameErr
    const sPhErr  = validatePhone(form.sender_phone); if (sPhErr)   e.sender_phone     = sPhErr
    if (!form.origin_wilaya)    e.origin_wilaya    = 'Please select origin wilaya'
    if (!form.origin_commune)   e.origin_commune   = 'Please select origin commune'
    const rNameErr = validateName(form.receiver_name); if (rNameErr) e.receiver_name   = rNameErr
    const rPhErr   = validatePhone(form.receiver_phone); if (rPhErr) e.receiver_phone  = rPhErr
    if (!form.destination_wilaya)  e.destination_wilaya  = 'Please select destination wilaya'
    if (!form.destination_commune) e.destination_commune = 'Please select destination commune'
    if (!form.delivery_address?.trim()) e.delivery_address = 'Delivery address is required'
    if (form.weight) {
      const wErr = validateWeight(form.weight); if (wErr) e.weight = wErr
    }
    const descErr = validateDescription(form.description); if (descErr) e.description = descErr
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setLoading(true); setError('')
    try {
      const res = await createParcel({
        sender_name:      form.sender_name,
        sender_phone:     form.sender_phone,
        pickup_location:  `${form.origin_wilaya} - ${form.origin_commune}`,
        receiver_name:    form.receiver_name,
        receiver_phone:   form.receiver_phone,
        destination:      `${form.destination_wilaya} - ${form.destination_commune}`,
        delivery_address: form.delivery_address,
        description:      form.description,
        weight:           form.weight,
        payment_method:   form.payment_method,
      })
      onSuccess(res.data.tracking_code)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create parcel.')
    } finally { setLoading(false) }
  }

  const sameWilaya   = form.origin_wilaya && form.destination_wilaya && form.origin_wilaya === form.destination_wilaya
  const originLabel  = form.origin_commune ? `${form.origin_wilaya} — ${form.origin_commune}` : form.origin_wilaya
  const destLabel    = form.destination_commune ? `${form.destination_wilaya} — ${form.destination_commune}` : form.destination_wilaya
  const descLen      = form.description.length

  return (
    <div className="form-card">
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        <div className="form-grid">
          <div>
            <h3 className="form-section-title">Sender Information</h3>
            <Field label="Sender Full Name"  placeholder="Full name"     value={form.sender_name}  onChange={u('sender_name')}  required icon={<UserIcon size={15}/>}  error={fieldErrors.sender_name}/>
            <Field label="Sender Phone"      placeholder="0555 000 000"  value={form.sender_phone} onChange={u('sender_phone')} required icon={<PhoneIcon size={15}/>} error={fieldErrors.sender_phone}/>
            <WilayaCommuneSelector
              wilayaLabel="Origin Wilaya"   communeLabel="Origin Commune"
              wilayaValue={form.origin_wilaya} communeValue={form.origin_commune}
              onWilayaChange={w => { u('origin_wilaya')(w); u('origin_commune')('') }}
              onCommuneChange={u('origin_commune')}
              required
              wilayaError={fieldErrors.origin_wilaya} communeError={fieldErrors.origin_commune}
            />

            <h3 className="form-section-title" style={{marginTop:24}}>Receiver Information</h3>
            <Field label="Receiver Full Name" placeholder="Full name"     value={form.receiver_name}  onChange={u('receiver_name')}  required icon={<UserIcon size={15}/>}  error={fieldErrors.receiver_name}/>
            <Field label="Receiver Phone"     placeholder="0555 000 000"  value={form.receiver_phone} onChange={u('receiver_phone')} required icon={<PhoneIcon size={15}/>} error={fieldErrors.receiver_phone}/>
            <WilayaCommuneSelector
              wilayaLabel="Destination Wilaya"   communeLabel="Destination Commune"
              wilayaValue={form.destination_wilaya} communeValue={form.destination_commune}
              onWilayaChange={w => { u('destination_wilaya')(w); u('destination_commune')('') }}
              onCommuneChange={u('destination_commune')}
              required
              wilayaError={fieldErrors.destination_wilaya} communeError={fieldErrors.destination_commune}
            />
            <Field label="Delivery Address" placeholder="Street, neighbourhood" value={form.delivery_address} onChange={u('delivery_address')} required icon={<HomeIcon size={15}/>} error={fieldErrors.delivery_address}/>
          </div>

          <div>
            <h3 className="form-section-title">Parcel Details</h3>

            <div className="field-group">
              <label className="field-label">Description</label>
              <textarea
                className={`field-textarea ${fieldErrors.description ? 'field-wrap-error' : ''}`}
                placeholder="What's inside the parcel?"
                value={form.description}
                onChange={e => u('description')(e.target.value)}
                rows={4}
                maxLength={220}
              />
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:4}}>
                <ERR msg={fieldErrors.description}/>
                <span style={{fontSize:'.72rem',color: descLen > 180 ? (descLen > 200 ? '#dc2626' : '#f97316') : '#94a3b8',marginLeft:'auto'}}>
                  {descLen}/200
                </span>
              </div>
            </div>

            <Field label="Weight (kg)" type="number" placeholder="0.0" value={form.weight} onChange={u('weight')} icon={<WeightIcon size={15}/>} error={fieldErrors.weight}/>

            <div className="field-group">
              <label className="field-label">Payment Method <span style={{color:'#dc2626'}}>*</span></label>
              <div className="payment-options">
                <label className={`payment-option ${form.payment_method==='cash'?'selected':''}`}>
                  <input type="radio" name="payment" value="cash" checked={form.payment_method==='cash'} onChange={() => u('payment_method')('cash')}/>
                  <span style={{display:'flex',alignItems:'center',gap:6}}><CashIcon size={15}/> Cash on Delivery</span>
                </label>
                <label className={`payment-option ${form.payment_method==='online'?'selected':''}`}>
                  <input type="radio" name="payment" value="online" checked={form.payment_method==='online'} onChange={() => u('payment_method')('online')}/>
                  <span style={{display:'flex',alignItems:'center',gap:6}}><CardIcon size={15}/> Online Payment</span>
                </label>
              </div>
            </div>

            {form.origin_wilaya && form.destination_wilaya && (
              <div className={`delivery-type-badge ${sameWilaya?'intra':'inter'}`}>
                {sameWilaya ? 'Same wilaya — Direct delivery' : `Inter-wilaya: ${originLabel} → ${destLabel}`}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            <span style={{display:'flex',alignItems:'center',gap:8}}>
              <CheckIcon size={15}/> {loading ? 'Registering...' : 'Register Parcel'}
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}
