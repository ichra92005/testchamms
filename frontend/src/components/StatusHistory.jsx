import { CheckIcon, UserIcon, TruckIcon, PackageIcon, XIcon } from './Icons'

const STATUS_CONFIG = {
  pending:          { label: 'Pending Validation', color: '#c2410c', bg: '#fff7ed', icon: <PackageIcon size={14}/> },
  registered:       { label: 'Registered',         color: '#1d4ed8', bg: '#eff6ff', icon: <CheckIcon size={14}/> },
  assigned:         { label: 'Assigned to Driver', color: '#15803d', bg: '#f0fdf4', icon: <UserIcon size={14}/> },
  accepted:         { label: 'Accepted by Driver', color: '#15803d', bg: '#f0fdf4', icon: <CheckIcon size={14}/> },
  refused:          { label: 'Refused by Driver',  color: '#dc2626', bg: '#fef2f2', icon: <XIcon size={14}/> },
  out_for_delivery: { label: 'Out for Delivery',   color: '#7e22ce', bg: '#fdf4ff', icon: <TruckIcon size={14}/> },
  delivered:        { label: 'Delivered',           color: '#166534', bg: '#f0fdf4', icon: <CheckIcon size={14}/> },
  failed:           { label: 'Failed Delivery',    color: '#dc2626', bg: '#fef2f2', icon: <XIcon size={14}/> },
  confirmed:        { label: 'Reception Confirmed', color: '#166534', bg: '#f0fdf4', icon: <CheckIcon size={14}/> },
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function StatusHistory({ history }) {
  if (!history || history.length === 0) return null

  return (
    <div className="history-card">
      <h3 className="history-title">Status History</h3>
      <div className="history-timeline">
        {history.map((entry, i) => {
          const config = STATUS_CONFIG[entry.status] || { label: entry.status, color: '#475569', bg: '#f1f5f9', icon: <PackageIcon size={14}/> }
          const isLast = i === history.length - 1

          return (
            <div key={entry.id} className="history-entry">
              {/* Line connector */}
              <div className="history-line-col">
                <div className="history-dot" style={{ background: config.color, boxShadow: isLast ? `0 0 0 4px ${config.bg}` : 'none' }}>
                  <span style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {config.icon}
                  </span>
                </div>
                {!isLast && <div className="history-connector"/>}
              </div>

              {/* Content */}
              <div className="history-content">
                <div className="history-header">
                  <span className="history-status-badge" style={{ background: config.bg, color: config.color }}>
                    {config.label}
                  </span>
                  <span className="history-time">{formatDateTime(entry.created_at)}</span>
                </div>
                {entry.changed_by_name && (
                  <div className="history-by">
                    <UserIcon size={12}/> {entry.changed_by_name}
                  </div>
                )}
                {entry.note && (
                  <div className="history-note">{entry.note}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
