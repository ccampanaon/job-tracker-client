import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts';
import type { LabelCount } from '@/features/dashboard/dashboardTypes';
import { paletteColor } from './chartColors';

interface Props {
  data: LabelCount[];
}

export function TopSkillsChart({ data }: Props) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 font-display text-base font-semibold text-ink-900">
        Top 5 most requested skills
      </h2>

      {data.length === 0 ? (
        <div className="flex h-44 items-center justify-center text-sm text-ink-400">
          Add skills to your applications to see trends
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
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
              width={90}
              tick={{ fontSize: 11, fill: '#5b5f6e', fontWeight: 500 }}
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
              formatter={(value) => [value, 'Appearances']}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={32}>
              <LabelList
                dataKey="count"
                position="right"
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
