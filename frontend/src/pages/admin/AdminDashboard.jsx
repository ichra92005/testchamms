import { useState, useEffect } from 'react'
import api from '../../services/api'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminStats from '../../components/admin/AdminStats'
import UserTable from '../../components/admin/UserTable'
import ParcelTable from '../../components/admin/ParcelTable'
import CreateStaffModal from '../../components/admin/CreateStaffModal'
import { ShieldIcon, LogoutIcon } from '../../components/Icons'
import StaffProfileModal from '../../components/StaffProfileModal'
import '../../styles/agent.css'
import '../../styles/admin.css'

export default function AdminDashboard() {
  const [view, setView]             = useState('overview')
  const [users, setUsers]           = useState([])
  const [parcels, setParcels]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [showCreate, setShowCreate]   = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const fetchData = async () => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const stats = {
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
  }

  return (
    <div className="agent-layout">
      <AdminSidebar active={view} onNavigate={setView}/>

      <main className="agent-main">
        <div className="agent-topbar">
          <div>
            <h1 className="agent-title">
              {view === 'overview' && 'System Overview'}
              {view === 'users'    && 'User Management'}
              {view === 'parcels'  && 'All Parcels'}
            </h1>
            <p className="agent-subtitle">
              {view === 'overview' && 'System health and key metrics'}
              {view === 'users'    && 'Manage agents, drivers and staff accounts'}
              {view === 'parcels'  && 'Monitor all parcels across the system'}
            </p>
          </div>
          <div className="topbar-right">
            <button className="agent-name" style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:'inherit',color:'inherit'}}
              onClick={() => setShowProfile(true)}>
              <ShieldIcon size={15}/> {localStorage.getItem('staff_name') || 'Admin'}
            </button>
            <button className="btn-logout" style={{display:'flex',alignItems:'center',gap:6}} onClick={() => { localStorage.clear(); window.location.href = '/' }}>
              <LogoutIcon size={14}/> Logout
            </button>
          </div>
        </div>

        {view === 'overview' && <AdminStats stats={stats} onNavigate={setView}/>}
        {view === 'users'    && <UserTable users={users} loading={loading} onCreateNew={() => setShowCreate(true)} onRefresh={fetchData}/>}
        {view === 'parcels'  && <ParcelTable parcels={parcels} loading={loading}/>}
      </main>

      {showCreate && (
        <CreateStaffModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); fetchData() }}
        />
      )}
      {showProfile && <StaffProfileModal onClose={() => setShowProfile(false)}/>}
    </div>
  )
}
