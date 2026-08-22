export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/30 animate-pulse">
          <div className="h-44 bg-surface-container-high w-full" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-surface-container-high rounded w-3/4" />
            <div className="h-4 bg-surface-container rounded w-1/2" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-16 bg-surface-container rounded-full" />
              <div className="h-6 w-16 bg-surface-container rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function HorizontalSkeleton({ count = 3 }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="min-w-[280px] sm:min-w-[320px] bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20 animate-pulse space-y-3">
          <div className="h-36 bg-surface-container-high rounded-lg" />
          <div className="h-5 bg-surface-container-high rounded w-2/3" />
          <div className="h-4 bg-surface-container rounded w-1/3" />
        </div>
      ))}
    </div>
  )
}

export function DetailsSkeleton() {
  return (
    <div className="max-w-[1280px] mx-auto space-y-6 animate-pulse">
      <div className="h-64 bg-surface-container-high rounded-3xl" />
      <div className="h-12 bg-surface-container rounded-xl w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-48 bg-surface-container rounded-2xl md:col-span-2" />
        <div className="h-48 bg-surface-container rounded-2xl" />
      </div>
    </div>
  )
}
