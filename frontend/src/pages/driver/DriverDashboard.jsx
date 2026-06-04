import { useState, useEffect, useMemo } from 'react'
import api from '../../services/api'
import DriverSidebar from '../../components/driver/DriverSidebar'
import DriverParcelList from '../../components/driver/DriverParcelList'
import { ToastContainer, useToast } from '../../components/Toast'
import StaffProfileModal from '../../components/StaffProfileModal'
import TopBar from '../../components/TopBar'
import DashboardGreeting from '../../components/DashboardGreeting'
import { SkeletonStatsRow } from '../../components/Skeleton'
import '../../styles/agent.css'
import '../../styles/driver.css'

export default function DriverDashboard() {
  const [parcels, setParcels] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]     = useState('all')
  const [showProfile, setShowProfile] = useState(false)
  const { toasts, toast, removeToast } = useToast()

  // Single source of truth: GET /driver/parcels (filtered server-side by delivery_man_id).
  // Background refreshes (polling) skip the loading spinner so the list doesn't flicker.
  const fetchParcels = async ({ showLoading = true } = {}) => {
    if (showLoading) setLoading(true)
    try { const res = await api.get('/driver/parcels'); setParcels(res.data) }
    catch (err) { console.error(err) }
    finally { if (showLoading) setLoading(false) }
  }

  useEffect(() => { fetchParcels() }, [])

  // Auto-refresh every 30s so newly assigned parcels appear without a manual reload.
  useEffect(() => {
    const interval = setInterval(() => fetchParcels({ showLoading: false }), 30000)
    return () => clearInterval(interval)
  }, [])

  const FILTERS = [
    { key: 'all',              label: 'All',                match: () => true },
    { key: 'assigned',         label: 'Pending Acceptance', match: p => p.status === 'assigned' },
    { key: 'accepted',         label: 'Accepted',           match: p => p.status === 'accepted' },
    { key: 'out_for_delivery', label: 'Out for Delivery',   match: p => p.status === 'out_for_delivery' },
    { key: 'delivered',        label: 'Delivered',          match: p => ['delivered', 'confirmed'].includes(p.status) },
    { key: 'failed',           label: 'Failed',             match: p => p.status === 'failed' },
    { key: 'refused',          label: 'Refused',            match: p => p.status === 'refused' },
  ]

  const activeFilter = FILTERS.find(f => f.key === filter) || FILTERS[0]
  const filtered = parcels.filter(activeFilter.match)

  // Stats are computed directly from the parcel list so cards and list always agree.
  const stats = useMemo(() => ({
    total:            parcels.length,
    assigned:         parcels.filter(p => p.status === 'assigned').length,
    accepted:         parcels.filter(p => p.status === 'accepted').length,
    out_for_delivery: parcels.filter(p => p.status === 'out_for_delivery').length,
    delivered:        parcels.filter(p => ['delivered', 'confirmed'].includes(p.status)).length,
  }), [parcels])

  return (
    <div className="agent-layout">
      <DriverSidebar/>
      <main className="agent-main" style={{ padding: 0 }}>
        <TopBar
          title="My Deliveries"
          role="driver"
          onOpenProfile={() => setShowProfile(true)}
        />

        <div style={{ padding: '24px 32px' }}>
          <DashboardGreeting role="driver"/>
          {loading ? (
            <div style={{ marginBottom: 28 }}><SkeletonStatsRow count={5}/></div>
          ) : (
            <div className="stats-row" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
              <div className="stat-box"><div className="stat-box-number">{stats.total}</div><div className="stat-box-label">Total</div></div>
              <div className="stat-box pending"><div className="stat-box-number">{stats.assigned}</div><div className="stat-box-label">Pending Acceptance</div></div>
              <div className="stat-box" style={{borderColor:'#3b82f6'}}><div className="stat-box-number">{stats.accepted}</div><div className="stat-box-label">Accepted</div></div>
              <div className="stat-box transit"><div className="stat-box-number">{stats.out_for_delivery}</div><div className="stat-box-label">Out for Delivery</div></div>
              <div className="stat-box delivered"><div className="stat-box-number">{stats.delivered}</div><div className="stat-box-label">Delivered</div></div>
            </div>
          )}

          <div className="filter-tabs">
            {FILTERS.map(f => (
              <button key={f.key} className={`filter-tab ${filter===f.key?'filter-active':''}`} onClick={() => setFilter(f.key)}>
                {f.label}<span className="filter-count">{parcels.filter(f.match).length}</span>
              </button>
            ))}
          </div>

          <DriverParcelList parcels={filtered} loading={loading} onRefresh={fetchParcels} toast={toast}/>
        </div>
      </main>
      <ToastContainer toasts={toasts} removeToast={removeToast}/>
      {showProfile && <StaffProfileModal onClose={() => setShowProfile(false)}/>}
    </div>
  )
}
