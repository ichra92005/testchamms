import { useState } from 'react'
import { updateAdminUser } from '../../services/api'
import { validateName, validatePhone, validateEmail } from '../../utils/validation'
import { UserIcon, PhoneIcon, ShieldIcon, TruckIcon, BuildingIcon, MapPinIcon, CheckIcon, XIcon, AlertIcon } from '../Icons'

const WILAYAS = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar",
  "Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger",
  "Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma",
  "Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla","Oran","El Bayadh",
  "Illizi","Bordj Bou Arréridj","Boumerdès","El Tarf","Tindouf","Tissemsilt",
  "El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma",
  "Aïn Témouchent","Ghardaïa","Relizane","Timimoun","Bordj Badji Mokhtar",
  "Ouled Djellal","Béni Abbès","In Salah","In Guezzam","Touggourt","Djanet",
  "El M'Ghair","El Meniaa",
]

const ROLES = [
  { key: 'admin',  label: 'Admin',  icon: <ShieldIcon size={16}/> },
  { key: 'agency', label: 'Agent',  icon: <BuildingIcon size={16}/> },
  { key: 'driver', label: 'Driver', icon: <TruckIcon size={16}/> },
  { key: 'client', label: 'Client', icon: <UserIcon size={16}/> },
]

function WilayaSelect({ label, value, onChange }) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <div className="field-wrap">
        <span className="field-icon"><MapPinIcon size={15}/></span>
        <select className="field-input" value={value} onChange={e => onChange(e.target.value)} style={{cursor:'pointer'}}>
          <option value="">Select wilaya...</option>
          {WILAYAS.map((w, i) => <option key={i} value={w}>{String(i+1).padStart(2,'0')} — {w}</option>)}
        </select>
      </div>
    </div>
  )
}

