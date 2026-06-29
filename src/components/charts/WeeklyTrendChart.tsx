import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { WeekBucket } from '@/features/dashboard/dashboardTypes';

interface Props {
  data: WeekBucket[];
}

export function WeeklyTrendChart({ data }: Props) {
  const hasData = data.some((b) => b.count > 0);

  return (
    <div className="card p-5">
      <h2 className="mb-4 font-display text-base font-semibold text-ink-900">
        Applications per week
      </h2>

      {!hasData ? (
        <div className="flex h-64 items-center justify-center text-sm text-ink-400">
          No applications in this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke="#e8e6e0" strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#8a8e9c' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#8a8e9c' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#eef0fb' }}
              contentStyle={{
                border: '1px solid #e8e6e0',
                borderRadius: 10,
                fontSize: 12,
                boxShadow: '0 4px 16px rgba(26,28,35,0.08)',
              }}
              formatter={(value) => [value, 'Applications']}
            />
            {/* Back bar — lighter, slightly wider for depth effect */}
            <Bar
              dataKey="count"
              fill="#c7d2fe"
              radius={[4, 4, 0, 0]}
              barSize={28}
            />
            {/* Front bar — vibrant, narrower */}
            <Bar
              dataKey="count"
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
