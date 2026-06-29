import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import type { LabelCount } from '@/features/dashboard/dashboardTypes';
import { paletteColor } from './chartColors';

interface Props {
  data: LabelCount[];
}

export function RoleBarChart({ data }: Props) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 font-display text-base font-semibold text-ink-900">By role</h2>

      {data.length === 0 ? (
        <div className="flex h-44 items-center justify-center text-sm text-ink-400">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 16, right: 4, left: -16, bottom: 0 }}>
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
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={56}>
              <LabelList
                dataKey="count"
                position="top"
                style={{ fontSize: 11, fill: '#5b5f6e', fontWeight: 600 }}
              />
              {data.map((_, i) => (
                <Cell key={i} fill={paletteColor(i)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