export default function UserDetailModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:        user.name        || '',
    phone:       user.phone       || '',
    email:       user.email       || '',
    role:        user.role        || 'client',
    driver_type: user.driver_type || 'intra',
    wilaya:      user.wilaya      || '',
    route_from:  user.route_from  || '',
    route_to:    user.route_to    || '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [globalError, setGlobalError] = useState('')
  const [success, setSuccess]         = useState(false)
  const [loading, setLoading]         = useState(false)

  const u = (k) => (v) => {
    setForm(f => ({ ...f, [k]: v }))
    setFieldErrors(e => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    const nmErr = validateName(form.name);    if (nmErr) e.name  = nmErr
    const emErr = validateEmail(form.email);  if (emErr) e.email = emErr
    if (form.phone) {
      const phErr = validatePhone(form.phone); if (phErr) e.phone = phErr
    }
    return e
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setLoading(true); setGlobalError('')
    try {
      await updateAdminUser(user.id, form)
      setSuccess(true)
      setTimeout(() => { setSuccess(false); onSaved() }, 1400)
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Failed to update user.')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{width:500,maxHeight:'92vh',overflowY:'auto'}} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><XIcon size={18}/></button>
        <h2 className="modal-title">Edit User</h2>
        <p className="modal-sub">Update account details for <strong>{user.name}</strong></p>

        {/* Read-only identifiers */}
        <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:10,padding:'12px 16px',marginBottom:20,display:'flex',gap:20}}>
          {user.staff_id && (
            <div>
              <div style={{fontSize:'.72rem',color:'#94a3b8',fontWeight:700,letterSpacing:'.05em',marginBottom:3}}>STAFF ID</div>
              <code style={{fontSize:'.83rem',background:'#eff3ff',color:'#1a2e6e',padding:'2px 8px',borderRadius:6,fontWeight:700}}>{user.staff_id}</code>
            </div>
          )}
          <div>
            <div style={{fontSize:'.72rem',color:'#94a3b8',fontWeight:700,letterSpacing:'.05em',marginBottom:3}}>JOINED</div>
            <span style={{fontSize:'.83rem',color:'#475569'}}>{new Date(user.created_at).toLocaleDateString('en-GB')}</span>
          </div>
        </div>

        {globalError && <div className="form-error">{globalError}</div>}
        {success && (
          <div style={{background:'#f0fdf4',color:'#166534',border:'1px solid #bbf7d0',borderRadius:8,padding:'10px 14px',fontSize:'.85rem',marginBottom:16,fontWeight:600}}>
            <CheckIcon size={15}/> User updated successfully!
          </div>
        )}

        <div className="field-group">
          <label className="field-label">Full Name</label>
          <div className={`field-wrap ${fieldErrors.name ? 'field-wrap-error' : ''}`}>
            <span className="field-icon"><UserIcon size={15}/></span>
            <input className="field-input" value={form.name} onChange={e => u('name')(e.target.value)} placeholder="Full name"/>
          </div>
          {fieldErrors.name && <p style={{color:'#dc2626',fontSize:'.75rem',marginTop:4}}><AlertIcon size={13}/> {fieldErrors.name}</p>}
        </div>

        <div className="field-group">
          <label className="field-label">Email Address</label>
          <div className={`field-wrap ${fieldErrors.email ? 'field-wrap-error' : ''}`}>
            <input className="field-input" type="text" value={form.email} onChange={e => u('email')(e.target.value)} placeholder="email@example.com"/>
          </div>
          {fieldErrors.email && <p style={{color:'#dc2626',fontSize:'.75rem',marginTop:4}}><AlertIcon size={13}/> {fieldErrors.email}</p>}
        </div>

        <div className="field-group">
          <label className="field-label">Phone Number</label>
          <div className={`field-wrap ${fieldErrors.phone ? 'field-wrap-error' : ''}`}>
            <span className="field-icon"><PhoneIcon size={15}/></span>
            <input className="field-input" value={form.phone} onChange={e => u('phone')(e.target.value)} placeholder="0555 000 000"/>
          </div>
          {fieldErrors.phone && <p style={{color:'#dc2626',fontSize:'.75rem',marginTop:4}}><AlertIcon size={13}/> {fieldErrors.phone}</p>}
        </div>

        <div className="field-group">
          <label className="field-label">Role</label>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {ROLES.map(r => (
              <button type="button" key={r.key}
                onClick={() => u('role')(r.key)}
                style={{
                  display:'flex',alignItems:'center',gap:6,padding:'8px 14px',
                  borderRadius:8,border:`1.5px solid ${form.role===r.key?'#1a2e6e':'#e2e8f0'}`,
                  background:form.role===r.key?'#eff3ff':'#f8fafc',
                  color:form.role===r.key?'#1a2e6e':'#64748b',
                  fontFamily:'inherit',fontWeight:700,fontSize:'.84rem',cursor:'pointer',transition:'all .15s',
                }}>
                {r.icon} {r.label}
              </button>
            ))}
          </div>
        </div>

        {form.role === 'driver' && (
          <>
            <div className="field-group">
              <label className="field-label">Driver Type</label>
              <div style={{display:'flex',gap:10}}>
                <button type="button" onClick={() => u('driver_type')('intra')}
                  style={{flex:1,padding:'10px 8px',borderRadius:10,border:`1.5px solid ${form.driver_type==='intra'?'#1a2e6e':'#e2e8f0'}`,background:form.driver_type==='intra'?'#eff3ff':'#f8fafc',fontFamily:'inherit',fontWeight:700,fontSize:'.85rem',color:form.driver_type==='intra'?'#1a2e6e':'#64748b',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                  <BuildingIcon size={15}/> Intra-Wilaya
                </button>
                <button type="button" onClick={() => u('driver_type')('inter')}
                  style={{flex:1,padding:'10px 8px',borderRadius:10,border:`1.5px solid ${form.driver_type==='inter'?'#1a2e6e':'#e2e8f0'}`,background:form.driver_type==='inter'?'#eff3ff':'#f8fafc',fontFamily:'inherit',fontWeight:700,fontSize:'.85rem',color:form.driver_type==='inter'?'#1a2e6e':'#64748b',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                  <TruckIcon size={15}/> Inter-Wilaya
                </button>
              </div>
            </div>

            {form.driver_type === 'intra' && (
              <WilayaSelect label="Assigned Wilaya" value={form.wilaya} onChange={u('wilaya')}/>
            )}

            {form.driver_type === 'inter' && (
              <div style={{background:'#f8fafc',border:'1.5px solid #e2e8f0',borderRadius:12,padding:'16px',marginBottom:16}}>
                <p style={{fontSize:'.82rem',color:'#64748b',fontWeight:600,marginBottom:12}}>Inter-Wilaya Route</p>
                <WilayaSelect label="From" value={form.route_from} onChange={u('route_from')}/>
                <WilayaSelect label="To"   value={form.route_to}   onChange={u('route_to')}/>
              </div>
            )}
          </>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            <span style={{display:'flex',alignItems:'center',gap:8}}>
              <CheckIcon size={15}/> {loading ? 'Saving...' : 'Save Changes'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
