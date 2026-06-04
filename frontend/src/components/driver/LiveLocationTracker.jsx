import { useEffect, useRef, useState } from 'react'
import api from '../../services/api'
import { MapPinIcon, AlertIcon, XIcon, ClockIcon } from '../Icons'

export default function LiveLocationTracker({ parcelId, active }) {
  const [status, setStatus] = useState('idle')
  const intervalRef         = useRef(null)

  const sendLocation = (parcelId) => {
    if (!navigator.geolocation) { setStatus('error'); return }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.post(`/parcels/${parcelId}/location`, { lat: pos.coords.latitude, lng: pos.coords.longitude })
          setStatus('tracking')
        } catch { setStatus('error') }
      },
      (err) => { if (err.code === 1) setStatus('denied'); else setStatus('error') },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  useEffect(() => {
    if (active && parcelId) {
      sendLocation(parcelId)
      intervalRef.current = setInterval(() => sendLocation(parcelId), 5000)
    } else {
      clearInterval(intervalRef.current)
      setStatus('idle')
    }
    return () => clearInterval(intervalRef.current)
  }, [active, parcelId])

  if (!active) return null

  const configs = {
    tracking: { bg:'#f0fdf4', border:'#bbf7d0', color:'#166534', dot:'#22c55e', icon: <MapPinIcon size={15}/>, text: 'Sharing live location' },
    error:    { bg:'#fff7ed', border:'#fed7aa', color:'#c2410c', dot:'#f97316', icon: <AlertIcon size={15}/>,  text: 'Location error — retrying...' },
    denied:   { bg:'#fef2f2', border:'#fecaca', color:'#dc2626', dot:'#dc2626', icon: <XIcon size={15}/>,     text: 'Location permission denied' },
    idle:     { bg:'#eff6ff', border:'#bfdbfe', color:'#1d4ed8', dot:'#3b82f6', icon: <ClockIcon size={15}/>, text: 'Starting GPS...' },
  }

  const c = configs[status] || configs.idle

  return (
    <div style={{
      background: c.bg, border: `1.5px solid ${c.border}`,
      borderRadius: 12, padding: '10px 16px', marginBottom: 12,
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: '.85rem', fontWeight: 600, color: c.color,
    }}>
      <span style={{
        width: 10, height: 10, borderRadius: '50%', background: c.dot, flexShrink: 0,
        animation: status === 'tracking' ? 'pulse 1.5s infinite' : 'none',
      }}/>
      <span style={{ display:'flex', alignItems:'center', gap:6 }}>
        {c.icon} {c.text}
      </span>
      {status === 'denied' && (
        <span style={{ fontSize:'.75rem', fontWeight:400, marginLeft:4 }}>
          — Enable location in browser settings
        </span>
      )}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  )
}
