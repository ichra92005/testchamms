import { useState, useEffect, useMemo } from 'react'
import api from '../../services/api'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminStats from '../../components/admin/AdminStats'
import UserTable from '../../components/admin/UserTable'
import ParcelTable from '../../components/admin/ParcelTable'
import ClientsDisplay from '../../components/admin/ClientsDisplay'
import StaffDisplay from '../../components/admin/StaffDisplay'
import CreateStaffModal from '../../components/admin/CreateStaffModal'
import StaffProfileModal from '../../components/StaffProfileModal'
import TopBar from '../../components/TopBar'
import DashboardGreeting from '../../components/DashboardGreeting'
import { ToastContainer, useToast } from '../../components/Toast'
import { Skeleton, SkeletonStatsRow } from '../../components/Skeleton'
import '../../styles/agent.css'
import '../../styles/admin.css'

const ADMIN_TITLES = {
  overview: 'Overview',
  users:    'User Management',
  parcels:  'All Parcels',
  clients:  'Clients',
  staff:    'Staff',
}

export default function AdminDashboard() {
  const [view, setView]             = useState('overview')
  const [users, setUsers]           = useState([])
  const [parcels, setParcels]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [showCreate, setShowCreate]   = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { toasts, toast, removeToast } = useToast()

  // Background polling skips the loading spinner so the tables don't flicker.
  const fetchData = async ({ showLoading = true } = {}) => {
    if (showLoading) setLoading(true)
    try {
      const [usersRes, parcelsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/parcels'),
      ])
      setUsers(usersRes.data)
      setParcels(parcelsRes.data)
    } catch (err) {
      console.error('Failed to fetch data', err)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Auto-refresh every 30s so new accounts and parcels appear live.
  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData({ showLoading: false }), 30000)
    return () => clearInterval(interval)
  }, [])

  // Stats computed from the lists so the cards refresh automatically on every re-fetch.
  const stats = useMemo(() => ({
    totalUsers:    users.length,
    totalAgents:   users.filter(u => u.role === 'agency' || u.role === 'agent').length,
    totalDrivers:  users.filter(u => u.role === 'driver').length,
    totalParcels:  parcels.length,
    pending:       parcels.filter(p => p.status === 'pending').length,
    delivered:     parcels.filter(p => p.status === 'delivered').length,
    failed:        parcels.filter(p => p.status === 'failed').length,
    successRate:   parcels.length
      ? Math.round((parcels.filter(p => p.status === 'delivered').length / parcels.length) * 100)
      : 0,
  }), [users, parcels])

  return (
    <div className="agent-layout">
      <AdminSidebar active={view} onNavigate={setView}/>

      <main className="agent-main" style={{ padding: 0 }}>
        <TopBar
          title={ADMIN_TITLES[view] || ''}
          role="admin"
          onOpenProfile={() => setShowProfile(true)}
        />

        <div style={{ padding: '24px 32px' }}>
          {view === 'overview' && <DashboardGreeting role="admin"/>}
          {view === 'overview' && (
            loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <SkeletonStatsRow count={4}/>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                  {[0, 1, 2].map(i => <Skeleton key={i} height={220} rounded={16}/>)}
                </div>
              </div>
            ) : (
              <AdminStats stats={stats} onNavigate={setView}/>
            )
          )}
          {view === 'users'    && <UserTable users={users.filter(u => ['admin','agency','driver'].includes(u.role))} loading={loading} onCreateNew={() => setShowCreate(true)} onRefresh={fetchData} toast={toast}/>}
          {view === 'parcels'  && <ParcelTable parcels={parcels} loading={loading}/>}
          {view === 'clients'  && <ClientsDisplay users={users.filter(u => u.role === 'client')} loading={loading}/>}
          {view === 'staff'    && <StaffDisplay   users={users.filter(u => ['admin','agency','driver'].includes(u.role))} loading={loading}/>}
        </div>
      </main>

      {showCreate && (
        <CreateStaffModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); fetchData(); toast.success('Staff account created') }}
        />
      )}
      {showProfile && <StaffProfileModal onClose={() => setShowProfile(false)}/>}
      <ToastContainer toasts={toasts} removeToast={removeToast}/>
    </div>
  )
}
