import clsx from 'clsx';
import type { DateRange } from '@/features/dashboard/dashboardTypes';

const OPTIONS: { label: string; value: DateRange }[] = [
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Last 6 months', value: '6m' },
  { label: 'All time', value: 'all' },
];

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-paper-edge bg-paper-card p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
            value === opt.value
              ? 'bg-brand text-white shadow-sm'
              : 'text-ink-500 hover:text-ink-900',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
