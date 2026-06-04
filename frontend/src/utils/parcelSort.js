// Shared parcel ordering + completion helpers used by every dashboard list.

export const STATUS_PRIORITY = {
  pending: 1,
  registered: 2,
  assigned: 3,
  accepted: 4,
  out_for_delivery: 5,
  delivered: 6,
  confirmed: 7,
  failed: 8,
  refused: 9,
}

// Completed/terminal statuses are visually de-emphasized in the lists.
const COMPLETED = new Set(['delivered', 'confirmed', 'failed', 'refused'])

export const isCompleted = (status) => COMPLETED.has(status)

// Active parcels first (by workflow priority), completed ones sink to the
// bottom. Within the same status, most-recently-updated first.
export function sortByStatus(parcels) {
  return [...parcels].sort((a, b) => {
    const diff = (STATUS_PRIORITY[a.status] || 99) - (STATUS_PRIORITY[b.status] || 99)
    if (diff !== 0) return diff
    return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
  })
}
