function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={['animate-pulse rounded-xl bg-paper-edge', className].filter(Boolean).join(' ')}
      style={style}
    />
  );
}

function ChartCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={['card p-5', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <Bone className="h-8 w-36" />
        <Bone className="h-10 w-80" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card flex flex-col gap-4 p-5">
            <Bone className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Bone className="h-3.5 w-24" />
              <Bone className="h-8 w-16" />
              <Bone className="h-3 w-32" />
            </div>
            <Bone className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>

      {/* Weekly trend — full width */}
      <ChartCard>
        <Bone className="mb-4 h-5 w-44" />
        <Bone className="h-64 w-full rounded-lg" />
      </ChartCard>

      {/* Status donut + Funnel */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChartCard>
          <Bone className="mb-4 h-5 w-40" />
          <div className="flex items-center gap-6">
            <Bone className="h-44 w-44 rounded-full" />
            <div className="flex-1 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Bone key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard>
          <Bone className="mb-4 h-5 w-40" />
          <div className="space-y-3 pt-2">
            {[100, 75, 50, 25].map((pct) => (
              <div key={pct} className="flex flex-col items-center gap-1">
                <Bone className="h-10 rounded-lg" style={{ width: `${pct}%` }} />
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Source / Role / Job type */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ChartCard key={i}>
            <Bone className="mb-4 h-5 w-32" />
            <Bone className="h-44 w-full rounded-lg" />
          </ChartCard>
        ))}
      </div>

      {/* Location + Skills */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ChartCard>
          <Bone className="mb-4 h-5 w-28" />
          <Bone className="mx-auto h-44 w-44 rounded-full" />
        </ChartCard>
        <ChartCard className="md:col-span-2">
          <Bone className="mb-4 h-5 w-36" />
          <Bone className="h-44 w-full rounded-lg" />
        </ChartCard>
      </div>
    </div>
  );
}
