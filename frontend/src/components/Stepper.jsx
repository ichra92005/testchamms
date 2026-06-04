function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

export default function Stepper({ steps }) {
  return (
    <div className="stepper-card">
      <div className="stepper">
        {steps.map((step, i) => (
          <div className="step" key={i}>
            <div className={`step-circle ${step.status}`}>
              {step.status === 'done' ? <CheckIcon /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`step-line ${step.status === 'done' ? 'done' : 'pending'}`} />
            )}
            <div className={`step-label ${step.status}`}>{step.label}</div>
            <div className="step-date">{step.date}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
