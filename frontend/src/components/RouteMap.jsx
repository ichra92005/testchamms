import { MapPinIcon } from './Icons'

export default function RouteMap({ from, to }) {
  return (
    <div className="route-card">
      <h3>Delivery Route</h3>
      <div className="route-map">
        <svg viewBox="0 0 900 200" preserveAspectRatio="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
          <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d1d5db" strokeWidth="0.6"/></pattern></defs>
          <rect width="900" height="200" fill="url(#grid)"/>
          <path d="M 160 140 Q 450 20 740 140" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="12 7"/>
          <circle cx="160" cy="140" r="10" fill="#22c55e"/>
          <circle cx="740" cy="140" r="10" fill="#1a2e6e"/>
        </svg>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-80%)',textAlign:'center',zIndex:1}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:6,color:'#94a3b8'}}>
            <MapPinIcon size={28}/>
          </div>
          <p style={{fontWeight:600,color:'#475569',fontSize:'.95rem'}}>Route Visualization</p>
          <small style={{color:'#94a3b8',fontSize:'.8rem'}}>From {from} to {to}</small>
        </div>
      </div>
    </div>
  )
}
