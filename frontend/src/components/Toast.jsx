import { useState, useCallback, useRef } from 'react'
import { CheckIcon, XIcon, AlertIcon } from './Icons'

// ── Toast Component ───────────────────────────────────────────
function Toast({ id, message, type, onRemove }) {
  const config = {
    success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#166534', icon: <CheckIcon size={16}/> },
    error:   { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', icon: <XIcon size={16}/> },
    info:    { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8', icon: null },
    warning: { bg: '#fffbeb', border: '#fde68a', color: '#d97706', icon: <AlertIcon size={16}/> },
  }
  const c = config[type] || config.info

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      background: c.bg, border: `1.5px solid ${c.border}`,
      borderRadius: 12, padding: '14px 16px',
      boxShadow: '0 4px 16px rgba(0,0,0,.12)',
      animation: 'toastIn .25s ease',
      maxWidth: 360, width: '100%',
    }}>
      {c.icon && (
        <span style={{ color: c.color, flexShrink: 0, marginTop: 1 }}>{c.icon}</span>
      )}
      <p style={{ flex: 1, fontSize: '.88rem', fontWeight: 600, color: c.color, lineHeight: 1.4 }}>
        {message}
      </p>
      <button
        onClick={() => onRemove(id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.color, opacity: .6, padding: 0, flexShrink: 0 }}
      >
        <XIcon size={14}/>
      </button>
    </div>
  )
}

// ── Toast Container ───────────────────────────────────────────
export function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null
  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-10px) scale(.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div style={{
        position: 'fixed', top: 20, right: 20, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}>
        {toasts.map(t => (
          <Toast key={t.id} {...t} onRemove={removeToast}/>
        ))}
      </div>
    </>
  )
}

// ── useToast hook ─────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++counter.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  }

  return { toasts, toast, removeToast }
}
