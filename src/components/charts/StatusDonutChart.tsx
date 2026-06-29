import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { STATUS_LABEL } from '@/types';
import type { LabelCount } from '@/features/dashboard/dashboardTypes';
import { STATUS_COLORS } from './chartColors';

interface Props {
  data: LabelCount[];
}

export function StatusDonutChart({ data }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    displayLabel: STATUS_LABEL[d.label as keyof typeof STATUS_LABEL] ?? d.label,
    color: STATUS_COLORS[d.label] ?? STATUS_COLORS.Unknown,
  }));

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="card p-5">
      <h2 className="mb-4 font-display text-base font-semibold text-ink-900">By status</h2>

      {data.length === 0 ? (
        <div className="flex h-52 items-center justify-center text-sm text-ink-400">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="displayLabel"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              label={false}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <text
              x="50%"
              y="43%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Sora, system-ui, sans-serif', fill: '#1a1c23' }}
            >
              {total}
            </text>
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: 11, fill: '#8a8e9c' }}
            >
              total
            </text>
            <Tooltip
              contentStyle={{
                border: '1px solid #e8e6e0',
                borderRadius: 10,
                fontSize: 12,
                boxShadow: '0 4px 16px rgba(26,28,35,0.08)',
              }}
              formatter={(value, _name, props) => [
                value,
                (props.payload as { displayLabel: string }).displayLabel,
              ]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) =>
                STATUS_LABEL[value as keyof typeof STATUS_LABEL] ?? value
              }
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
