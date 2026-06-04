import { useState, useEffect, useRef } from 'react'
import StatCard from '../components/StatCard'
import { TruckIcon, MapPinIcon, UsersIcon, ChartBarIcon, SearchIcon, AlertIcon } from '../components/Icons'
import { validateTrackingCode } from '../utils/validation'
import api from '../services/api'
import '../styles/home-animations.css'

export default function HomePage({ onTrack, loading, error }) {
  const [input, setInput]           = useState('')
  const [trackError, setTrackError] = useState('')
  const [stats, setStats]           = useState({ wilayas: 69, delivered: 0, successRate: 0 })
  const heroRef = useRef(null)

  useEffect(() => {
    api.get('/stats').then(res => setStats(res.data)).catch(() => {})
  }, [])

  // Scroll-driven parallax + page progress — updates CSS vars directly,
  // no React re-render, stays at 60fps.
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const onScroll = () => {
      const scrollY = window.scrollY

      // Background drifts at 12% of scroll speed → depth illusion
      const drift = Math.max(0, -hero.getBoundingClientRect().top) * 0.12
      hero.style.setProperty('--bg-drift', `${drift}px`)

      // Thin progress bar at hero bottom — shows page scroll progress
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      hero.style.setProperty('--scroll-pct', totalScroll > 0 ? scrollY / totalScroll : 0)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const err = validateTrackingCode(input)
    if (err) { setTrackError(err); return }
    setTrackError('')
    onTrack(input.trim().toUpperCase())
  }

  return (
    <>
      <section className="hero hero-animated" id="hero" ref={heroRef}>

        {/* Parallax background — pure CSS, GPU-accelerated */}
        <div className="hero-bg" aria-hidden="true">
          <div className="map-dots" />
          <svg className="route-svg" viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid slice">
            {/* Animated dashed route paths that flow like roads on a map */}
            <path className="rp rp-1" d="M-80,180 C200,80 400,280 600,180 S1000,80 1280,180" />
            <path className="rp rp-2" d="M-80,260 C150,160 450,340 700,260 S1050,160 1280,260" />
            <path className="rp rp-3" d="M-80,100 C250,20  500,200 750,100 S1050,20  1280,100" />
          </svg>
          {/* GPS location pins that pulse like real tracking dots */}
          <span className="loc-pin lp-1" />
          <span className="loc-pin lp-2" />
          <span className="loc-pin lp-3" />
          <span className="loc-pin lp-4" />
        </div>

        {/* Trucks slide right→left in a continuous loop */}
        <div className="truck-rail" aria-hidden="true">
          <span className="truck tk-1"><TruckIcon size={40} /></span>
          <span className="truck tk-2"><TruckIcon size={30} /></span>
        </div>

        {/* Content layer — sits above the animated background */}
        <div className="hero-body">
          <h1>Welcome to <span className="accent">DeliverIt</span></h1>
          <p>Algeria's most trusted delivery service, connecting communities across the nation with speed, reliability, and care.</p>
          <div className="stats-grid">
            <StatCard icon={<MapPinIcon size={20}/>}   number={`${stats.wilayas}`}      label="Wilayas Covered" />
            <StatCard icon={<UsersIcon size={20}/>}    number={`${stats.delivered}+`}   label="Parcels Delivered" />
            <StatCard icon={<ChartBarIcon size={20}/>} number={`${stats.successRate}%`} label="Delivery Success Rate" />
          </div>
        </div>
      </section>

      <section className="track-section" id="track">
        <h2>Track Your Parcel</h2>
        <p>Enter your tracking code to see real-time updates</p>
        <form className="track-form" onSubmit={handleSubmit}>
          <input
            className={`track-input ${trackError ? 'track-input-error' : ''}`}
            type="text"
            placeholder="Enter your Tracking Code (e.g., DZ-2026-XYZ)"
            value={input}
            onChange={e => { setInput(e.target.value.toUpperCase()); setTrackError('') }}
          />
          <button type="submit" className="track-btn" disabled={loading} style={{display:'flex',alignItems:'center',gap:8}}>
            <SearchIcon size={16}/> {loading ? 'Searching...' : 'Track Parcel'}
          </button>
        </form>
        {trackError && <p style={{ color: '#dc2626', marginTop: 10, fontSize: '.88rem', display:'flex', alignItems:'center', gap:6 }}><AlertIcon size={14}/> {trackError}</p>}
        {error      && <p style={{ color: '#dc2626', marginTop: 10, fontSize: '.88rem' }}>{error}</p>}
      </section>

      <section id="how-it-works" style={{ padding:'96px 24px 88px', background:'#fff', textAlign:'center' }}>
        <h2 style={{ fontSize:'1.9rem', fontWeight:800, color:'#1a2e6e', marginBottom:14 }}>How It Works</h2>
        <p style={{ color:'#64748b', marginBottom:56, fontSize:'.97rem', maxWidth:480, margin:'0 auto 56px' }}>Simple steps to send and track your parcels across Algeria</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:28, maxWidth:1000, margin:'0 auto' }}>

          {[
            { num:1, accent:'#1a2e6e', bg:'#eff6ff', icon:<MapPinIcon size={28}/>,    title:'Register Parcel',    desc:'Agents register parcels and generate tracking codes instantly at any of our agency locations.' },
            { num:2, accent:'#f97316', bg:'#fff7ed', icon:<TruckIcon size={28}/>,     title:'Real-Time Tracking', desc:'Track your parcel live across all 69 wilayas of Algeria with up-to-date status updates.' },
            { num:3, accent:'#16a34a', bg:'#f0fdf4', icon:<ChartBarIcon size={28}/>, title:'Confirm & Rate',     desc:'Confirm delivery and rate your experience to help us keep improving our service.' },
          ].map(({ num, accent, bg, icon, title, desc }) => (
            <div key={num} style={{
              background:'#fff', borderRadius:20,
              padding:'44px 28px 36px',
              boxShadow:'0 2px 16px rgba(26,46,110,.07), 0 1px 3px rgba(26,46,110,.04)',
              display:'flex', flexDirection:'column', alignItems:'center',
              position:'relative', borderTop:`3px solid ${accent}`,
            }}>
              <div style={{
                position:'absolute', top:-14, left:28,
                width:28, height:28, borderRadius:'50%',
                background:accent, color:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'.8rem', fontWeight:800, boxShadow:`0 2px 8px ${accent}55`,
              }}>{num}</div>
              <div style={{
                width:64, height:64, borderRadius:16,
                background:bg, color:accent,
                display:'flex', alignItems:'center', justifyContent:'center',
                marginBottom:20,
              }}>{icon}</div>
              <h3 style={{ fontSize:'1.05rem', fontWeight:700, color:'#1e293b', margin:'0 0 10px' }}>{title}</h3>
              <p style={{ color:'#64748b', fontSize:'.88rem', margin:0, lineHeight:1.65 }}>{desc}</p>
            </div>
          ))}

        </div>
      </section>
    </>
  )
}
