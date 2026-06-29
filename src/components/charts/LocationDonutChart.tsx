import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { LabelCount } from '@/features/dashboard/dashboardTypes';
import { LOCATION_COLORS } from './chartColors';

interface Props {
  data: LabelCount[];
}

export function LocationDonutChart({ data }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    color: LOCATION_COLORS[d.label] ?? LOCATION_COLORS.Unknown,
  }));

  return (
    <div className="card p-5">
      <h2 className="mb-4 font-display text-base font-semibold text-ink-900">By location</h2>

      {data.length === 0 ? (
        <div className="flex h-44 items-center justify-center text-sm text-ink-400">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                border: '1px solid #e8e6e0',
                borderRadius: 10,
                fontSize: 12,
                boxShadow: '0 4px 16px rgba(26,28,35,0.08)',
              }}
              formatter={(value, name) => [value, name]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
