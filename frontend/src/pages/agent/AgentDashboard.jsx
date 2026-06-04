import { useState, useEffect, useRef } from 'react'
import { getParcels, getNotifications, markNotificationRead } from '../../services/api'
import AgentSidebar from '../../components/agent/AgentSidebar'
import ParcelList from '../../components/agent/ParcelList'
import CreateParcelForm from '../../components/agent/CreateParcelForm'
import AssignParcelModal from '../../components/agent/AssignParcelModal'
import { UserIcon, LogoutIcon, BellIcon } from '../../components/Icons'
import { ToastContainer, useToast } from '../../components/Toast'
import StaffProfileModal from '../../components/StaffProfileModal'
import '../../styles/agent.css'
import '../../styles/delivery-badge.css'
import '../../styles/validation.css'

export default function AgentDashboard() {
  const [view, setView]               = useState('parcels')
  const [parcels, setParcels]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [assignTarget, setAssignTarget] = useState(null)
  const [showProfile, setShowProfile]   = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotif, setShowNotif]         = useState(false)
  const notifRef = useRef(null)
  const { toasts, toast, removeToast } = useToast()

  const fetchParcels = async () => {
    setLoading(true)
    try { const res = await getParcels(); setParcels(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const fetchNotifications = async () => {
    try { const res = await getNotifications(); setNotifications(res.data) }
    catch { /* silent */ }
  }

  useEffect(() => { fetchParcels() }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!showNotif) return
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showNotif])

  const handleReadNotif = async (notif) => {
    try { await markNotificationRead(notif.id) } catch { /* silent */ }
    setNotifications(prev => prev.filter(n => n.id !== notif.id))
  }

  const stats = {
    total:      parcels.length,
    pending:    parcels.filter(p => p.status === 'pending').length,
    registered: parcels.filter(p => p.status === 'registered').length,
    assigned:   parcels.filter(p => p.status === 'assigned').length,
    delivered:  parcels.filter(p => p.status === 'delivered').length,
  }

  return (
    <div className="agent-layout">
      <AgentSidebar active={view} onNavigate={setView}/>
      <main className="agent-main">
        <div className="agent-topbar">
          <div>
            <h1 className="agent-title">{view === 'parcels' ? 'Parcels Overview' : 'Register New Parcel'}</h1>
            <p className="agent-subtitle">{view === 'parcels' ? 'Validate and manage all incoming parcels' : 'Fill in the details to register a new parcel'}</p>
          </div>
          <div className="topbar-right">
            <div ref={notifRef} style={{position:'relative'}}>
              <button onClick={() => setShowNotif(v => !v)}
                style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',width:38,height:38,borderRadius:10,border:'1.5px solid #e2e8f0',background:'#f8fafc',cursor:'pointer',color:'#475569'}}>
                <BellIcon size={18}/>
                {notifications.length > 0 && (
                  <span style={{position:'absolute',top:4,right:4,width:8,height:8,borderRadius:'50%',background:'#dc2626',border:'2px solid #f8fafc'}}/>
                )}
              </button>
              {showNotif && (
                <div style={{position:'absolute',top:'calc(100% + 8px)',right:0,width:340,background:'#fff',borderRadius:14,boxShadow:'0 8px 32px rgba(26,46,110,.13)',border:'1.5px solid #e2e8f0',zIndex:200,overflow:'hidden'}}>
                  <div style={{padding:'12px 16px 10px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{fontWeight:700,fontSize:'.9rem',color:'#1a2e6e'}}>Notifications</span>
                    {notifications.length > 0 && (
                      <span style={{background:'#fef2f2',color:'#dc2626',borderRadius:999,padding:'2px 8px',fontSize:'.75rem',fontWeight:700}}>{notifications.length} unread</span>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{padding:'24px 16px',textAlign:'center',color:'#94a3b8',fontSize:'.85rem'}}>No new notifications</div>
                  ) : (
                    <div style={{maxHeight:320,overflowY:'auto'}}>
                      {notifications.map(n => (
                        <div key={n.id} onClick={() => handleReadNotif(n)}
                          style={{padding:'12px 16px',borderBottom:'1px solid #f8fafc',cursor:'pointer',transition:'background .15s'}}
                          onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                          <p style={{margin:0,fontSize:'.83rem',color:'#1e293b',lineHeight:1.45}}>{n.message}</p>
                          <p style={{margin:'4px 0 0',fontSize:'.75rem',color:'#94a3b8'}}>
                            {new Date(n.created_at).toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button className="agent-name" style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:'inherit',color:'inherit'}}
              onClick={() => setShowProfile(true)}>
              <UserIcon size={15}/> {localStorage.getItem('staff_name') || 'Agent'}
            </button>
            <button className="btn-logout" style={{display:'flex',alignItems:'center',gap:6}}
              onClick={() => { localStorage.clear(); window.location.href = '/' }}>
              <LogoutIcon size={14}/> Logout
            </button>
          </div>
        </div>

        {view === 'parcels' && (
          <div className="stats-row" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
            <div className="stat-box"><div className="stat-box-number">{stats.total}</div><div className="stat-box-label">Total</div></div>
            <div className="stat-box" style={{borderColor:'#f97316'}}><div className="stat-box-number">{stats.pending}</div><div className="stat-box-label">Pending Validation</div></div>
            <div className="stat-box" style={{borderColor:'#3b82f6'}}><div className="stat-box-number">{stats.registered}</div><div className="stat-box-label">Registered</div></div>
            <div className="stat-box assigned"><div className="stat-box-number">{stats.assigned}</div><div className="stat-box-label">Assigned</div></div>
            <div className="stat-box delivered"><div className="stat-box-number">{stats.delivered}</div><div className="stat-box-label">Delivered</div></div>
          </div>
        )}

        {view === 'parcels' && (
          <ParcelList
            parcels={parcels} loading={loading}
            onAssign={setAssignTarget} onRefresh={fetchParcels}
            onCreateNew={() => setView('create')}
            toast={toast}
          />
        )}
        {view === 'create' && (
          <CreateParcelForm
            onSuccess={(trackingCode) => {
              setView('parcels')
              fetchParcels()
              toast.success(`Parcel registered! Tracking code: ${trackingCode}`)
            }}
            onCancel={() => setView('parcels')}
          />
        )}
      </main>

      {assignTarget && (
        <AssignParcelModal
          parcel={assignTarget}
          onClose={() => setAssignTarget(null)}
          onSuccess={() => {
            setAssignTarget(null)
            fetchParcels()
            toast.success('Parcel assigned to driver successfully')
          }}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast}/>
      {showProfile && <StaffProfileModal onClose={() => setShowProfile(false)}/>}
    </div>
  )
}
