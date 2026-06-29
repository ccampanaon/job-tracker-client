import type { LabelCount } from '@/features/dashboard/dashboardTypes';

const STAGE_COLORS = ['#4338ca', '#6366f1', '#818cf8', '#a5b4fc'];

interface Props {
  data: LabelCount[];
}

export function FunnelChart({ data }: Props) {
  const max = data[0]?.count ?? 0;

  return (
    <div className="card p-5">
      <h2 className="mb-4 font-display text-base font-semibold text-ink-900">
        Application funnel
      </h2>

      {max === 0 ? (
        <div className="flex h-52 items-center justify-center text-sm text-ink-400">
          No data yet
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 pt-2">
          {data.map((stage, i) => {
            const widthPct = max > 0 ? (stage.count / max) * 100 : 0;
            const prev = i > 0 ? data[i - 1].count : null;
            const conversionPct =
              prev && prev > 0 ? Math.round((stage.count / prev) * 100) : null;

            return (
              <div key={stage.label} className="w-full">
                {conversionPct !== null && (
                  <p className="mb-1 text-center text-xs text-ink-400">
                    ↓ {conversionPct}% converted
                  </p>
                )}
                <div className="flex items-center justify-center">
                  <div
                    className="flex items-center justify-between rounded-lg px-4 py-2.5 text-white transition-all"
                    style={{
                      width: `${widthPct}%`,
                      minWidth: '40%',
                      backgroundColor: STAGE_COLORS[i],
                    }}
                  >
                    <span className="text-xs font-medium">{stage.label}</span>
                    <span className="text-sm font-bold">{stage.count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
