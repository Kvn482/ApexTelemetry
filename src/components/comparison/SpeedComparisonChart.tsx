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

interface SpeedComparisonChartProps {
  data: ComparisonPoint[];
  labelA?: string;
  labelB?: string;
  currentDistance?: number;
  className?: string;
}

export const SpeedComparisonChart: React.FC<SpeedComparisonChartProps> = ({
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
          Speed Overlay (km/h)
        </span>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
            <span>{labelA}</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-amber-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            <span>{labelB}</span>
          </div>
        </div>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            syncId="apexComparisonSync"
            margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
          >
            <XAxis dataKey="distance" hide domain={[0, maxDist]} />
            <YAxis
              domain={[60, 290]}
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
              formatter={(val: any, name: any) => [
                `${val} km/h`,
                name === 'speedA' ? labelA : labelB,
              ]}
              labelFormatter={(dist: any) => `Dist: ${dist}m`}
            />
            {currentDistance !== undefined && (
              <ReferenceLine x={currentDistance} stroke="#38bdf8" strokeWidth={1.5} />
            )}
            <Line
              type="monotone"
              dataKey="speedA"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="speedB"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
