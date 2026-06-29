import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { LabelCount } from '@/features/dashboard/dashboardTypes';
import { paletteColor } from './chartColors';

interface Props {
  data: LabelCount[];
}

export function SourceBarChart({ data }: Props) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 font-display text-base font-semibold text-ink-900">By source</h2>

      {data.length === 0 ? (
        <div className="flex h-44 items-center justify-center text-sm text-ink-400">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 32, left: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} stroke="#e8e6e0" strokeDasharray="4 4" />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#8a8e9c' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={80}
              tick={{ fontSize: 11, fill: '#5b5f6e' }}
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
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={32}>
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
