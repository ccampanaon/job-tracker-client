interface KpiCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  accentColor: string;
  subtitle?: string;
  trend?: { label: string; positive: boolean };
}

export function KpiCard({ title, value, icon, accentColor, subtitle, trend }: KpiCardProps) {
  return (
    <div className="card flex flex-col gap-3 p-5">
      {/* Title row with icon */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-400">
          {title}
        </p>
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white shadow-lift"
          style={{ backgroundColor: accentColor }}
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <div>
        <p className="font-display text-3xl font-bold text-ink-900">
          {value.toLocaleString()}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-ink-400">{subtitle}</p>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1.5">
          <span
            className={[
              'text-xs font-semibold',
              trend.positive ? 'text-emerald-500' : 'text-rose-500',
            ].join(' ')}
          >
            {trend.positive ? '↑' : '↓'} {trend.label}
          </span>
          <span className="text-xs text-ink-400">Since last period</span>
        </div>
      )}
    </div>
  );
}
