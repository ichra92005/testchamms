import { CheckIcon, XIcon } from './Icons'

const REQUIREMENTS = [
  { label: 'At least 8 characters',        test: p => p.length >= 8 },
  { label: 'Contains an uppercase letter', test: p => /[A-Z]/.test(p) },
  { label: 'Contains a lowercase letter',  test: p => /[a-z]/.test(p) },
  { label: 'Contains a number',            test: p => /[0-9]/.test(p) },
  { label: 'Contains a special character', test: p => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export default function PasswordRequirements({ password }) {
  if (!password) return null

  return (
    <>
      <style>{`
        @keyframes checkBounce {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes pwdListIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pwd-req-list {
          animation: pwdListIn .18s ease;
        }
        .pwd-req-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: .78rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: color .25s ease;
        }
        .pwd-req-circle {
          width: 18px; height: 18px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background .25s ease;
          flex-shrink: 0;
        }
        .pwd-req-passed            { color: #166534; }
        .pwd-req-failed            { color: #94a3b8; }
        .pwd-req-passed .pwd-req-circle { background: #dcfce7; }
        .pwd-req-failed .pwd-req-circle { background: #f1f5f9; }
        .pwd-req-icon-passed {
          animation: checkBounce .35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pwd-req-label {
          text-decoration: line-through;
          text-decoration-color: transparent;
          transition: text-decoration-color .25s ease;
        }
        .pwd-req-passed .pwd-req-label {
          text-decoration-color: #16a34a;
        }
      `}</style>

      <div
        className="pwd-req-list"
        style={{
          marginTop: 10,
          padding: '12px 14px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
        }}
      >
        {REQUIREMENTS.map((req, i) => {
          const passed = req.test(password)
          return (
            <div key={i} className={`pwd-req-row ${passed ? 'pwd-req-passed' : 'pwd-req-failed'}`}>
              <span className="pwd-req-circle">
                {passed
                  ? <CheckIcon size={11} className="pwd-req-icon-passed"/>
                  : <XIcon     size={11} style={{ color: '#cbd5e1' }}/>
                }
              </span>
              <span className="pwd-req-label">{req.label}</span>
            </div>
          )
        })}
      </div>
    </>
  )
}
