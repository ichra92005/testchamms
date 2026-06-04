import { TruckIcon, PackageIcon, ArrowLeftIcon, BuildingIcon } from '../Icons'

export default function DriverSidebar() {
  const driverType = localStorage.getItem('driver_type')
  const wilaya     = localStorage.getItem('driver_wilaya')
  const routeFrom  = localStorage.getItem('driver_route_from')
  const routeTo    = localStorage.getItem('driver_route_to')

  return (
    <aside className="agent-sidebar">
      <div className="sidebar-brand">
        <TruckIcon size={22}/>
        <span>DeliverIt</span>
      </div>
      <div className="sidebar-role">Driver Portal</div>

      {driverType && (
        <div style={{
          margin:'8px 16px 4px', padding:'10px 14px',
          background: driverType==='inter' ? 'rgba(59,130,246,.15)' : 'rgba(34,197,94,.15)',
          borderRadius:10, fontSize:'.78rem', fontWeight:700,
          color: driverType==='inter' ? '#93c5fd' : '#86efac',
          display:'flex', alignItems:'center', gap:6,
        }}>
          {driverType === 'inter'
            ? <><TruckIcon size={13}/> {routeFrom} ↔ {routeTo}</>
            : <><BuildingIcon size={13}/> {wilaya}</>
          }
        </div>
      )}

      <nav className="sidebar-nav" style={{marginTop:12}}>
        <button className="sidebar-link sidebar-active">
          <PackageIcon size={16}/> My Deliveries
        </button>
      </nav>

      <div className="sidebar-footer">
        <a href="/" className="sidebar-link">
          <ArrowLeftIcon size={15}/> Back to Website
        </a>
      </div>
    </aside>
  )
}
