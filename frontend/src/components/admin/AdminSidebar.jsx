import { ChartIcon, UserIcon, PackageIcon, ArrowLeftIcon, ShieldIcon } from '../Icons'

export default function AdminSidebar({ active, onNavigate }) {
  const links = [
    { key: 'overview', label: 'Overview',        icon: <ChartIcon size={16}/> },
    { key: 'users',    label: 'User Management', icon: <UserIcon size={16}/> },
    { key: 'parcels',  label: 'All Parcels',     icon: <PackageIcon size={16}/> },
  ]

  return (
    <aside className="agent-sidebar">
      <div className="sidebar-brand">
        <ShieldIcon size={22}/>
        <span>DeliverIt</span>
      </div>
      <div className="sidebar-role">Admin Portal</div>

      <nav className="sidebar-nav">
        {links.map(l => (
          <button
            key={l.key}
            className={`sidebar-link ${active === l.key ? 'sidebar-active' : ''}`}
            onClick={() => onNavigate(l.key)}
          >
            {l.icon} {l.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <a href="/" className="sidebar-link">
          <ArrowLeftIcon size={15}/> Back to Website
        </a>
      </div>
    </aside>
  )
}
