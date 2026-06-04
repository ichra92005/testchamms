import { useState } from 'react'
import { staffRegister } from '../../services/api'
import { validateName, validateStaffId, validatePhone, validateEmail, validatePassword } from '../../utils/validation'
import { ShieldIcon, BuildingIcon, TruckIcon, CheckIcon, XIcon, MapPinIcon, PhoneIcon, UserIcon, AlertIcon } from '../Icons'
import WilayaCommuneSelector from '../WilayaCommuneSelector'

const ROLES = [
  { key: 'admin',  label: 'Admin',  icon: <ShieldIcon size={18}/> },
  { key: 'agency', label: 'Agent',  icon: <BuildingIcon size={18}/> },
  { key: 'driver', label: 'Driver', icon: <TruckIcon size={18}/> },
]

const ERR = ({ msg }) => msg
  ? <p style={{color:'#dc2626',fontSize:'.75rem',marginTop:4,display:'flex',alignItems:'center',gap:3}}><AlertIcon size={13}/> {msg}</p>
  : null

export default function CreateStaffModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name:'', staffId:'', phone:'', email:'', password:'',
    role:'agency', driver_type:'intra',
    wilaya:'', wilaya_commune:'',
    route_from:'', route_from_commune:'',
    route_to:'',   route_to_commune:'',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading]         = useState(false)

  const u = (k) => (v) => {
    setForm(f => ({ ...f, [k]: v }))
    setFieldErrors(e => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    const nameErr = validateName(form.name);       if (nameErr) e.name     = nameErr
    const idErr   = validateStaffId(form.staffId); if (idErr)   e.staffId  = idErr
    const phErr   = validatePhone(form.phone);     if (phErr)   e.phone    = phErr
    const emErr   = validateEmail(form.email);     if (emErr)   e.email    = emErr
    const pwErr   = validatePassword(form.password); if (pwErr) e.password = pwErr
    if (form.role === 'driver') {
      if (form.driver_type === 'intra') {
        if (!form.wilaya)         e.wilaya         = "Please select the driver's wilaya"
        if (!form.wilaya_commune) e.wilaya_commune = "Please select the commune"
      }
      if (form.driver_type === 'inter') {
        if (!form.route_from)          e.route_from          = 'Please select the origin wilaya'
        if (!form.route_from_commune)  e.route_from_commune  = 'Please select the origin commune'
        if (!form.route_to)            e.route_to            = 'Please select the destination wilaya'
        if (!form.route_to_commune)    e.route_to_commune    = 'Please select the destination commune'
      }
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setLoading(true); setGlobalError('')
    try {
      await staffRegister({
        name:        form.name,
        staffId:     form.staffId,
        phone:       form.phone,
        email:       form.email,
        password:    form.password,
        role:        form.role,
        driver_type: form.driver_type,
        wilaya:      form.wilaya_commune ? `${form.wilaya} - ${form.wilaya_commune}` : form.wilaya,
        route_from:  form.route_from_commune ? `${form.route_from} - ${form.route_from_commune}` : form.route_from,
        route_to:    form.route_to_commune   ? `${form.route_to} - ${form.route_to_commune}`     : form.route_to,
      })
      onSuccess()
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Failed to create account.')
    } finally { setLoading(false) }
  }

  const routeFromLabel = form.route_from_commune ? `${form.route_from} — ${form.route_from_commune}` : form.route_from
  const routeToLabel   = form.route_to_commune   ? `${form.route_to} — ${form.route_to_commune}`     : form.route_to

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{width:560,maxHeight:'90vh',overflowY:'auto'}} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><XIcon size={18}/></button>
        <h2 className="modal-title">Create Staff Account</h2>
        <p className="modal-sub">Add a new agent or driver to the system</p>

        {globalError && <div className="form-error">{globalError}</div>}

        <form onSubmit={handleSubmit}>
          {/* Role selector */}
          <div className="field-group">
            <label className="field-label">Role</label>
            <div style={{display:'flex',gap:10}}>
              {ROLES.map(r => (
                <button type="button" key={r.key} className={`role-btn ${form.role===r.key?'role-active':''}`}
                  onClick={() => u('role')(r.key)} style={{flex:1}}>
                  {r.icon} {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Driver type + route */}
          {form.role === 'driver' && (
            <div className="field-group">
              <label className="field-label">Driver Type <span style={{color:'#dc2626'}}>*</span></label>
              <div style={{display:'flex',gap:10}}>
                <button type="button" onClick={() => u('driver_type')('intra')}
                  style={{flex:1,padding:'12px 8px',borderRadius:10,border:`1.5px solid ${form.driver_type==='intra'?'#1a2e6e':'#e2e8f0'}`,background:form.driver_type==='intra'?'#eff3ff':'#f8fafc',fontFamily:'inherit',fontWeight:700,fontSize:'.88rem',color:form.driver_type==='intra'?'#1a2e6e':'#64748b',cursor:'pointer',transition:'all .2s',display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                  <span style={{display:'flex',alignItems:'center',gap:6}}><BuildingIcon size={16}/> Intra-Wilaya</span>
                  <span style={{fontSize:'.72rem',fontWeight:400,opacity:.7}}>Same wilaya delivery</span>
                </button>
                <button type="button" onClick={() => u('driver_type')('inter')}
                  style={{flex:1,padding:'12px 8px',borderRadius:10,border:`1.5px solid ${form.driver_type==='inter'?'#1a2e6e':'#e2e8f0'}`,background:form.driver_type==='inter'?'#eff3ff':'#f8fafc',fontFamily:'inherit',fontWeight:700,fontSize:'.88rem',color:form.driver_type==='inter'?'#1a2e6e':'#64748b',cursor:'pointer',transition:'all .2s',display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                  <span style={{display:'flex',alignItems:'center',gap:6}}><TruckIcon size={16}/> Inter-Wilaya</span>
                  <span style={{fontSize:'.72rem',fontWeight:400,opacity:.7}}>Between wilayas</span>
                </button>
              </div>
            </div>
          )}

          {form.role === 'driver' && form.driver_type === 'intra' && (
            <>
              <WilayaCommuneSelector
                wilayaLabel="Assigned Wilaya" communeLabel="Assigned Commune"
                wilayaValue={form.wilaya} communeValue={form.wilaya_commune}
                onWilayaChange={w => { u('wilaya')(w); u('wilaya_commune')('') }}
                onCommuneChange={u('wilaya_commune')}
                required
                wilayaError={fieldErrors.wilaya} communeError={fieldErrors.wilaya_commune}
              />
            </>
          )}

          {form.role === 'driver' && form.driver_type === 'inter' && (
            <div style={{background:'#f8fafc',border:'1.5px solid #e2e8f0',borderRadius:12,padding:'16px',marginBottom:16}}>
              <p style={{fontSize:'.82rem',fontWeight:700,color:'#1a2e6e',marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
                <TruckIcon size={14}/> Route (back and forth between these two locations)
              </p>
              <WilayaCommuneSelector
                wilayaLabel="From Wilaya" communeLabel="From Commune"
                wilayaValue={form.route_from} communeValue={form.route_from_commune}
                onWilayaChange={w => { u('route_from')(w); u('route_from_commune')('') }}
                onCommuneChange={u('route_from_commune')}
                required
                wilayaError={fieldErrors.route_from} communeError={fieldErrors.route_from_commune}
              />
              <div style={{textAlign:'center',fontSize:'1.2rem',color:'#94a3b8',margin:'-4px 0 8px'}}>⇅</div>
              <WilayaCommuneSelector
                wilayaLabel="To Wilaya" communeLabel="To Commune"
                wilayaValue={form.route_to} communeValue={form.route_to_commune}
                onWilayaChange={w => { u('route_to')(w); u('route_to_commune')('') }}
                onCommuneChange={u('route_to_commune')}
                required
                wilayaError={fieldErrors.route_to} communeError={fieldErrors.route_to_commune}
              />
              {form.route_from && form.route_to && (
                <div style={{marginTop:8,padding:'8px 12px',background:'#eff3ff',borderRadius:8,fontSize:'.82rem',fontWeight:600,color:'#1a2e6e',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  <MapPinIcon size={14}/> {routeFromLabel} ↔ {routeToLabel}
                </div>
              )}
            </div>
          )}

          {/* Core fields */}
          <div className="admin-form-grid">
            <div className="field-group">
              <label className="field-label">Full Name <span style={{color:'#dc2626'}}>*</span></label>
              <div className={`field-wrap ${fieldErrors.name ? 'field-wrap-error' : ''}`}>
                <span className="field-icon"><UserIcon size={15}/></span>
                <input className="field-input" placeholder="Mohamed Amine" value={form.name}
                  onChange={e => u('name')(e.target.value)}/>
              </div>
              <ERR msg={fieldErrors.name}/>
            </div>

            <div className="field-group">
              <label className="field-label">Staff ID <span style={{color:'#dc2626'}}>*</span></label>
              <div className={`field-wrap ${fieldErrors.staffId ? 'field-wrap-error' : ''}`}>
                <input className="field-input" placeholder="AG-001" value={form.staffId}
                  onChange={e => u('staffId')(e.target.value.toUpperCase())}/>
              </div>
              <ERR msg={fieldErrors.staffId}/>
            </div>

            <div className="field-group">
              <label className="field-label">Phone <span style={{color:'#dc2626'}}>*</span></label>
              <div className={`field-wrap ${fieldErrors.phone ? 'field-wrap-error' : ''}`}>
                <span className="field-icon"><PhoneIcon size={15}/></span>
                <input className="field-input" placeholder="0555 000 000" value={form.phone}
                  onChange={e => u('phone')(e.target.value)}/>
              </div>
              <ERR msg={fieldErrors.phone}/>
            </div>

            <div className="field-group">
              <label className="field-label">Email <span style={{color:'#dc2626'}}>*</span></label>
              <div className={`field-wrap ${fieldErrors.email ? 'field-wrap-error' : ''}`}>
                <input className="field-input" type="text" placeholder="staff@deliverit.dz" value={form.email}
                  onChange={e => u('email')(e.target.value)}/>
              </div>
              <ERR msg={fieldErrors.email}/>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Password <span style={{color:'#dc2626'}}>*</span></label>
            <div className={`field-wrap ${fieldErrors.password ? 'field-wrap-error' : ''}`}>
              <input className="field-input" type="password" placeholder="Min 8 chars with letters and numbers"
                value={form.password} onChange={e => u('password')(e.target.value)}/>
            </div>
            <ERR msg={fieldErrors.password}/>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <span style={{display:'flex',alignItems:'center',gap:8}}>
                <CheckIcon size={15}/> {loading ? 'Creating...' : 'Create Account'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
