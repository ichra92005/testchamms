import { useState, useEffect, useMemo, useRef } from 'react'
import { getParcels, getNotifications, markNotificationRead } from '../../services/api'
import AgentSidebar from '../../components/agent/AgentSidebar'
import ParcelList from '../../components/agent/ParcelList'
import CreateParcelForm from '../../components/agent/CreateParcelForm'
import AssignParcelModal from '../../components/agent/AssignParcelModal'
import { ToastContainer, useToast } from '../../components/Toast'
import StaffProfileModal from '../../components/StaffProfileModal'
import TopBar from '../../components/TopBar'
import DashboardGreeting from '../../components/DashboardGreeting'
import { SkeletonStatsRow } from '../../components/Skeleton'
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
  const { toasts, toast, removeToast } = useToast()
  const prevNotifCount = useRef(null) // null until the first notifications load

  // Background polling skips the loading spinner so the table doesn't flicker.
  const fetchParcels = async ({ showLoading = true } = {}) => {
    if (showLoading) setLoading(true)
    try { const res = await getParcels(); setParcels(res.data) }
    catch (err) { console.error(err) }
    finally { if (showLoading) setLoading(false) }
  }

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications()
      // Toast when fresh notifications (e.g. driver refusals) arrive after the first load.
      if (prevNotifCount.current !== null && res.data.length > prevNotifCount.current) {
        toast.info('New refusal notification')
      }
      prevNotifCount.current = res.data.length
      setNotifications(res.data)
    } catch { /* silent */ }
  }

  // Auto-refresh parcels every 30s so newly created/updated parcels appear live.
  useEffect(() => {
    fetchParcels()
    const interval = setInterval(() => fetchParcels({ showLoading: false }), 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleReadNotif = async (notif) => {
    try { await markNotificationRead(notif.id) } catch { /* silent */ }
    setNotifications(prev => prev.filter(n => n.id !== notif.id))
    if (prevNotifCount.current !== null) prevNotifCount.current -= 1
  }

  // Stats computed from the parcel list so they refresh automatically on every re-fetch.
  const stats = useMemo(() => ({
    total:      parcels.length,
    pending:    parcels.filter(p => p.status === 'pending').length,
    registered: parcels.filter(p => p.status === 'registered').length,
    assigned:   parcels.filter(p => p.status === 'assigned').length,
    delivered:  parcels.filter(p => p.status === 'delivered').length,
  }), [parcels])

  return (
    <div className="agent-layout">
      <AgentSidebar active={view} onNavigate={setView}/>
      <main className="agent-main" style={{ padding: 0 }}>
        <TopBar
          title={view === 'create' ? 'Register New Parcel' : 'Parcels'}
          role="agency"
          onOpenProfile={() => setShowProfile(true)}
          showBell
          notifCount={notifications.length}
          bellOpen={showNotif}
          onToggleBell={() => setShowNotif(v => !v)}
          onCloseBell={() => setShowNotif(false)}
        >
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
        </TopBar>

        <div style={{ padding: '24px 32px' }}>
          {view === 'parcels' && <DashboardGreeting role="agent"/>}
          {view === 'parcels' && (
            loading ? (
              <div style={{ marginBottom: 28 }}><SkeletonStatsRow count={5}/></div>
            ) : (
              <div className="stats-row" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
                <div className="stat-box"><div className="stat-box-number">{stats.total}</div><div className="stat-box-label">Total</div></div>
                <div className="stat-box" style={{borderColor:'#f97316'}}><div className="stat-box-number">{stats.pending}</div><div className="stat-box-label">Pending Validation</div></div>
                <div className="stat-box" style={{borderColor:'#3b82f6'}}><div className="stat-box-number">{stats.registered}</div><div className="stat-box-label">Registered</div></div>
                <div className="stat-box assigned"><div className="stat-box-number">{stats.assigned}</div><div className="stat-box-label">Assigned</div></div>
                <div className="stat-box delivered"><div className="stat-box-number">{stats.delivered}</div><div className="stat-box-label">Delivered</div></div>
              </div>
            )
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
        </div>
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
