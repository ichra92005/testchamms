import { useEffect, useRef, useState, useCallback } from 'react'
import Stepper from '../components/Stepper'
import PaymentProofUpload from '../components/PaymentProofUpload'
import TrackingSlip from '../components/TrackingSlip'
import { PackageIcon, CalendarIcon, ClockIcon, MapPinIcon, UserIcon, PhoneIcon, CashIcon, CardIcon, ArrowLeftIcon, CheckIcon, XIcon, RefreshIcon, PrinterIcon } from '../components/Icons'
import api from '../services/api'
import '../styles/history.css'

const WILAYA_COORDS = {
  "Adrar":[27.87,-0.29],"Chlef":[36.16,1.33],"Laghouat":[33.8,2.87],"Oum El Bouaghi":[35.87,7.11],
  "Batna":[35.55,6.17],"Béjaïa":[36.75,5.08],"Biskra":[34.85,5.73],"Béchar":[31.62,-2.22],
  "Blida":[36.47,2.83],"Bouira":[36.37,3.9],"Tamanrasset":[22.78,5.52],"Tébessa":[35.4,8.12],
  "Tlemcen":[34.88,-1.32],"Tiaret":[35.37,1.32],"Tizi Ouzou":[36.72,4.05],"Alger":[36.74,3.06],
  "Djelfa":[34.67,3.25],"Jijel":[36.82,5.77],"Sétif":[36.19,5.41],"Saïda":[34.83,0.15],
  "Skikda":[36.87,6.9],"Sidi Bel Abbès":[35.18,-0.63],"Annaba":[36.9,7.77],"Guelma":[36.46,7.43],
  "Constantine":[36.37,6.61],"Médéa":[36.26,2.75],"Mostaganem":[35.93,0.09],"M'Sila":[35.7,4.54],
  "Mascara":[35.4,0.14],"Ouargla":[31.95,5.32],"Oran":[35.69,-0.63],"El Bayadh":[33.68,1.02],
  "Illizi":[26.48,8.47],"Bordj Bou Arréridj":[36.07,4.76],"Boumerdès":[36.76,3.48],
  "El Tarf":[36.77,8.31],"Tindouf":[27.67,-8.14],"Tissemsilt":[35.6,1.81],"El Oued":[33.36,6.86],
  "Khenchela":[35.43,7.14],"Souk Ahras":[36.28,7.95],"Tipaza":[36.59,2.45],"Mila":[36.45,6.26],
  "Aïn Defla":[36.26,1.97],"Naâma":[33.27,-0.31],"Aïn Témouchent":[35.3,-1.14],
  "Ghardaïa":[32.49,3.67],"Relizane":[35.74,0.56],"Timimoun":[29.26,0.24],
  "Bordj Badji Mokhtar":[21.33,0.95],"Ouled Djellal":[34.42,5.07],"Béni Abbès":[30.13,-2.17],
  "In Salah":[27.2,2.47],"In Guezzam":[19.57,5.77],"Touggourt":[33.1,6.07],"Djanet":[24.55,9.48],
  "El M'Ghair":[33.95,5.93],"El Meniaa":[30.58,2.88],"Aflou":[34.11,2.1],"Barika":[35.39,5.36],
  "Ksar Chellala":[35.18,2.32],"Messaad":[34.15,3.5],"Aïn Oussera":[35.45,2.9],
  "Boussaâda":[35.21,4.18],"El Abiodh Sidi Cheikh":[32.89,0.53],"El Kantara":[35.22,5.69],
  "Bir El Ater":[34.74,7.93],"Ksar El Boukhari":[35.88,2.75],"El Aricha":[34.22,-1.26],
}

