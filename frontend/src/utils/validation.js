// Shared validation helpers — return an error string or '' if valid

export const validatePhone = (v) => {
  if (!v?.trim()) return 'Phone number is required'
  const s = v.trim()
  if (!/^[0-9+\s]+$/.test(s))
    return 'Please enter a valid Algerian phone number (e.g. 0555 000 000)'
  if (!/^(\+213|0)/.test(s))
    return 'Please enter a valid Algerian phone number (e.g. 0555 000 000)'
  const digits = s.replace(/\D/g, '')
  if (digits.length < 9 || digits.length > 13)
    return 'Please enter a valid Algerian phone number (e.g. 0555 000 000)'
  return ''
}

export const validateName = (v) => {
  if (!v?.trim()) return 'Name is required'
  if (v.trim().length < 3) return 'Name must contain letters only, at least 3 characters'
  if (!/^[؀-ۿa-zA-ZÀ-ɏ\s\-']+$/.test(v.trim()))
    return 'Name must contain letters only, at least 3 characters'
  return ''
}

export const validateEmail = (v) => {
  if (!v?.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Please enter a valid email address'
  return ''
}

// For login: pass required=true, optional=false
// For profile update: pass required=false to allow blank (keep current)
export const validatePassword = (v, required = true) => {
  if (!v) return required ? 'Password is required' : ''
  if (v.length < 8)                              return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(v))                          return 'Password must contain an uppercase letter'
  if (!/[a-z]/.test(v))                          return 'Password must contain a lowercase letter'
  if (!/[0-9]/.test(v))                          return 'Password must contain a number'
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(v))         return 'Password must contain a special character'
  return ''
}

export const validateStaffId = (v) => {
  if (!v?.trim()) return 'Staff ID is required'
  if (!/^[A-Za-z]{2}-\d+$/.test(v.trim()))
    return 'Staff ID must follow format: AG-001, DR-2701 or AD-9999'
  return ''
}

// Optional field — only validates format/range if a value is present
export const validateWeight = (v) => {
  if (!v && v !== 0) return ''
  if (!/^\d+(\.\d{1,2})?$/.test(String(v).trim())) return 'Please enter a valid weight in kg'
  const n = parseFloat(v)
  if (n <= 0 || n > 999) return 'Please enter a valid weight in kg'
  return ''
}

export const validateTrackingCode = (v) => {
  if (!v?.trim()) return 'Please enter a tracking code'
  if (!/^[A-Z0-9-]+$/.test(v.trim().toUpperCase())) return 'Invalid tracking code format'
  return ''
}

export const validateDescription = (v) => {
  if (v && v.length > 200) return 'Description cannot exceed 200 characters'
  return ''
}
