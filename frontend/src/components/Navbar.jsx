import { useState, useEffect } from 'react'

function BoxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8"/>
      <rect x="1" y="3" width="22" height="5"/>
      <line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
    </svg>
  )
}

const NAV_LINKS = [
  { label: 'Home',         id: 'home' },
  { label: 'Track Parcel', id: 'track' },
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'Contact',      id: 'contact' },
]

export default function Navbar({ onStaffClick, onClientClick }) {
  const [active, setActive] = useState('home')

  const scrollTo = (id) => {
    setActive(id)
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (id === 'contact') {
      document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // IntersectionObserver: set active link when section is 50% visible
  useEffect(() => {
    const sectionToNav = { hero: 'home', track: 'track', 'how-it-works': 'how-it-works' }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(sectionToNav[entry.target.id] || entry.target.id)
      })
    }, { threshold: 0.5 })

    Object.keys(sectionToNav).forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    // Footer / contact: not a section so use scroll fallback
    const onScroll = () => {
      const footer = document.querySelector('footer')
      if (footer && footer.getBoundingClientRect().top <= window.innerHeight) setActive('contact')
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      <style>{`
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link {
          background: none; border: none; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: .88rem; font-weight: 600; color: #475569;
          padding: 8px 12px; border-radius: 8px;
          position: relative; transition: color .18s;
          white-space: nowrap;
        }
        .nav-link:hover { color: #1a2e6e; }
        .nav-link.active { color: #f97316; }
        .nav-link.active::after {
          content: ''; position: absolute; bottom: -2px; left: 12px;
          right: 12px; height: 2px; background: #f97316; border-radius: 2px;
        }
        .navbar-right { display: flex; align-items: center; gap: 8px; }
        .nb-btn-outline {
          display: flex; align-items: center; gap: 6px;
          background: none; border: 1.5px solid #1a2e6e;
          color: #1a2e6e; padding: 8px 14px; border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700; font-size: .84rem; cursor: pointer;
          transition: background .18s, color .18s; white-space: nowrap;
        }
        .nb-btn-outline:hover { background: #1a2e6e; color: #fff; }
        .nb-btn-navy {
          display: flex; align-items: center; gap: 6px;
          background: #1a2e6e; border: none; color: #fff;
          padding: 8px 14px; border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700; font-size: .84rem; cursor: pointer;
          transition: background .18s; white-space: nowrap;
        }
        .nb-btn-navy:hover { background: #162554; }
        .nb-btn-orange {
          display: flex; align-items: center; gap: 6px;
          background: #f97316; border: none; color: #fff;
          padding: 8px 16px; border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700; font-size: .84rem; cursor: pointer;
          transition: background .18s; white-space: nowrap;
        }
        .nb-btn-orange:hover { background: #ea6c0a; }
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nb-btn-outline { display: none; }
          .nb-btn-navy { display: none; }
        }
      `}</style>

      <nav className="navbar" style={{ padding: '0 32px', height: 64 }}>
        <button
          onClick={() => scrollTo('home')}
          style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'1.2rem', fontWeight:800, color:'#1a2e6e', letterSpacing:'-.5px' }}
        >
          <BoxIcon /> Deliver<span style={{ color:'#f97316' }}>It</span>
        </button>

        <div className="nav-links">
          {NAV_LINKS.map(({ label, id }) => (
            <button
              key={id}
              className={`nav-link${active === id ? ' active' : ''}`}
              onClick={() => scrollTo(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="navbar-right">
          <button className="nb-btn-outline" onClick={onStaffClick}>
            <UserIcon /> Staff Portal
          </button>
          <button className="nb-btn-navy" onClick={onClientClick}>
            Client Login
          </button>
          <button className="nb-btn-orange" onClick={() => scrollTo('track')}>
            Track Now
          </button>
        </div>
      </nav>
    </>
  )
}
