import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { ComparisonPoint } from '../../services/comparisonService';

interface DeltaChartProps {
  data: ComparisonPoint[];
  currentDistance?: number;
  className?: string;
}

export const DeltaChart: React.FC<DeltaChartProps> = ({
  data,
  currentDistance,
  className = '',
}) => {
  if (!data || data.length === 0) return null;

  const maxDist = data[data.length - 1].distance;
  const maxDelta = Math.max(...data.map(d => Math.abs(d.delta)), 0.5);

  return (
    <div className={`bg-[#0b111e] rounded-xl border border-slate-800 p-4 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Time Delta (vs Reference Lap)
          </span>
          <span className="text-[11px] text-slate-400">
            <span className="text-rose-400 font-semibold">+Slower</span> /{' '}
            <span className="text-emerald-400 font-semibold">-Faster</span>
          </span>
        </div>
        <span className="text-xs font-mono text-slate-300">
          Finish Delta:{' '}
          <strong
            className={
              data[data.length - 1].delta > 0
                ? 'text-rose-400'
                : 'text-emerald-400'
            }
          >
            {data[data.length - 1].delta > 0 ? '+' : ''}
            {data[data.length - 1].delta.toFixed(3)}s
          </strong>
        </span>
      </div>

      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            syncId="apexComparisonSync"
            margin={{ top: 10, right: 20, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="deltaColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="distance"
              domain={[0, maxDist]}
              stroke="#475569"
              tick={{ fontSize: 10, fill: '#64748b' }}
              unit="m"
            />
            <YAxis
              domain={[-maxDelta, maxDelta]}
              stroke="#475569"
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickFormatter={(val: number) => `${val > 0 ? '+' : ''}${val.toFixed(2)}s`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '11px',
              }}
              formatter={(val: any) => [
                `${val > 0 ? '+' : ''}${parseFloat(val).toFixed(3)}s`,
                'Delta',
              ]}
              labelFormatter={(dist: any) => `Dist: ${dist}m`}
            />
            <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} strokeDasharray="3 3" />
            {currentDistance !== undefined && (
              <ReferenceLine x={currentDistance} stroke="#38bdf8" strokeWidth={1.5} />
            )}
            <Area
              type="monotone"
              dataKey="delta"
              stroke="#a855f7"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#deltaColor)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
