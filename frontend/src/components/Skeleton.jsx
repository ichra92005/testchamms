// Reusable shimmer skeletons for loading states across the app.
// Shimmer keyframe `skeleton-shimmer` lives in src/index.css.

export function Skeleton({ width = '100%', height = 16, rounded = 4, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
        backgroundSize: '200% 100%',
        borderRadius: rounded,
        animation: 'skeleton-shimmer 1.5s infinite',
        ...style,
      }}
    />
  )
}

export function SkeletonCircle({ size = 40 }) {
  return <Skeleton width={size} height={size} rounded={size / 2} />
}

export function SkeletonText({ lines = 1, width = '100%' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? '70%' : width}
        />
      ))}
    </div>
  )
}

export function SkeletonRow({ cells = 5 }) {
  return (
    <div style={{
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      padding: '14px 20px',
      borderBottom: '1px solid #f1f5f9',
    }}>
      <SkeletonCircle size={36} />
      {Array.from({ length: cells }).map((_, i) => (
        <div key={i} style={{ flex: 1 }}>
          <Skeleton height={14} width={i % 2 === 0 ? '80%' : '60%'} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div style={{
      padding: 20,
      background: 'white',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <Skeleton width={120} height={12} />
      <Skeleton width={80} height={28} />
      <Skeleton width="60%" height={10} />
    </div>
  )
}

export function SkeletonStatsRow({ count = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ flex: '1 1 180px' }}>
          <SkeletonCard />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 8, cells = 5 }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
    }}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cells={cells} />
      ))}
    </div>
  )
}
