import { useState, useEffect } from 'react'
import { getMe } from '../services/api'
import api from '../services/api'
import { validateName, validatePhone, validatePassword } from '../utils/validation'
import { UserIcon, PhoneIcon, CheckIcon, XIcon, LockIcon, EyeIcon, EyeOffIcon, AlertIcon } from './Icons'

const ROLE_LABEL = { admin: 'Admin', agency: 'Agent', agent: 'Agent', driver: 'Driver', client: 'Client' }

function PwField({ label, value, onChange, show, onToggle }) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <div className="field-wrap">
        <span className="field-icon"><LockIcon size={15}/></span>
        <input className="field-input" type={show ? 'text' : 'password'} value={value}
          onChange={e => onChange(e.target.value)} placeholder="Min 8 characters"/>
        <button type="button" onClick={onToggle}
          style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',display:'flex',alignItems:'center',padding:'0 4px'}}>
          {show ? <EyeOffIcon size={15}/> : <EyeIcon size={15}/>}
        </button>
      </div>
    </div>
  )
}

export default function StaffProfileModal({ onClose }) {
  const [user, setUser]         = useState(null)
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [showCf, setShowCf]     = useState(false)
  const [errors, setErrors]     = useState({})
  const [globalError, setGlobalError] = useState('')
  const [success, setSuccess]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    getMe()
      .then(res => {
        setUser(res.data)
        setName(res.data.name || '')
        setPhone(res.data.phone || '')
      })
      .catch(() => {
        const fallback = {
          name:        localStorage.getItem('staff_name') || '',
          email:       '',
          phone:       '',
          staff_id:    '',
          role:        localStorage.getItem('staff_role') || '',
          driver_type: localStorage.getItem('driver_type') || '',
          wilaya:      localStorage.getItem('driver_wilaya') || '',
          route_from:  localStorage.getItem('driver_route_from') || '',
          route_to:    localStorage.getItem('driver_route_to') || '',
        }
        setUser(fallback)
        setName(fallback.name)
        setPhone(fallback.phone)
      })
      .finally(() => setFetching(false))
  }, [])

  const validate = () => {
    const e = {}
    const nmErr = validateName(name);               if (nmErr) e.name = nmErr
    const phErr = validatePhone(phone);             if (phErr) e.phone = phErr
    if (password) {
      const pwErr = validatePassword(password);     if (pwErr) e.password = pwErr
      else if (password !== confirm) e.confirm = 'Passwords do not match'
    }
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true); setGlobalError('')
    try {
      const payload = { name, phone }
      if (password) { payload.password = password; payload.password_confirmation = confirm }
      await api.patch('/auth/profile', payload)
      localStorage.setItem('staff_name', name)
      setSuccess(true)
      setTimeout(() => { setSuccess(false); onClose() }, 1500)
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Failed to update profile.')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{width:440,maxHeight:'90vh',overflowY:'auto'}} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><XIcon size={18}/></button>
        <h2 className="modal-title">My Profile</h2>
        <p className="modal-sub">View and update your account information</p>

        {fetching ? (
          <div style={{textAlign:'center',padding:'32px 0',color:'#94a3b8'}}>
            <div className="spinner" style={{margin:'0 auto 12px'}}/> Loading...
          </div>
        ) : (
          <>
            {/* Read-only info */}
            {user && (
              <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:12,padding:'14px 16px',marginBottom:20,display:'flex',flexDirection:'column',gap:10}}>
                {user.staff_id && (
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:'.78rem',color:'#94a3b8',fontWeight:700,letterSpacing:'.05em'}}>STAFF ID</span>
                    <code style={{fontSize:'.83rem',background:'#eff3ff',color:'#1a2e6e',padding:'2px 8px',borderRadius:6,fontWeight:700}}>{user.staff_id}</code>
                  </div>
                )}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:'.78rem',color:'#94a3b8',fontWeight:700,letterSpacing:'.05em'}}>ROLE</span>
                  <span style={{fontSize:'.83rem',fontWeight:700,color:'#1a2e6e'}}>{ROLE_LABEL[user.role] || user.role}</span>
                </div>
                {user.email && (
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:'.78rem',color:'#94a3b8',fontWeight:700,letterSpacing:'.05em'}}>EMAIL</span>
                    <span style={{fontSize:'.83rem',color:'#475569'}}>{user.email}</span>
                  </div>
                )}
                {user.role === 'driver' && (
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:'.78rem',color:'#94a3b8',fontWeight:700,letterSpacing:'.05em'}}>ROUTE</span>
                    <span style={{fontSize:'.83rem',color:'#475569'}}>
                      {user.driver_type === 'intra' && (user.wilaya || 'No wilaya')}
                      {user.driver_type === 'inter' && `${user.route_from || '?'} ↔ ${user.route_to || '?'}`}
                      {!user.driver_type && '—'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {globalError && <div className="form-error">{globalError}</div>}
            {success && (
              <div style={{background:'#f0fdf4',color:'#166534',border:'1px solid #bbf7d0',borderRadius:8,padding:'10px 14px',fontSize:'.85rem',marginBottom:16,fontWeight:600}}>
                <CheckIcon size={15}/> Profile updated successfully!
              </div>
            )}

            <div className="field-group">
              <label className="field-label">Full Name</label>
              <div className={`field-wrap ${errors.name ? 'field-wrap-error' : ''}`}>
                <span className="field-icon"><UserIcon size={15}/></span>
                <input className="field-input" value={name}
                  onChange={e => { setName(e.target.value); setErrors(er => ({...er, name:''})) }}
                  placeholder="Your full name"/>
              </div>
              {errors.name && <p style={{color:'#dc2626',fontSize:'.75rem',marginTop:4}}><AlertIcon size={13}/> {errors.name}</p>}
            </div>

            <div className="field-group">
              <label className="field-label">Phone Number</label>
              <div className={`field-wrap ${errors.phone ? 'field-wrap-error' : ''}`}>
                <span className="field-icon"><PhoneIcon size={15}/></span>
                <input className="field-input" value={phone}
                  onChange={e => { setPhone(e.target.value); setErrors(er => ({...er, phone:''})) }}
                  placeholder="0555 000 000"/>
              </div>
              {errors.phone && <p style={{color:'#dc2626',fontSize:'.75rem',marginTop:4}}><AlertIcon size={13}/> {errors.phone}</p>}
            </div>

            <div style={{borderTop:'1px solid #f1f5f9',margin:'4px 0 16px',paddingTop:16}}>
              <p style={{fontSize:'.8rem',color:'#64748b',marginBottom:12,fontWeight:600}}>
                CHANGE PASSWORD <span style={{fontWeight:400,color:'#94a3b8'}}>(leave blank to keep current)</span>
              </p>
              <PwField label="New Password" value={password}
                onChange={v => { setPassword(v); setErrors(er => ({...er, password:'', confirm:''})) }}
                show={showPw} onToggle={() => setShowPw(s => !s)}/>
              {errors.password && <p style={{color:'#dc2626',fontSize:'.75rem',marginTop:-8,marginBottom:10}}><AlertIcon size={13}/> {errors.password}</p>}
              <PwField label="Confirm Password" value={confirm}
                onChange={v => { setConfirm(v); setErrors(er => ({...er, confirm:''})) }}
                show={showCf} onToggle={() => setShowCf(s => !s)}/>
              {errors.confirm && <p style={{color:'#dc2626',fontSize:'.75rem',marginTop:-8,marginBottom:10}}><AlertIcon size={13}/> {errors.confirm}</p>}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={loading}>
                <span style={{display:'flex',alignItems:'center',gap:8}}>
                  <CheckIcon size={15}/> {loading ? 'Saving...' : 'Save Changes'}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
