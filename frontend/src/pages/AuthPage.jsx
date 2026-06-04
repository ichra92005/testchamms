import { useState } from 'react'
import { staffLogin, clientLogin, clientRegister, forgotPassword } from '../services/api'
import { validateName, validatePhone, validateEmail, validatePassword, validateStaffId } from '../utils/validation'
import { UserIcon, ShieldIcon, CheckIcon, ArrowLeftIcon, PhoneIcon, EyeIcon, EyeOffIcon, LockIcon, AlertIcon, TruckIcon } from '../components/Icons'
import PasswordRequirements from '../components/PasswordRequirements'
import '../styles/auth.css'

// ── Field with inline error ───────────────────────────────────
function Field({ label, type='text', placeholder, value, onChange, error, icon, hint }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <div className={`field-wrap ${error ? 'field-wrap-error' : ''}`}>
        {icon && <span className="field-icon">{icon}</span>}
        <input
          className="field-input"
          type={isPassword ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}
            style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',display:'flex',alignItems:'center',padding:'0 4px'}}>
            {show ? <EyeOffIcon size={16}/> : <EyeIcon size={16}/>}
          </button>
        )}
      </div>
      {error && <p style={{color:'#dc2626',fontSize:'.75rem',marginTop:4,display:'flex',alignItems:'center',gap:4}}><AlertIcon size={13}/> {error}</p>}
      {hint && !error && <p className="field-hint">{hint}</p>}
    </div>
  )
}

