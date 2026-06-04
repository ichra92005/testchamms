import { useState } from 'react'
import { resetPassword } from '../services/api'
import { LockIcon, CheckIcon, EyeIcon, EyeOffIcon, AlertIcon } from '../components/Icons'

function PasswordField({ label, value, onChange, error, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <div className={`field-wrap ${error ? 'field-wrap-error' : ''}`}>
        <span className="field-icon"><LockIcon size={15}/></span>
        <input
          className="field-input"
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <button type="button" onClick={() => setShow(s => !s)}
          style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',display:'flex',alignItems:'center',padding:'0 4px'}}>
          {show ? <EyeOffIcon size={16}/> : <EyeIcon size={16}/>}
        </button>
      </div>
      {error && <p style={{color:'#dc2626',fontSize:'.75rem',marginTop:4,display:'flex',alignItems:'center',gap:4}}><AlertIcon size={13}/> {error}</p>}
    </div>
  )
}

export default function ResetPasswordPage({ token, email, onDone }) {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [errors, setErrors]       = useState({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)

  const isSetup = new URLSearchParams(window.location.search).get('setup') === '1'

  const validate = () => {
    const e = {}
    if (!password)           e.password = 'Password is required'
    else if (password.length < 8) e.password = 'Password must be at least 8 characters'
    if (!confirm)            e.confirm  = 'Please confirm your password'
    else if (confirm !== password) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true); setGlobalError('')
    try {
      await resetPassword(email, token, password)
      setSuccess(true)
    } catch (err) {
      setGlobalError(
        err.response?.data?.message || 'Something went wrong. The link may have expired.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #eef4ff 0%, #f0f7ff 50%, #fff8f0 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '44px 40px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 8px 40px rgba(26,46,110,0.13)',
      }}>
        {/* Brand */}
        <div style={{textAlign:'center', marginBottom: 28}}>
          <div style={{fontSize:'1.5rem', fontWeight:800, color:'#1a2e6e', marginBottom:6, letterSpacing:'-.5px'}}>
            Deliver<span style={{color:'#f97316'}}>It</span>
          </div>
          <h1 style={{fontSize:'1.2rem', fontWeight:800, color:'#1e293b', marginBottom:6}}>
            {isSetup ? 'Set Your Password' : 'Reset Password'}
          </h1>
          <p style={{fontSize:'.88rem', color:'#64748b'}}>
            {isSetup
              ? 'Create a secure password to activate your staff account.'
              : 'Enter a new password for your account.'}
          </p>
          {email && (
            <div style={{
              marginTop: 12,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: '.82rem',
              color: '#475569',
              wordBreak: 'break-all',
            }}>
              {email}
            </div>
          )}
        </div>

        {/* Success state */}
        {success ? (
          <div style={{textAlign:'center'}}>
            <div style={{
              width:64, height:64, borderRadius:'50%',
              background:'#f0fdf4', display:'flex',
              alignItems:'center', justifyContent:'center',
              margin:'0 auto 20px', color:'#22c55e',
            }}><CheckIcon size={32}/></div>
            <p style={{fontWeight:700, color:'#166534', marginBottom:8, fontSize:'1rem'}}>
              Password updated!
            </p>
            <p style={{fontSize:'.88rem', color:'#64748b', marginBottom:28, lineHeight:1.6}}>
              Your password has been set successfully. You can now log in.
            </p>
            <button
              onClick={onDone}
              style={{
                width:'100%', padding:'13px',
                background:'#1a2e6e', color:'#fff',
                border:'none', borderRadius:10,
                fontFamily:'inherit', fontWeight:700, fontSize:'.95rem',
                cursor:'pointer',
              }}
            >
              <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                <CheckIcon size={16}/> Go to Login
              </span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {globalError && (
              <div style={{
                background:'#fef2f2', border:'1px solid #fecaca',
                borderRadius:8, padding:'10px 14px',
                fontSize:'.84rem', color:'#dc2626', marginBottom:18,
              }}>
                {globalError}
              </div>
            )}

            <PasswordField
              label="New Password"
              placeholder="Min 8 characters"
              value={password}
              onChange={v => { setPassword(v); setErrors(e => ({...e, password:''})) }}
              error={errors.password}
            />
            <PasswordField
              label="Confirm Password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={v => { setConfirm(v); setErrors(e => ({...e, confirm:''})) }}
              error={errors.confirm}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width:'100%', padding:'14px', marginTop:8,
                background: loading ? '#94a3b8' : '#f97316',
                color:'#fff', border:'none', borderRadius:10,
                fontFamily:'inherit', fontWeight:700, fontSize:'.97rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition:'background .2s',
              }}
            >
              {loading ? 'Saving...' : (isSetup ? 'Set Password & Activate Account' : 'Reset Password')}
            </button>

            <button
              type="button"
              onClick={onDone}
              style={{
                width:'100%', padding:'10px', marginTop:10,
                background:'none', border:'none',
                fontFamily:'inherit', fontWeight:600, fontSize:'.85rem',
                color:'#64748b', cursor:'pointer',
              }}
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