async function getCoordinates(location) {
  const parts = location.split(' - ')
  const commune = parts[1]?.trim()
  const wilaya  = parts[0]?.trim()
  try {
    const query = commune ? `${commune}, ${wilaya}, Algeria` : `${wilaya}, Algeria`
    const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`)
    const data = await res.json()
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
  } catch {}
  return WILAYA_COORDS[wilaya] || [36.74, 3.06]
}

function DeliveryMap({ from, to, trackingCode, isLive }) {
  const mapRef=useRef(null); const mapObjRef=useRef(null)
  const driverMarker=useRef(null); const mapInitRef=useRef(false); const pollRef=useRef(null)
  const [geoLoading, setGeoLoading] = useState(true)

  const updateDriverPin=useCallback((L,lat,lng)=>{
    if(!mapObjRef.current) return
    if(driverMarker.current){ driverMarker.current.setLatLng([lat,lng]) }
    else {
      const icon=L.divIcon({html:`<div style="position:relative"><div style="width:22px;height:22px;background:#f97316;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(249,115,22,.6)"></div><div style="position:absolute;top:-2px;left:-2px;width:26px;height:26px;background:rgba(249,115,22,.3);border-radius:50%;animation:ripple 1.5s infinite"></div></div>`,className:'',iconAnchor:[11,11]})
      driverMarker.current=L.marker([lat,lng],{icon}).addTo(mapObjRef.current).bindPopup('<strong><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>Driver</strong><br>Live location')
    }
  },[])

  useEffect(()=>{
    if(mapInitRef.current) return; mapInitRef.current=true

    const link=document.createElement('link'); link.rel='stylesheet'; link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link)
    const script=document.createElement('script'); script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

    // Fetch both coordinates in parallel with Leaflet loading
    const coordsPromise = Promise.all([getCoordinates(from), getCoordinates(to)])

    script.onload=async()=>{
      const L=window.L; if(!mapRef.current) return
      const [fc, tc] = await coordsPromise
      setGeoLoading(false)
      if(!mapRef.current) return

      const map=L.map(mapRef.current,{zoomControl:true}).setView([(fc[0]+tc[0])/2,(fc[1]+tc[1])/2],6)
      mapObjRef.current=map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map)
      const gi=L.divIcon({html:`<div style="width:16px;height:16px;background:#22c55e;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,className:'',iconAnchor:[8,8]})
      const ni=L.divIcon({html:`<div style="width:16px;height:16px;background:#1a2e6e;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,className:'',iconAnchor:[8,8]})
      L.marker(fc,{icon:gi}).addTo(map).bindPopup(`<strong>Origin:</strong> ${from}`)
      L.marker(tc,{icon:ni}).addTo(map).bindPopup(`<strong>Destination:</strong> ${to}`)
      try{
        const osrmUrl=`https://router.project-osrm.org/route/v1/driving/${fc[1]},${fc[0]};${tc[1]},${tc[0]}?overview=full&geometries=geojson`
        const osrmRes=await fetch(osrmUrl)
        const osrmData=await osrmRes.json()
        const routeCoords=osrmData.routes[0].geometry.coordinates.map(([lng,lat])=>[lat,lng])
        const routeLine=L.polyline(routeCoords,{color:'#f97316',weight:4,opacity:0.8,lineJoin:'round',lineCap:'round'}).addTo(map)
        map.fitBounds(routeLine.getBounds(),{padding:[40,40]})
      }catch{
        L.polyline([fc,tc],{color:'#1a2e6e',weight:2,dashArray:'8 6',opacity:.4}).addTo(map)
        map.fitBounds(L.latLngBounds([fc,tc]),{padding:[40,40]})
      }
      if(isLive){
        const poll=async()=>{
          try{ const res=await api.get(`/parcels/${trackingCode}/location`); if(res.data.tracking) updateDriverPin(L,res.data.lat,res.data.lng) }catch{}
        }
        poll(); pollRef.current=setInterval(poll,5000)
      }
    }
    document.head.appendChild(script)
    return ()=>{ if(pollRef.current) clearInterval(pollRef.current) }
  },[from,to,trackingCode,isLive,updateDriverPin])

  return (
    <div className="route-card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h3>Delivery Route</h3>
        {isLive&&<span style={{display:'flex',alignItems:'center',gap:6,background:'#fff7ed',border:'1px solid #fed7aa',color:'#c2410c',padding:'4px 12px',borderRadius:999,fontSize:'.78rem',fontWeight:700}}>
          <span style={{width:8,height:8,borderRadius:'50%',background:'#f97316',display:'inline-block',animation:'pulse 1.5s infinite'}}/>Live Tracking
        </span>}
      </div>
      <style>{`@keyframes ripple{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.5);opacity:0}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
      <div style={{position:'relative',height:300,borderRadius:12,overflow:'hidden',border:'1px solid #e2e8f0'}}>
        <div ref={mapRef} style={{height:'100%'}}/>
        {geoLoading&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(248,250,252,.88)',zIndex:1000,gap:10,fontSize:'.85rem',color:'#64748b',fontWeight:600}}>
          <div style={{width:16,height:16,border:'2.5px solid #e2e8f0',borderTopColor:'#1a2e6e',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
          Locating...
        </div>}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:16,marginTop:12,fontSize:'.78rem',color:'#64748b',flexWrap:'wrap'}}>
        <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:10,height:10,background:'#22c55e',borderRadius:'50%',display:'inline-block'}}/> Origin: {from}</span>
        <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:10,height:10,background:'#1a2e6e',borderRadius:'50%',display:'inline-block'}}/> Destination: {to}</span>
        {isLive&&<span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:10,height:10,background:'#f97316',borderRadius:'50%',display:'inline-block'}}/> Driver (live)</span>}
      </div>
    </div>
  )
}

function StarRating({value,onChange,readonly=false}){const[hovered,setHovered]=useState(0);return(<div style={{display:'flex',gap:6}}>{[1,2,3,4,5].map(s=>(<span key={s} onClick={()=>!readonly&&onChange(s)} onMouseEnter={()=>!readonly&&setHovered(s)} onMouseLeave={()=>!readonly&&setHovered(0)} style={{fontSize:'2rem',cursor:readonly?'default':'pointer',color:s<=(hovered||value)?'#f97316':'#e2e8f0',transition:'color .15s',userSelect:'none'}}>★</span>))}</div>)}

function ConfirmReceptionModal({parcel,onClose,onSuccess}){const[rating,setRating]=useState(0);const[comment,setComment]=useState('');const[loading,setLoading]=useState(false);const[error,setError]=useState('');const handleSubmit=async()=>{if(rating===0){setError('Please select a rating.');return}setLoading(true);setError('');try{await api.post(`/parcels/${parcel.id}/confirm-reception`,{rating,comment});onSuccess()}catch(err){setError(err.response?.data?.message||'Failed to confirm.')}finally{setLoading(false)}};return(<div className="modal-overlay" onClick={onClose}><div className="modal-box" style={{width:460}} onClick={e=>e.stopPropagation()}><button className="modal-close-btn" onClick={onClose}>✕</button><div style={{textAlign:'center',marginBottom:24}}><div style={{width:64,height:64,borderRadius:'50%',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}><CheckIcon size={28} style={{color:'#22c55e'}}/></div><h2 className="modal-title">Confirm Reception</h2><p className="modal-sub">Parcel: <strong>{parcel.tracking_code}</strong></p></div>{error&&<div className="form-error">{error}</div>}<div className="field-group"><label className="field-label">Rate your delivery experience</label><StarRating value={rating} onChange={setRating}/><p style={{fontSize:'.78rem',color:'#94a3b8',marginTop:4}}>{rating===1&&'Very poor'}{rating===2&&'Poor'}{rating===3&&'Average'}{rating===4&&'Good'}{rating===5&&'Excellent!'}</p></div><div className="field-group"><label className="field-label">Comment (optional)</label><textarea className="field-textarea" placeholder="Share your experience..." rows={3} value={comment} onChange={e=>setComment(e.target.value)}/></div><div className="modal-actions"><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={handleSubmit} disabled={loading||rating===0} style={{background:rating>0?'#22c55e':undefined}}><span style={{display:'flex',alignItems:'center',gap:8}}><CheckIcon size={15}/> {loading?'Confirming...':'Confirm Reception'}</span></button></div></div></div>)}

const STATUS_STEPS=['pending','registered','assigned','out_for_delivery','delivered']
const STEP_LABELS=['Order Received','Registered','In Transit','On the Way','Delivered']

function transformParcel(p){const ci=STATUS_STEPS.indexOf(p.status);const steps=STATUS_STEPS.map((s,i)=>({label:STEP_LABELS[i],date:i<=ci?new Date(p.updated_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—',status:i<ci?'done':i===ci?'active':'pending'}));return{id:p.tracking_code,steps,from:p.pickup_location||p.origin_wilaya||'Origin',to:p.destination||p.destination_wilaya||'Destination',pickup:{name:p.sender_name||'Sender',address:p.pickup_location||'—'},dropoff:{name:p.receiver_name,address:p.delivery_address||p.destination||'—'},customer:{fullName:p.receiver_name,phone:p.receiver_phone},pickupDate:new Date(p.created_at).toLocaleString('en-US',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}),estimateDrop:'3–5 Days',returnTime:'In 7 Days'}}

export default function TrackingResultPage({ parcel, onBack }) {
  const [showConfirm,setShowConfirm]=useState(false)
  const [showSlip,setShowSlip]=useState(false)
  const [confirmed,setConfirmed]=useState(false)
  const [currentParcel,setCurrentParcel]=useState(parcel)
  const [lastUpdate,setLastUpdate]=useState(new Date())

  const isLive = currentParcel?.status === 'out_for_delivery'

  const refreshParcel = useCallback(async () => {
    try {
      const res = await api.get(`/parcels/track/${currentParcel?.tracking_code}`)
      setCurrentParcel(res.data)
      setLastUpdate(new Date())
    } catch {}
  }, [currentParcel?.tracking_code])

  // Auto-refresh every 30s when out for delivery
  useEffect(() => {
    if (!isLive) return
    const interval = setInterval(refreshParcel, 30000)
    return () => clearInterval(interval)
  }, [isLive, refreshParcel])

  if(!currentParcel) return (
    <div className="result-page">
      <button className="back-link" onClick={onBack} style={{display:'flex',alignItems:'center',gap:8}}><ArrowLeftIcon size={16}/> Back to Tracking</button>
      <div className="not-found"><PackageIcon size={64} style={{opacity:.2,marginBottom:16}}/><h3>Parcel Not Found</h3><p>We could not find a parcel with that tracking number.</p></div>
    </div>
  )

  const {id,steps,from,to,pickup,dropoff,customer,pickupDate,estimateDrop,returnTime}=transformParcel(currentParcel)
  const isDelivered=currentParcel.status==='delivered'||currentParcel.status==='confirmed'
  const isConfirmed=currentParcel.status==='confirmed'||confirmed
  const isFailed=currentParcel.status==='failed'||currentParcel.status==='refused'

  return (
    <div className="result-page">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <button className="back-link" onClick={onBack} style={{display:'flex',alignItems:'center',gap:8}}><ArrowLeftIcon size={16}/> Back to Tracking</button>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          {isLive && <span style={{fontSize:'.75rem',color:'#94a3b8'}}>Updated {lastUpdate.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</span>}
          <button onClick={refreshParcel} style={{padding:'8px 14px',borderRadius:8,border:'1.5px solid #e2e8f0',background:'#f8fafc',fontFamily:'inherit',fontWeight:600,fontSize:'.82rem',color:'#1a2e6e',cursor:'pointer'}}>
           <RefreshIcon size={14}/> Refresh
          </button>
          <button onClick={()=>setShowSlip(true)} style={{padding:'8px 14px',borderRadius:8,border:'1.5px solid #e2e8f0',background:'#f8fafc',fontFamily:'inherit',fontWeight:600,fontSize:'.82rem',color:'#1a2e6e',cursor:'pointer'}}>
            <PrinterIcon size={14}/> Print Slip
          </button>
        </div>
      </div>

      <h2>Order #{id}</h2>
      <Stepper steps={steps}/>

      {/* Live delivery banner */}
      {isLive && (
        <div style={{background:'#fff7ed',border:'1.5px solid #fed7aa',borderRadius:16,padding:'16px 24px',marginBottom:28,display:'flex',alignItems:'center',gap:14}}>
          <span style={{width:14,height:14,borderRadius:'50%',background:'#f97316',flexShrink:0,animation:'pulse 1.5s infinite'}}/>
          <div>
            <p style={{fontWeight:700,color:'#c2410c',marginBottom:2}}>Your driver is on the way!</p>
            <p style={{fontSize:'.85rem',color:'#92400e'}}>Live location is being tracked on the map below. Updates every 5 seconds.</p>
          </div>
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
        </div>
      )}

      {/* Failed delivery reason */}
      {isFailed && (
        <div style={{background:'#fef2f2',border:'1.5px solid #fecaca',borderRadius:16,padding:'20px 24px',marginBottom:28,display:'flex',alignItems:'flex-start',gap:14}}>
          <XIcon size={22} style={{color:'#dc2626',flexShrink:0,marginTop:2}}/>
          <div>
            <p style={{fontWeight:700,color:'#dc2626',marginBottom:4}}>
              {currentParcel.status === 'refused' ? 'Delivery was refused' : 'Delivery failed'}
            </p>
            {currentParcel.failure_reason ? (
              <p style={{fontSize:'.88rem',color:'#ef4444'}}>
                Reason: <strong>{currentParcel.failure_reason}</strong>
              </p>
            ) : (
              <p style={{fontSize:'.88rem',color:'#ef4444'}}>Please contact us to reschedule your delivery.</p>
            )}
          </div>
        </div>
      )}

      <PaymentProofUpload parcel={currentParcel} onSuccess={refreshParcel}/>

      {isDelivered&&!isConfirmed&&(
        <div style={{background:'#f0fdf4',border:'1.5px solid #bbf7d0',borderRadius:16,padding:'20px 24px',marginBottom:28,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
          <div><p style={{fontWeight:700,color:'#166534',marginBottom:4}}>Your parcel has been delivered!</p><p style={{fontSize:'.88rem',color:'#4ade80'}}>Please confirm reception and rate your delivery.</p></div>
          <button className="btn-primary" style={{background:'#22c55e',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:8}} onClick={()=>setShowConfirm(true)}>
            <CheckIcon size={15}/> Confirm Reception
          </button>
        </div>
      )}

      {isConfirmed&&(
        <div style={{background:'#f0fdf4',border:'1.5px solid #bbf7d0',borderRadius:16,padding:'20px 24px',marginBottom:28,display:'flex',alignItems:'center',gap:16}}>
          <CheckIcon size={24} style={{color:'#22c55e',flexShrink:0}}/>
          <div>
            <p style={{fontWeight:700,color:'#166534',marginBottom:4}}>Reception confirmed</p>
            {currentParcel.rating&&<div style={{display:'flex',alignItems:'center',gap:4}}>{[1,2,3,4,5].map(s=><span key={s} style={{color:s<=currentParcel.rating?'#f97316':'#e2e8f0',fontSize:'1.2rem'}}>★</span>)}<span style={{fontSize:'.82rem',color:'#64748b',marginLeft:4}}>Your rating</span></div>}
          </div>
        </div>
      )}

      <div className="info-grid">
        <div className="info-card">
          <h3 style={{display:'flex',alignItems:'center',gap:8}}><PackageIcon size={16} style={{color:'#1a2e6e'}}/> Order Information</h3>
          <div className="info-row"><div className="info-label">Pickup Date</div><div className="info-value"><CalendarIcon size={14} style={{color:'#94a3b8'}}/> {pickupDate}</div></div>
          <div className="info-row"><div className="info-label">Estimate Drop</div><div className="info-value"><CalendarIcon size={14} style={{color:'#94a3b8'}}/> {estimateDrop}</div></div>
          <div className="info-row"><div className="info-label">Return Available</div><div className="info-value"><ClockIcon size={14} style={{color:'#94a3b8'}}/> {returnTime}</div></div>
          <div className="info-row"><div className="info-label">Payment</div><div className="info-value">{currentParcel.payment_method==='cash'?<><CashIcon size={14} style={{color:'#94a3b8'}}/> Cash on Delivery</>:<><CardIcon size={14} style={{color:'#94a3b8'}}/> Online Payment</>}</div></div>
        </div>
        <div className="info-card">
          <h3 style={{display:'flex',alignItems:'center',gap:8}}><MapPinIcon size={16} style={{color:'#1a2e6e'}}/> Locations</h3>
          <div className="info-row" style={{flexDirection:'column',alignItems:'flex-start',gap:4}}>
            <div className="info-label">Pickup Location</div>
            <div style={{fontWeight:700,fontSize:'.9rem',color:'#1e293b'}}>{pickup.name}</div>
            <div style={{fontSize:'.84rem',color:'#64748b'}}>{pickup.address}</div>
          </div>
          <hr className="divider-h"/>
          <div className="info-row" style={{flexDirection:'column',alignItems:'flex-start',gap:4}}>
            <div className="info-label">Dropoff Location</div>
            <div style={{fontWeight:700,fontSize:'.9rem',color:'#1e293b'}}>{dropoff.name}</div>
            <div style={{fontSize:'.84rem',color:'#64748b'}}>{dropoff.address}</div>
          </div>
        </div>
        <div className="info-card">
          <h3 style={{display:'flex',alignItems:'center',gap:8}}><UserIcon size={16} style={{color:'#1a2e6e'}}/> Receiver Details</h3>
          <div className="info-row"><div className="info-label">Full Name</div><div style={{fontWeight:700,fontSize:'.9rem',color:'#1e293b'}}>{customer.fullName}</div></div>
          <div className="info-row"><div className="info-label">Phone</div><div className="info-value" style={{color:'#64748b',fontWeight:400}}><PhoneIcon size={14} style={{color:'#94a3b8'}}/> {customer.phone}</div></div>
          <div className="info-row"><div className="info-label">Status</div><div style={{fontWeight:700,fontSize:'.88rem',color:'#1a2e6e',textTransform:'capitalize'}}>{currentParcel.status?.replace(/_/g,' ')}</div></div>
        </div>
      </div>

      <DeliveryMap from={from} to={to} trackingCode={currentParcel.tracking_code} isLive={isLive}/>

      {showConfirm&&<ConfirmReceptionModal parcel={currentParcel} onClose={()=>setShowConfirm(false)} onSuccess={async()=>{setShowConfirm(false);setConfirmed(true);await refreshParcel()}}/>}
      {showSlip&&<TrackingSlip parcel={currentParcel} onClose={()=>setShowSlip(false)}/>}
    </div>
  )
}




