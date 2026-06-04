import { SunIcon, CoffeeIcon, MoonIcon } from './Icons'

const SUBTITLES = {
  admin:  "Here's what's happening across the system today.",
  agent:  'Here are the parcels waiting for your attention.',
  driver: 'Here are your deliveries for today.',
  client: 'Here are your latest parcels.',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

// Pick the icon, color and animation based on the time of day
function getTimeIcon() {
  const h = new Date().getHours()
  if (h < 12)  return { Icon: SunIcon,    color: '#f97316', className: 'greeting-sun'  }
  if (h < 18)  return { Icon: CoffeeIcon, color: '#f97316', className: ''              }
  return         { Icon: MoonIcon,   color: '#6366f1', className: 'greeting-moon' }
}

function getDate() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function DashboardGreeting({ role }) {
  const fullName = role === 'client'
    ? (localStorage.getItem('client_name') || 'there')
    : (localStorage.getItem('staff_name')  || 'there')

  const firstName = fullName.split(' ')[0]
  const greeting  = getGreeting()
  const subtitle  = SUBTITLES[role] || ''
  const dateStr   = getDate()
  const { Icon, color, className } = getTimeIcon()

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
    }}>
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 6,
        }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#1a2e6e',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            lineHeight: 1.2,
            margin: 0,
          }}>
            {greeting}, {firstName}
          </h1>
          <Icon size={28} className={className} style={{ color, flexShrink: 0 }}/>
        </div>
        <p style={{
          fontSize: 14,
          color: '#64748b',
          margin: 0,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 400,
        }}>
          {subtitle}
        </p>
      </div>

      <div style={{
        fontSize: '.78rem',
        color: '#94a3b8',
        fontWeight: 500,
        paddingTop: 6,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        whiteSpace: 'nowrap',
      }}>
        {dateStr}
      </div>
    </div>
  )
}
