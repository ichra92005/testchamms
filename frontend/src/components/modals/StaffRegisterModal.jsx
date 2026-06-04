import { useState } from 'react'
import { staffRegister } from '../../services/api'

export default function StaffRegisterModal({ onClose, onSwitchLogin }) {
  const [form, setForm] = useState({ name: '', staffId: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.staffId || !form.email || !form.password) {
      setError('Please fill in all fields.'); return
    }
    setLoading(true)
    setError('')
    try {
      await staffRegister(form)
      onSwitchLogin() // redirect to login after registration
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-avatar">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
          </svg>
        </div>
        <h2>Staff Registration</h2>
        <p>Create a new staff account</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Enter your full name" value={form.name} onChange={update('name')} />
          </div>
          <div className="form-group">
            <label>Staff ID</label>
            <input type="text" placeholder="Enter your staff ID" value={form.staffId} onChange={update('staffId')} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="text" placeholder="staff@deliverit.dz" value={form.email} onChange={update('email')} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" value={form.password} onChange={update('password')} />
          </div>
          <button type="submit" className="btn-full" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="modal-switch">
          Already have an account? <a onClick={onSwitchLogin}>Login here</a>
        </p>
      </div>
    </div>
  )
}
