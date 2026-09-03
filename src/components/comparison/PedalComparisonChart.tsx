import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { ComparisonPoint } from '../../services/comparisonService';

interface PedalComparisonChartProps {
  data: ComparisonPoint[];
  labelA?: string;
  labelB?: string;
  currentDistance?: number;
  className?: string;
}

export const PedalComparisonChart: React.FC<PedalComparisonChartProps> = ({
  data,
  labelA = 'Lap A',
  labelB = 'Reference Lap B',
  currentDistance,
  className = '',
}) => {
  if (!data || data.length === 0) return null;

  const maxDist = data[data.length - 1].distance;

  return (
    <div className={`bg-[#0b111e] rounded-xl border border-slate-800 p-4 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Throttle & Brake Application Overlay
        </span>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-emerald-400 font-medium">Throttle A (solid) / B (dashed)</span>
          <span className="text-rose-400 font-medium">Brake A (solid) / B (dashed)</span>
        </div>
      </div>

      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            syncId="apexComparisonSync"
            margin={{ top: 10, right: 20, left: -20, bottom: 20 }}
          >
            <XAxis
              dataKey="distance"
              domain={[0, maxDist]}
              stroke="#475569"
              tick={{ fontSize: 10, fill: '#64748b' }}
              unit="m"
            />
            <YAxis
              domain={[0, 100]}
              stroke="#475569"
              tick={{ fontSize: 10, fill: '#64748b' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '11px',
              }}
              formatter={(val: any, name: any) => {
                const labels: Record<string, string> = {
                  throttleA: `${labelA} Throttle`,
                  throttleB: `${labelB} Throttle`,
                  brakeA: `${labelA} Brake`,
                  brakeB: `${labelB} Brake`,
                };
                return [`${val}%`, labels[name] || name];
              }}
              labelFormatter={(dist: any) => `Dist: ${dist}m`}
            />
            {currentDistance !== undefined && (
              <ReferenceLine x={currentDistance} stroke="#38bdf8" strokeWidth={1.5} />
            )}
            <Line
              type="monotone"
              dataKey="throttleA"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="throttleB"
              stroke="#94a3b8"
              strokeWidth={1.75}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="brakeA"
              stroke="#f43f5e"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="brakeB"
              stroke="#94a3b8"
              strokeWidth={1.75}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
