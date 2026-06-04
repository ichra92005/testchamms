function BoxIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
}
function PlusIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function TruckIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
}

export default function AgentSidebar({ active, onNavigate }) {
  const links = [
    { key: 'parcels', label: 'Parcels',        icon: <BoxIcon /> },
    { key: 'create',  label: 'Register Parcel', icon: <PlusIcon /> },
  ]

  return (
    <aside className="agent-sidebar">
      <div className="sidebar-brand">
        <TruckIcon />
        <span>DeliverIt</span>
      </div>
      <div className="sidebar-role">Agent Portal</div>

      <nav className="sidebar-nav">
        {links.map(l => (
          <button
            key={l.key}
            className={`sidebar-link ${active === l.key ? 'sidebar-active' : ''}`}
            onClick={() => onNavigate(l.key)}
          >
            {l.icon}
            {l.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <a href="/" className="sidebar-link">
          ← Back to Website
        </a>
      </div>
    </aside>
  )
}
