import { useState, useEffect, useCallback, useMemo } from 'react'
import api from '../../services/api'
import { validateName, validatePhone, validatePassword } from '../../utils/validation'
import { PackageIcon, SearchIcon, CheckIcon, XIcon, PhoneIcon, AlertIcon, RefreshIcon } from '../../components/Icons'
import PasswordRequirements from '../../components/PasswordRequirements'
import TopBar from '../../components/TopBar'
import DashboardGreeting from '../../components/DashboardGreeting'
import { SkeletonStatsRow, SkeletonTable } from '../../components/Skeleton'
import { sortByStatus, isCompleted } from '../../utils/parcelSort'

const STATUS_COLORS = {
  pending:          { bg: '#fff7ed', color: '#c2410c', label: 'Pending' },
  registered:       { bg: '#eff6ff', color: '#1d4ed8', label: 'Registered' },
  assigned:         { bg: '#f0fdf4', color: '#15803d', label: 'Assigned' },
  accepted:         { bg: '#f0fdf4', color: '#15803d', label: 'Accepted' },
  out_for_delivery: { bg: '#fdf4ff', color: '#7e22ce', label: 'Out for Delivery' },
  delivered:        { bg: '#f0fdf4', color: '#166534', label: 'Delivered' },
  confirmed:        { bg: '#f0fdf4', color: '#166534', label: 'Confirmed' },
  failed:           { bg: '#fef2f2', color: '#dc2626', label: 'Failed' },
  refused:          { bg: '#fef2f2', color: '#dc2626', label: 'Refused' },
}