// ── Forgot password modal ─────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [email, setEmail]     = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.'); return
    }
    setLoading(true); setError('')
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{width:380}}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {sent ? (
          <div style={{textAlign:'center', padding:'8px 0'}}>
            <div className="modal-avatar" style={{background:'#f0fdf4', color:'#16a34a'}}><CheckIcon size={32}/></div>
            <h2>Check your inbox</h2>
            <p style={{marginBottom:0}}>
              If an account with <strong>{email}</strong> exists, a reset link has been sent.
              Check your spam folder if you don't see it.
            </p>
          </div>
        ) : (
          <>
            <div className="modal-avatar"><LockIcon size={28}/></div>
            <h2>Forgot Password?</h2>
            <p>Enter your email and we'll send you a reset link.</p>

            <form onSubmit={handleSubmit}>
              {error && <div className="error-msg">{error}</div>}
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="text"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

const ROLES = [
  { key: 'admin',  label: 'Admin',  Icon: ShieldIcon, prefix: 'AD-', color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'agency', label: 'Agent',  Icon: UserIcon,   prefix: 'AG-', color: '#1d4ed8', bg: '#eff6ff' },
  { key: 'driver', label: 'Driver', Icon: TruckIcon,  prefix: 'DR-', color: '#0369a1', bg: '#f0f9ff' },
]

export default function AuthPage({ onBack, defaultTab = 'client' }) {
  const [tab, setTab]           = useState(defaultTab) // 'client' | 'staff'
  const [mode, setMode]         = useState('login')
  const [loading, setLoading]   = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [showForgot, setShowForgot]   = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [selectedRole, setSelectedRole] = useState(null) // 'admin' | 'agency' | 'driver'
  const roleData = selectedRole ? ROLES.find(r => r.key === selectedRole) : null

  const [form, setForm] = useState({
    name:'', phone:'', email:'', password:'', staffId:''
  })
  const u = k => v => {
    setForm(f => ({ ...f, [k]: v }))
    setFieldErrors(e => ({ ...e, [k]: '' }))
  }

  // ── Validation ────────────────────────────────────────────
  const validateClientLogin = () => {
    const errs = {}
    const emErr = validateEmail(form.email);   if (emErr) errs.email    = emErr
    if (!form.password)                                   errs.password = 'Password is required'
    return errs
  }

  const validateClientRegister = () => {
    const errs = {}
    const nmErr = validateName(form.name);       if (nmErr) errs.name     = nmErr
    const phErr = validatePhone(form.phone);     if (phErr) errs.phone    = phErr
    const emErr = validateEmail(form.email);     if (emErr) errs.email    = emErr
    const pwErr = validatePassword(form.password); if (pwErr) errs.password = pwErr
    return errs
  }

  const validateStaffLogin = () => {
    const errs = {}
    const idErr = validateStaffId(form.staffId); if (idErr) errs.staffId  = idErr
    if (!form.password)                                    errs.password = 'Password is required'
    return errs
  }

  // ── Handlers ──────────────────────────────────────────────
  const handleClientLogin = async (e) => {
    e.preventDefault()
    const errs = validateClientLogin()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setLoading(true); setGlobalError('')
    try {
      const res = await clientLogin(form.email, form.password)
      localStorage.setItem('client_token', res.data.token)
      localStorage.setItem('client_name',  res.data.name)
      localStorage.setItem('client_email', form.email)
      localStorage.setItem('client_phone', res.data.phone || '')
      window.location.reload()
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Invalid email or password.')
    } finally { setLoading(false) }
  }

  const handleClientRegister = async (e) => {
    e.preventDefault()
    const errs = validateClientRegister()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setLoading(true); setGlobalError('')
    try {
      const res = await clientRegister({ name: form.name, phone: form.phone, email: form.email, password: form.password })
      localStorage.setItem('client_token', res.data.token)
      localStorage.setItem('client_name',  res.data.name)
      localStorage.setItem('client_email', form.email)
      localStorage.setItem('client_phone', form.phone)
      window.location.reload()
    } catch (err) {
      const emailErr = err.response?.data?.errors?.email?.[0]
      const msg      = err.response?.data?.message || ''
      if (emailErr || msg.toLowerCase().includes('email')) {
        setGlobalError('This email is already registered as a client. Try logging in instead.')
      } else {
        setGlobalError(msg || 'Registration failed. Please try again.')
      }
    } finally { setLoading(false) }
  }

  const handleStaffLogin = async (e) => {
    e.preventDefault()
    const PREFIXES = { admin: 'AD-', agency: 'AG-', driver: 'DR-' }
    if (selectedRole && !form.staffId.toUpperCase().startsWith(PREFIXES[selectedRole])) {
      setFieldErrors({ staffId: 'This Staff ID does not match the selected role' }); return
    }
    const errs = validateStaffLogin()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setLoading(true); setGlobalError('')
    try {
      const res = await staffLogin(form.staffId, form.password)
      localStorage.setItem('staff_token', res.data.token)
      localStorage.setItem('staff_role',  res.data.role)
      localStorage.setItem('staff_name',  res.data.name)
      if (res.data.role === 'driver') {
        localStorage.setItem('driver_type',       res.data.driver_type  || '')
        localStorage.setItem('driver_wilaya',     res.data.wilaya       || '')
        localStorage.setItem('driver_route_from', res.data.route_from   || '')
        localStorage.setItem('driver_route_to',   res.data.route_to     || '')
      }
      window.location.reload()
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Invalid Staff ID or password.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px 40px',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f1e5c 0%, #1a2e6e 40%, #1e3a8a 70%, #1a2e6e 100%)',
    }}>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)}/>}

      <style>{`
        @keyframes moveTruck {
          from { transform: translateX(-100px); }
          to   { transform: translateX(calc(100vw + 100px)); }
        }
        @keyframes authDash {
          to { stroke-dashoffset: -96; }
        }
        @keyframes authPinFloat {
          0%, 100% { transform: translateY(0)   scale(1);    opacity: .75; }
          50%       { transform: translateY(-5px) scale(1.2); opacity: 1; }
        }
        @keyframes authPinRing {
          0%   { transform: scale(1);   opacity: .7; }
          100% { transform: scale(3.2); opacity: 0; }
        }
        .auth-pin {
          position: absolute; display: block;
          width: 9px; height: 9px; border-radius: 50%;
          pointer-events: none;
        }
        .auth-pin::after {
          content: '';
          position: absolute; inset: -6px; border-radius: 50%;
          border: 1.5px solid currentColor;
          opacity: 0;
          animation: authPinRing 2.8s ease-out infinite;
        }
        .ap1 { top: 14%; left: 8%;  color: #f97316; background: #f97316; animation: authPinFloat 3.4s ease-in-out infinite; }
        .ap2 { top: 32%; left: 72%; color: rgba(255,255,255,.7); background: rgba(255,255,255,.7); animation: authPinFloat 3.4s ease-in-out .8s infinite; }
        .ap2::after { animation-delay: .8s; }
        .ap3 { top: 70%; left: 18%; color: #f97316; background: #f97316; animation: authPinFloat 3.4s ease-in-out 1.6s infinite; }
        .ap3::after { animation-delay: 1.6s; }
        .ap4 { top: 55%; left: 88%; color: rgba(255,255,255,.7); background: rgba(255,255,255,.7); animation: authPinFloat 3.4s ease-in-out 2.4s infinite; }
        .ap4::after { animation-delay: 2.4s; }
        .ap5 { top: 86%; left: 55%; color: #f97316; background: #f97316; animation: authPinFloat 3.4s ease-in-out .4s infinite; }
        .ap5::after { animation-delay: .4s; }
      `}</style>

      {/* Glowing orbs */}
      <div style={{position:'absolute',top:'-8%',right:'-4%',width:520,height:520,borderRadius:'50%',background:'rgba(249,115,22,.14)',filter:'blur(90px)',pointerEvents:'none'}} />
      <div style={{position:'absolute',bottom:'-8%',left:'-4%',width:440,height:440,borderRadius:'50%',background:'rgba(99,102,241,.13)',filter:'blur(80px)',pointerEvents:'none'}} />
      <div style={{position:'absolute',top:'40%',left:'15%',width:300,height:300,borderRadius:'50%',background:'rgba(255,255,255,.04)',filter:'blur(60px)',pointerEvents:'none'}} />

      {/* Animated route paths */}
      <svg
        aria-hidden="true"
        style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M-80,200 C200,100 450,320 700,200 S1050,100 1280,200"
          fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="1.8"
          strokeDasharray="14 10" strokeLinecap="round"
          style={{animation:'authDash 12s linear infinite'}}
        />
        <path
          d="M-80,420 C150,300 500,560 750,420 S1080,300 1280,420"
          fill="none" stroke="rgba(249,115,22,.18)" strokeWidth="1.4"
          strokeDasharray="14 10" strokeLinecap="round"
          style={{animation:'authDash 18s linear infinite reverse'}}
        />
        <path
          d="M-80,640 C250,540 550,720 800,620 S1100,500 1280,640"
          fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1"
          strokeDasharray="14 10" strokeLinecap="round"
          style={{animation:'authDash 25s linear infinite'}}
        />
        <path
          d="M-80,100 C300,20  600,260 900,100 S1150,20 1280,100"
          fill="none" stroke="rgba(249,115,22,.09)" strokeWidth="1"
          strokeDasharray="10 12" strokeLinecap="round"
          style={{animation:'authDash 20s linear infinite 4s'}}
        />
      </svg>

      {/* Glowing position pins */}
      <span className="auth-pin ap1" />
      <span className="auth-pin ap2" />
      <span className="auth-pin ap3" />
      <span className="auth-pin ap4" />
      <span className="auth-pin ap5" />

      {/* Animated trucks */}
      <div style={{position:'absolute',top:'18%',left:0,color:'rgba(255,255,255,.13)',animation:'moveTruck 20s linear infinite',pointerEvents:'none'}}>
        <svg width="64" height="32" viewBox="0 0 64 32" fill="currentColor">
          <rect x="2" y="8" width="36" height="20" rx="3"/>
          <rect x="38" y="14" width="22" height="14" rx="2"/>
          <rect x="42" y="10" width="14" height="8" rx="1"/>
          <circle cx="12" cy="28" r="4"/>
          <circle cx="28" cy="28" r="4"/>
          <circle cx="52" cy="28" r="4"/>
        </svg>
      </div>
      <div style={{position:'absolute',top:'60%',left:0,color:'rgba(255,255,255,.09)',animation:'moveTruck 28s linear infinite 8s',pointerEvents:'none'}}>
        <svg width="48" height="24" viewBox="0 0 64 32" fill="currentColor">
          <rect x="2" y="8" width="36" height="20" rx="3"/>
          <rect x="38" y="14" width="22" height="14" rx="2"/>
          <rect x="42" y="10" width="14" height="8" rx="1"/>
          <circle cx="12" cy="28" r="4"/>
          <circle cx="28" cy="28" r="4"/>
          <circle cx="52" cy="28" r="4"/>
        </svg>
      </div>
      <div style={{position:'absolute',top:'82%',left:0,color:'rgba(255,255,255,.11)',animation:'moveTruck 15s linear infinite 4s',pointerEvents:'none'}}>
        <svg width="40" height="20" viewBox="0 0 64 32" fill="currentColor">
          <rect x="2" y="8" width="36" height="20" rx="3"/>
          <rect x="38" y="14" width="22" height="14" rx="2"/>
          <rect x="42" y="10" width="14" height="8" rx="1"/>
          <circle cx="12" cy="28" r="4"/>
          <circle cx="28" cy="28" r="4"/>
          <circle cx="52" cy="28" r="4"/>
        </svg>
      </div>

      {/* Back to website — fixed top-right */}
      <button onClick={onBack} style={{
        position:'fixed', top:24, right:32, zIndex:20,
        display:'flex', alignItems:'center', gap:6,
        background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.22)',
        color:'#fff', padding:'8px 16px', borderRadius:8,
        fontFamily:'inherit', fontWeight:600, fontSize:'.84rem',
        cursor:'pointer', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
        transition:'background .2s',
      }}>
        <ArrowLeftIcon size={15}/> Back to website
      </button>

      {/* Auth card — centered */}
      <div style={{position:'relative', zIndex:10, width:'100%', maxWidth:440}}>
        <div className="auth-card">
          {/* Dynamic heading */}
          <div style={{marginBottom:20}}>
            {tab === 'client' ? (
              <>
                <h2 style={{margin:'0 0 4px',fontSize:'1.35rem',fontWeight:800,color:'#1e293b'}}>
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p style={{margin:0,fontSize:'.84rem',color:'#64748b'}}>Track all your parcels in one place</p>
              </>
            ) : (
              <>
                <h2 style={{margin:'0 0 4px',fontSize:'1.35rem',fontWeight:800,color:'#1e293b'}}>
                  {roleData ? `${roleData.label} Portal` : 'Staff Portal'}
                </h2>
                <p style={{margin:0,fontSize:'.84rem',color:'#64748b'}}>
                  {roleData ? 'Login with your Staff ID' : 'Select your role to continue'}
                </p>
              </>
            )}
          </div>

          {globalError && <div className="form-error">{globalError}</div>}

          {/* ── CLIENT AREA ── */}
          {tab === 'client' && (
            <>
              <div className="auth-mode-toggle">
                <button className={mode==='login'?'active':''} onClick={() => { setMode('login'); setFieldErrors({}); setGlobalError('') }}>Login</button>
                <button className={mode==='register'?'active':''} onClick={() => { setMode('register'); setFieldErrors({}); setGlobalError('') }}>Register</button>
              </div>

              {mode === 'login' ? (
                <form onSubmit={handleClientLogin}>
                  <Field label="Email Address" placeholder="your@email.com" value={form.email} onChange={u('email')} error={fieldErrors.email}/>
                  <Field label="Password" type="password" placeholder="Your password" value={form.password} onChange={u('password')} error={fieldErrors.password}/>
                  <div style={{textAlign:'right',marginBottom:16,marginTop:-8}}>
                    <button type="button" onClick={() => setShowForgot(true)}
                      style={{background:'none',border:'none',color:'#3b82f6',fontSize:'.82rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                      Forgot password?
                    </button>
                  </div>
                  <button type="submit" className="btn-primary" style={{width:'100%',justifyContent:'center'}} disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleClientRegister}>
                  <Field label="Full Name" placeholder="Your full name" value={form.name} onChange={u('name')} error={fieldErrors.name}/>
                  <Field label="Phone Number" placeholder="+213 555 000 000" value={form.phone} onChange={u('phone')} error={fieldErrors.phone} icon={<PhoneIcon size={15}/>}/>
                  <Field label="Email Address" placeholder="your@email.com" value={form.email} onChange={u('email')} error={fieldErrors.email}/>
                  <Field label="Password" type="password" placeholder="Create a strong password" value={form.password} onChange={u('password')} error={fieldErrors.password}/>
                  <PasswordRequirements password={form.password}/>
                  <button type="submit" className="btn-primary" style={{width:'100%',justifyContent:'center',marginTop:14}} disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ── STAFF AREA — login only, no self-register ── */}
          {tab === 'staff' && (
            <>
              {!selectedRole ? (
                /* Step 1 — pick a role */
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {ROLES.map(({ key, label, Icon, prefix, color, bg }) => (
                    <button key={key} type="button"
                      onClick={() => { setSelectedRole(key); setFieldErrors({}); setGlobalError('') }}
                      style={{display:'flex',alignItems:'center',gap:14,padding:'14px 18px',borderRadius:12,border:'2px solid transparent',background:bg,cursor:'pointer',fontFamily:'inherit',textAlign:'left',width:'100%',transition:'border .18s'}}
                      onMouseEnter={e => { e.currentTarget.style.border=`2px solid ${color}55` }}
                      onMouseLeave={e => { e.currentTarget.style.border='2px solid transparent' }}
                    >
                      <div style={{width:42,height:42,borderRadius:10,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',color,flexShrink:0}}>
                        <Icon size={20}/>
                      </div>
                      <div>
                        <div style={{fontWeight:700,fontSize:'.92rem',color:'#1e293b'}}>{label}</div>
                        <div style={{fontSize:'.76rem',color:'#64748b',marginTop:2}}>
                          Staff ID starts with <strong style={{color}}>{prefix}</strong>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* Step 2 — login form */
                <>
                  {/* Role chip + change button */}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 14px',borderRadius:10,background:roleData.bg,border:`1px solid ${roleData.color}30`,marginBottom:20}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <roleData.Icon size={15} style={{color:roleData.color}}/>
                      <span style={{fontWeight:700,fontSize:'.85rem',color:roleData.color}}>{roleData.label}</span>
                    </div>
                    <button type="button"
                      onClick={() => { setSelectedRole(null); setFieldErrors({}); setGlobalError(''); setForm(f => ({...f,staffId:'',password:''})) }}
                      style={{background:'none',border:'none',color:'#64748b',fontSize:'.78rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',padding:0}}>
                      Change role
                    </button>
                  </div>

                  <form onSubmit={handleStaffLogin}>
                    <Field label="Staff ID" placeholder={`e.g. ${roleData.prefix}001`}
                      value={form.staffId} onChange={u('staffId')} error={fieldErrors.staffId}
                      hint={`Your Staff ID starts with ${roleData.prefix}`}/>
                    <Field label="Password" type="password" placeholder="Your password"
                      value={form.password} onChange={u('password')} error={fieldErrors.password}/>
                    <div style={{textAlign:'right',marginBottom:16,marginTop:-8}}>
                      <button type="button" onClick={() => setShowForgot(true)}
                        style={{background:'none',border:'none',color:'#3b82f6',fontSize:'.82rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                        Forgot password?
                      </button>
                    </div>
                    <button type="submit" className="btn-primary" style={{width:'100%',justifyContent:'center'}} disabled={loading}>
                      {loading ? 'Logging in...' : 'Login'}
                    </button>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
