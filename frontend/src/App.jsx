import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import TrackingResultPage from './pages/TrackingResultPage'
import AuthPage from './pages/AuthPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AgentDashboard from './pages/agent/AgentDashboard'
import DriverDashboard from './pages/driver/DriverDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import ClientDashboard from './pages/client/ClientDashboard'
import { trackParcel } from './services/api'

function App() {
  const [showAuth, setShowAuth]             = useState(null) // null | 'client' | 'staff'
  const [trackingResult, setTrackingResult] = useState(null)
  const [searched, setSearched]             = useState(false)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')

  // Password reset / first-time setup: detect ?reset_token=&email= in the URL
  const _params     = new URLSearchParams(window.location.search)
  const resetToken  = _params.get('reset_token')
  const resetEmail  = _params.get('email')

  if (resetToken && resetEmail) {
    const handleResetDone = () => {
      window.history.replaceState({}, '', '/')
      window.location.href = '/'
    }
    return <ResetPasswordPage token={resetToken} email={resetEmail} onDone={handleResetDone} />
  }

  const role        = localStorage.getItem('staff_role')
  const staffToken  = localStorage.getItem('staff_token')
  const clientToken = localStorage.getItem('client_token')

  // Staff dashboards
  if (staffToken && role) {
    if (role === 'admin')                      return <AdminDashboard />
    if (role === 'agency' || role === 'agent') return <AgentDashboard />
    if (role === 'driver')                     return <DriverDashboard />
  }

  // Client dashboard
  if (clientToken) {
    const handleTrackFromDashboard = async (code) => {
      setLoading(true); setError('')
      try {
        const res = await trackParcel(code)
        setTrackingResult(res.data)
        setSearched(true)
      } catch {
        setTrackingResult(null)
        setSearched(true)
      } finally { setLoading(false) }
    }

    if (searched) return (
      <>
        <TrackingResultPage
          parcel={trackingResult}
          onBack={() => { setSearched(false); setTrackingResult(null) }}
        />
      </>
    )

    return <ClientDashboard onTrack={handleTrackFromDashboard}/>
  }

  const handleTrack = async (code) => {
    setLoading(true); setError('')
    try {
      const res = await trackParcel(code)
      setTrackingResult(res.data)
      setSearched(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      if (err.response?.status === 404) {
        setTrackingResult(null)
        setSearched(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setError('Could not connect to server. Please try again.')
      }
    } finally { setLoading(false) }
  }

  const handleBack = () => {
    setSearched(false)
    setTrackingResult(null)
    setError('')
  }

  if (showAuth) return <AuthPage onBack={() => setShowAuth(null)} defaultTab={showAuth}/>

  return (
    <>
      <Navbar
        onStaffClick={() => setShowAuth('staff')}
        onClientClick={() => setShowAuth('client')}
      />
      {searched
        ? <TrackingResultPage parcel={trackingResult} onBack={handleBack}/>
        : <HomePage onTrack={handleTrack} loading={loading} error={error}/>
      }
      <Footer/>
    </>
  )
}

export default App
