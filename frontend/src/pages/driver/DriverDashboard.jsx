import { useState, useEffect } from 'react'
import api from '../../services/api'
import DriverSidebar from '../../components/driver/DriverSidebar'
import DriverParcelList from '../../components/driver/DriverParcelList'
import { TruckIcon, LogoutIcon } from '../../components/Icons'
import { ToastContainer, useToast } from '../../components/Toast'
import StaffProfileModal from '../../components/StaffProfileModal'
import '../../styles/agent.css'
import '../../styles/driver.css'

export default function DriverDashboard() {
  const [parcels, setParcels] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]     = useState('all')
  const [showProfile, setShowProfile] = useState(false)
  const { toasts, toast, removeToast } = useToast()

  const fetchParcels = async () => {
    setLoading(true)
    try { const res = await api.get('/driver/parcels'); setParcels(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchParcels() }, [])

  const filtered = filter === 'all' ? parcels : parcels.filter(p => p.status === filter)
  const stats = {
    total:            parcels.length,
    assigned:         parcels.filter(p => p.status === 'assigned').length,
    accepted:         parcels.filter(p => p.status === 'accepted').length,
    out_for_delivery: parcels.filter(p => p.status === 'out_for_delivery').length,
    delivered:        parcels.filter(p => p.status === 'delivered').length,
  }

  const FILTERS = [
    { key: 'all',              label: 'All' },
    { key: 'assigned',         label: 'Pending Acceptance' },
    { key: 'accepted',         label: 'Accepted' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered',        label: 'Delivered' },
    { key: 'failed',           label: 'Failed' },
    { key: 'refused',          label: 'Refused' },
  ]

  return (
    <div className="agent-layout">
      <DriverSidebar/>
      <main className="agent-main">
        <div className="agent-topbar">
          <div>
            <h1 className="agent-title">My Deliveries</h1>
            <p className="agent-subtitle">Accept, manage and update your assigned parcels</p>
          </div>
          <div className="topbar-right">
            <button className="agent-name" style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:'inherit',color:'inherit'}}
              onClick={() => setShowProfile(true)}>
              <TruckIcon size={15}/> {localStorage.getItem('staff_name') || 'Driver'}
            </button>
            <button className="btn-logout" style={{display:'flex',alignItems:'center',gap:6}}
              onClick={() => { localStorage.clear(); window.location.href = '/' }}>
              <LogoutIcon size={14}/> Logout
            </button>
          </div>
        </div>

        <div className="stats-row" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
          <div className="stat-box"><div className="stat-box-number">{stats.total}</div><div className="stat-box-label">Total</div></div>
          <div className="stat-box pending"><div className="stat-box-number">{stats.assigned}</div><div className="stat-box-label">Pending Acceptance</div></div>
          <div className="stat-box" style={{borderColor:'#3b82f6'}}><div className="stat-box-number">{stats.accepted}</div><div className="stat-box-label">Accepted</div></div>
          <div className="stat-box transit"><div className="stat-box-number">{stats.out_for_delivery}</div><div className="stat-box-label">Out for Delivery</div></div>
          <div className="stat-box delivered"><div className="stat-box-number">{stats.delivered}</div><div className="stat-box-label">Delivered</div></div>
        </div>

        <div className="filter-tabs">
          {FILTERS.map(f => (
            <button key={f.key} className={`filter-tab ${filter===f.key?'filter-active':''}`} onClick={() => setFilter(f.key)}>
              {f.label}<span className="filter-count">{f.key==='all'?parcels.length:parcels.filter(p=>p.status===f.key).length}</span>
            </button>
          ))}
        </div>

        <DriverParcelList parcels={filtered} loading={loading} onRefresh={fetchParcels} toast={toast}/>
      </main>
      <ToastContainer toasts={toasts} removeToast={removeToast}/>
      {showProfile && <StaffProfileModal onClose={() => setShowProfile(false)}/>}
    </div>
  )
}
