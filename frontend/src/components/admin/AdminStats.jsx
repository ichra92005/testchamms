import { UserIcon, PackageIcon, ChartIcon } from '../Icons'

export default function AdminStats({ stats, onNavigate }) {
  return (
    <div>
      <div className="stats-row" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="stat-box">
          <div className="stat-box-number">{stats.totalParcels}</div>
          <div className="stat-box-label">Total Parcels</div>
        </div>
        <div className="stat-box pending">
          <div className="stat-box-number">{stats.pending}</div>
          <div className="stat-box-label">Pending</div>
        </div>
        <div className="stat-box delivered">
          <div className="stat-box-number">{stats.delivered}</div>
          <div className="stat-box-label">Delivered</div>
        </div>
        <div className="stat-box" style={{borderColor:'#dc2626'}}>
          <div className="stat-box-number">{stats.failed}</div>
          <div className="stat-box-label">Failed</div>
        </div>
      </div>

      <div className="admin-overview-grid">
        {/* Staff summary */}
        <div className="admin-card">
          <h3 className="admin-card-title"><UserIcon size={15}/> Staff Summary</h3>
          <div className="admin-stat-row"><span>Total Staff</span><strong>{stats.totalUsers}</strong></div>
          <div className="admin-stat-row"><span>Agency Agents</span><strong>{stats.totalAgents}</strong></div>
          <div className="admin-stat-row"><span>Drivers</span><strong>{stats.totalDrivers}</strong></div>
          <button className="btn-primary" style={{marginTop:20,width:'100%'}} onClick={() => onNavigate('users')}>
            Manage Staff
          </button>
        </div>

        {/* Success rate */}
        <div className="admin-card">
          <h3 className="admin-card-title"><ChartIcon size={15}/> Delivery Success Rate</h3>
          <div className="success-rate-display">
            <div className="success-rate-number">{stats.successRate}%</div>
            <div className="success-rate-bar">
              <div className="success-rate-fill" style={{width:`${stats.successRate}%`}}/>
            </div>
            <p className="success-rate-label">{stats.delivered} delivered out of {stats.totalParcels} total</p>
          </div>
          <button className="btn-primary" style={{marginTop:20,width:'100%'}} onClick={() => onNavigate('parcels')}>
            View All Parcels
          </button>
        </div>

        {/* Status breakdown */}
        <div className="admin-card">
          <h3 className="admin-card-title"><PackageIcon size={15}/> Parcel Status Breakdown</h3>
          {[
            { label: 'Pending',     value: stats.pending,                                                              color: '#f97316' },
            { label: 'Delivered',   value: stats.delivered,                                                            color: '#22c55e' },
            { label: 'Failed',      value: stats.failed,                                                               color: '#dc2626' },
            { label: 'In Progress', value: stats.totalParcels - stats.pending - stats.delivered - stats.failed,        color: '#3b82f6' },
          ].map(item => (
            <div key={item.label} className="breakdown-row">
              <div className="breakdown-label">
                <span className="breakdown-dot" style={{background:item.color}}/>
                {item.label}
              </div>
              <div className="breakdown-bar-wrap">
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{
                    width: stats.totalParcels ? `${(item.value/stats.totalParcels)*100}%` : '0%',
                    background: item.color,
                  }}/>
                </div>
                <span className="breakdown-count">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
