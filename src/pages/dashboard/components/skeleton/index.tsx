export function SkeletonKpi() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 animate-pulse">
      <div className="h-4 w-24 bg-neutral-200 rounded mb-2" />
      <div className="h-8 w-32 bg-neutral-200 rounded" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 animate-pulse">
      <div className="h-4 w-40 bg-neutral-200 rounded mb-3" />
      <div className="flex items-end gap-2 h-40">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="h-4 w-16 bg-neutral-200 rounded" />
            <div className="w-full bg-neutral-200 rounded-t" style={{ height: '50%' }} />
            <div className="h-3 w-8 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 animate-pulse">
      <div className="h-4 w-40 bg-neutral-200 rounded mb-3" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-32 bg-neutral-200 rounded" />
            <div className="h-4 w-16 bg-neutral-200 rounded" />
            <div className="h-4 w-20 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 animate-pulse">
      <div className="h-4 w-32 bg-neutral-200 rounded mb-3" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-neutral-200 rounded" />
          <div className="h-4 w-20 bg-neutral-200 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-neutral-200 rounded" />
          <div className="h-4 w-20 bg-neutral-200 rounded" />
        </div>
      </div>
    </div>
  );
}