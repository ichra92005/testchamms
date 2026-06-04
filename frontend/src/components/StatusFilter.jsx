import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDownIcon } from './Icons'

export const STATUS_OPTIONS = [
  { value: 'all',              label: 'All Statuses',     color: '#64748b' },
  { value: 'pending',          label: 'Pending',          color: '#f59e0b' },
  { value: 'registered',       label: 'Registered',       color: '#3b82f6' },
  { value: 'assigned',         label: 'Assigned',         color: '#f97316' },
  { value: 'accepted',         label: 'Accepted',         color: '#1a2e6e' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: '#7e22ce' },
  { value: 'delivered',        label: 'Delivered',        color: '#16a34a' },
  { value: 'confirmed',        label: 'Confirmed',        color: '#166534' },
  { value: 'failed',           label: 'Failed',           color: '#dc2626' },
  { value: 'refused',          label: 'Refused',          color: '#991b1b' },
]

export default function StatusFilter({ value, onChange, options = STATUS_OPTIONS }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos]   = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef(null)
  const menuRef    = useRef(null)
  const selected = options.find(o => o.value === value) || options[0]

  // Measure the trigger and place the fixed menu right below it.
  const reposition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
  }, [])

  useEffect(() => {
    if (open) reposition()
  }, [open, reposition])

  // Close on outside click (trigger + menu both excluded).
  useEffect(() => {
    const onClick = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // The fixed menu doesn't move with the page/container, so close it on
  // scroll or resize to avoid it visually detaching from the trigger.
  // Capture phase catches scrolling inside overflow containers too.
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        style={{
          minWidth: 200, padding: '10px 14px',
          background: 'white', border: '1px solid #e2e8f0',
          borderRadius: 10, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 14, fontWeight: 500, color: '#1a2e6e',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          transition: 'border-color .2s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#cbd5e1'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
      >
        <span style={{
          width: 10, height: 10, borderRadius: '50%',
          background: selected.color, flexShrink: 0,
        }}/>
        <span style={{ flex: 1, textAlign: 'left' }}>{selected.label}</span>
        <ChevronDownIcon size={16} style={{
          transition: 'transform .2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
        }}/>
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            zIndex: 9999,
            maxHeight: 320,
            overflowY: 'auto',
            animation: 'dropdownIn .15s ease',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              style={{
                width: '100%', padding: '10px 14px',
                background: opt.value === value ? '#f8fafc' : 'white',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 14, color: '#1a2e6e', textAlign: 'left',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = opt.value === value ? '#f8fafc' : 'white'}
            >
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: opt.color, flexShrink: 0,
              }}/>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
