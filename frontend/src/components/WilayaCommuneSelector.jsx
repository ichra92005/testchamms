import { ALGERIA_COMMUNES, WILAYAS } from '../data/algerianCommunes'
import { MapPinIcon } from './Icons'

const ERR = ({ msg }) => msg
  ? <p style={{color:'#dc2626',fontSize:'.75rem',marginTop:4}}>{msg}</p>
  : null

export default function WilayaCommuneSelector({
  wilayaLabel, communeLabel,
  wilayaValue, communeValue,
  onWilayaChange, onCommuneChange,
  required, wilayaError, communeError,
}) {
  const communes = wilayaValue ? (ALGERIA_COMMUNES[wilayaValue] || []) : []

  const handleWilayaChange = (w) => {
    onWilayaChange(w)
    onCommuneChange('')
  }

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
      <div className="field-group">
        <label className="field-label">
          {wilayaLabel}{required && <span style={{color:'#dc2626'}}> *</span>}
        </label>
        <div className={`field-wrap ${wilayaError ? 'field-wrap-error' : ''}`}>
          <span className="field-icon"><MapPinIcon size={15}/></span>
          <select
            className="field-input"
            value={wilayaValue}
            onChange={e => handleWilayaChange(e.target.value)}
            style={{cursor:'pointer'}}
            required={required}
          >
            <option value="">Select wilaya...</option>
            {WILAYAS.map((w, i) => (
              <option key={i} value={w}>{w}</option>
            ))}
          </select>
        </div>
        <ERR msg={wilayaError}/>
      </div>

      <div className="field-group">
        <label className="field-label">
          {communeLabel}{required && <span style={{color:'#dc2626'}}> *</span>}
        </label>
        <div className={`field-wrap ${communeError ? 'field-wrap-error' : ''}`}>
          <span className="field-icon"><MapPinIcon size={15}/></span>
          <select
            className="field-input"
            value={communeValue}
            onChange={e => onCommuneChange(e.target.value)}
            disabled={!wilayaValue}
            style={{cursor: wilayaValue ? 'pointer' : 'not-allowed', opacity: wilayaValue ? 1 : 0.5}}
            required={required}
          >
            <option value="">{wilayaValue ? 'Select commune...' : 'Select wilaya first'}</option>
            {communes.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <ERR msg={communeError}/>
      </div>
    </div>
  )
}