// ── Profile Modal ─────────────────────────────────────────────
function ProfileModal({ onClose }) {
  const [name, setName]         = useState(localStorage.getItem('client_name') || '')
  const [phone, setPhone]       = useState(localStorage.getItem('client_phone') || '')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [globalError, setGlobalError] = useState('')
  const [success, setSuccess]   = useState(false)
  const [loading, setLoading]   = useState(false)

  const validate = () => {
    const e = {}
    const nmErr = validateName(name);   if (nmErr) e.name  = nmErr
    const phErr = validatePhone(phone); if (phErr) e.phone = phErr
    if (password) {
      const pwErr = validatePassword(password); if (pwErr) e.password = pwErr
    }
    return e
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setLoading(true); setGlobalError('')
    try {
      const payload = { name, phone }
      if (password) { payload.password = password; payload.password_confirmation = password }
      await api.patch('/auth/profile', payload)
      localStorage.setItem('client_name',  name)
      localStorage.setItem('client_phone', phone)
      setSuccess(true)
      setTimeout(() => { setSuccess(false); onClose() }, 1500)
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Failed to update profile.')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{width:420}} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><XIcon size={18}/></button>
        <h2 className="modal-title">Edit Profile</h2>
        <p className="modal-sub">Update your personal information</p>

        {globalError && <div className="form-error">{globalError}</div>}
        {success     && <div style={{background:'#f0fdf4',color:'#166534',border:'1px solid #bbf7d0',borderRadius:8,padding:'10px 14px',fontSize:'.85rem',marginBottom:16,fontWeight:600,display:'flex',alignItems:'center',gap:6}}><CheckIcon size={15}/> Profile updated successfully!</div>}

        <div className="field-group">
          <label className="field-label">Full Name</label>
          <div className={`field-wrap ${fieldErrors.name ? 'field-wrap-error' : ''}`}>
            <input className="field-input" value={name}
              onChange={e => { setName(e.target.value); setFieldErrors(er => ({...er, name:''})) }}
              placeholder="Your name"/>
          </div>
          {fieldErrors.name && <p style={{color:'#dc2626',fontSize:'.75rem',marginTop:4}}><AlertIcon size={13}/> {fieldErrors.name}</p>}
        </div>

        <div className="field-group">
          <label className="field-label">Phone Number</label>
          <div className={`field-wrap ${fieldErrors.phone ? 'field-wrap-error' : ''}`}>
            <span className="field-icon"><PhoneIcon size={15}/></span>
            <input className="field-input" value={phone}
              onChange={e => { setPhone(e.target.value); setFieldErrors(er => ({...er, phone:''})) }}
              placeholder="0555 000 000"/>
          </div>
          {fieldErrors.phone && <p style={{color:'#dc2626',fontSize:'.75rem',marginTop:4}}><AlertIcon size={13}/> {fieldErrors.phone}</p>}
        </div>

        <div className="field-group">
          <label className="field-label">New Password <span style={{color:'#94a3b8',fontWeight:400}}>(leave blank to keep current)</span></label>
          <div className={`field-wrap ${fieldErrors.password ? 'field-wrap-error' : ''}`}>
            <input className="field-input" type="password" value={password}
              onChange={e => { setPassword(e.target.value); setFieldErrors(er => ({...er, password:''})) }}
              placeholder="Min 8 chars with letters and numbers"/>
          </div>
          {fieldErrors.password && <p style={{color:'#dc2626',fontSize:'.75rem',marginTop:4}}><AlertIcon size={13}/> {fieldErrors.password}</p>}
          <PasswordRequirements password={password}/>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            <span style={{display:'flex',alignItems:'center',gap:8}}><CheckIcon size={15}/> {loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ClientDashboard({ onTrack }) {
  const [parcels, setParcels]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState('all')
  const [showProfile, setShowProfile] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const name  = localStorage.getItem('client_name')  || 'Client'
  const phone = localStorage.getItem('client_phone') || ''

  const fetchParcels = useCallback(async () => {
    try {
      const results = []
      if (phone) {
        const res = await api.post('/parcels/search-by-phone', { phone })
        results.push(...res.data)
      }
      const unique = results.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i)
      setParcels(unique)
      setLastRefresh(new Date())
    } catch {
      setParcels([])
    } finally { setLoading(false) }
  }, [phone])

  useEffect(() => {
    fetchParcels()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchParcels, 30000)
    return () => clearInterval(interval)
  }, [fetchParcels])

  // Search + filter, then completed parcels sink to the bottom.
  const filtered = useMemo(() => {
    const matched = parcels.filter(p => {
      const matchSearch = p.tracking_code?.toLowerCase().includes(search.toLowerCase()) ||
                          p.receiver_name?.toLowerCase().includes(search.toLowerCase())
      const matchFilter = filter === 'all' || p.status === filter
      return matchSearch && matchFilter
    })
    return sortByStatus(matched)
  }, [parcels, search, filter])

  const stats = useMemo(() => ({
    total:     parcels.length,
    active:    parcels.filter(p => ['registered','assigned','accepted','out_for_delivery'].includes(p.status)).length,
    delivered: parcels.filter(p => ['delivered','confirmed'].includes(p.status)).length,
    failed:    parcels.filter(p => ['failed','refused'].includes(p.status)).length,
  }), [parcels])

  const FILTERS = [
    { key: 'all',              label: 'All' },
    { key: 'out_for_delivery', label: 'On the Way' },
    { key: 'delivered',        label: 'Delivered' },
    { key: 'confirmed',        label: 'Confirmed' },
    { key: 'failed',           label: 'Failed' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      {/* Navbar */}
      <TopBar
        role="client"
        onOpenProfile={() => setShowProfile(true)}
        title={
          <span style={{ fontSize:'1.2rem', fontWeight:800, color:'#fff' }}>
            Deliver<span style={{ color:'#f97316' }}>It</span>
          </span>
        }
      />

      <div style={{ maxWidth:960, margin:'0 auto', padding:'32px 24px' }}>
        {/* Welcome */}
        <DashboardGreeting role="client"/>
        <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:12, marginTop:-12, marginBottom:20 }}>
          <span style={{ fontSize:'.75rem', color:'#94a3b8' }}>
            Updated {lastRefresh.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}
          </span>
          <button onClick={fetchParcels}
            style={{ padding:'8px 14px', borderRadius:8, border:'1.5px solid #e2e8f0', background:'#fff', fontFamily:'inherit', fontWeight:600, fontSize:'.82rem', color:'#1a2e6e', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <RefreshIcon size={14}/> Refresh
          </button>
        </div>

        {/* Stats */}
        {loading ? (
          <div style={{ marginBottom: 28 }}><SkeletonStatsRow count={4}/></div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
            {[
              { label:'Total Parcels',  value: stats.total,     color:'#1a2e6e' },
              { label:'In Transit',     value: stats.active,    color:'#7e22ce' },
              { label:'Delivered',      value: stats.delivered, color:'#166534' },
              { label:'Failed',         value: stats.failed,    color:'#dc2626' },
            ].map(s => (
              <div key={s.label} style={{ background:'#fff', borderRadius:14, padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,.07)', borderTop:`3px solid ${s.color}` }}>
                <div style={{ fontSize:'1.8rem', fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:'.82rem', color:'#64748b', marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div style={{ background:'#fff', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,.07)', overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{
                  padding:'6px 14px', borderRadius:999, border:'none', cursor:'pointer',
                  fontFamily:'inherit', fontWeight:600, fontSize:'.82rem',
                  background: filter===f.key ? '#1a2e6e' : '#f1f5f9',
                  color: filter===f.key ? '#fff' : '#64748b',
                }}>
                  {f.label}
                  <span style={{ marginLeft:6, background: filter===f.key?'rgba(255,255,255,.2)':'#e2e8f0', color: filter===f.key?'#fff':'#64748b', padding:'1px 6px', borderRadius:999, fontSize:'.75rem' }}>
                    {f.key==='all' ? parcels.length : parcels.filter(p=>p.status===f.key).length}
                  </span>
                </button>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'8px 12px', width:240 }}>
              <SearchIcon size={14} style={{ color:'#94a3b8', flexShrink:0 }}/>
              <input type="text" placeholder="Search parcels..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ border:'none', outline:'none', background:'transparent', fontFamily:'inherit', fontSize:'.85rem', color:'#1e293b', width:'100%' }}/>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 12 }}>
              <SkeletonTable rows={6} cells={4}/>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:48, textAlign:'center', color:'#94a3b8' }}>
              <PackageIcon size={48} style={{ opacity:.2, display:'block', margin:'0 auto 16px' }}/>
              <h3 style={{ color:'#475569', marginBottom:8 }}>No parcels found</h3>
              <p style={{ fontSize:'.88rem' }}>
                {parcels.length === 0 ? 'No parcels are associated with your phone number yet.' : 'No parcels match your current filter.'}
              </p>
            </div>
          ) : (
            <div>
              {filtered.map((p, i) => {
                const s = STATUS_COLORS[p.status] || { bg:'#f1f5f9', color:'#475569', label: p.status }
                const done = isCompleted(p.status)
                const baseBg = done ? '#fafafa' : 'transparent'
                return (
                  <div key={p.id} onClick={() => onTrack(p.tracking_code)}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom: i<filtered.length-1?'1px solid #f8fafc':'none', cursor:'pointer', transition:'background .15s', gap:16, background: baseBg, opacity: done ? .65 : 1 }}
                    onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background=baseBg}
                  >
                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                      <div style={{ width:40, height:40, borderRadius:10, background:'#eff3ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <PackageIcon size={18} style={{ color:'#1a2e6e' }}/>
                      </div>
                      <div>
                        <code style={{ fontSize:'.88rem', fontWeight:700, color:'#1a2e6e', background:'#eff3ff', padding:'2px 8px', borderRadius:6 }}>{p.tracking_code}</code>
                        <div style={{ marginTop:5, fontSize:'.82rem', color:'#475569' }}>
                          {p.sender_name||'Sender'} → {p.receiver_name}
                        </div>
                        <div style={{ fontSize:'.75rem', color:'#94a3b8', marginTop:2 }}>
                          {p.origin_wilaya||p.pickup_location} → {p.destination_wilaya||p.destination}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <span style={{ background:s.bg, color:s.color, padding:'4px 12px', borderRadius:999, fontSize:'.75rem', fontWeight:700, display:'block', marginBottom:6 }}>{s.label}</span>
                      <span style={{ fontSize:'.75rem', color:'#94a3b8' }}>{new Date(p.created_at).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)}/>}
    </div>
  )
}
