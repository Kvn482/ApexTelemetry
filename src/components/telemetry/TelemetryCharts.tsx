import React, { useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { TelemetryPoint } from '../../types';

interface TelemetryChartsProps {
  telemetry: TelemetryPoint[];
  currentDistance: number;
  onHoverDistance?: (distance: number) => void;
  className?: string;
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({
  telemetry,
  currentDistance,
  onHoverDistance,
  className = '',
}) => {
  const handleMouseMove = useCallback(
    (state: any) => {
      if (state && state.activePayload && state.activePayload.length > 0) {
        const point = state.activePayload[0].payload as TelemetryPoint;
        if (point && onHoverDistance) {
          onHoverDistance(point.distance);
        }
      }
    },
    [onHoverDistance]
  );

  if (!telemetry || telemetry.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-[#0d1424] rounded-xl border border-slate-800">
        No telemetry traces available for this lap.
      </div>
    );
  }

  const maxDist = telemetry[telemetry.length - 1].distance;

  return (
    <div className={`space-y-3 telemetry-containment select-none ${className}`}>
      {/* 1. Speed Chart */}
      <div className="bg-[#0b111e] rounded-xl border border-slate-800 p-3 shadow-lg">
        <div className="flex items-center justify-between mb-1 px-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
            Speed (km/h)
          </span>
          <span className="text-xs text-slate-400 telemetry-mono">
            Max: {Math.max(...telemetry.map(p => p.speed))} km/h
          </span>
        </div>
        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={telemetry}
              syncId="apexTelemetrySync"
              onMouseMove={handleMouseMove}
              margin={{ top: 5, right: 20, left: -20, bottom: 0 }}
            >
              <XAxis dataKey="distance" hide domain={[0, maxDist]} />
              <YAxis
                domain={[50, 300]}
                stroke="#475569"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [`${val} km/h`, 'Speed']}
                labelFormatter={(dist: any) => `Dist: ${dist}m`}
              />
              <ReferenceLine x={currentDistance} stroke="#38bdf8" strokeWidth={1.5} />
              <Line
                type="monotone"
                dataKey="speed"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Throttle & Brake Overlaid Chart */}
      <div className="bg-[#0b111e] rounded-xl border border-slate-800 p-3 shadow-lg">
        <div className="flex items-center justify-between mb-1 px-2">
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
              Throttle (%)
            </span>
            <span className="text-rose-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" />
              Brake (%)
            </span>
          </div>
          <span className="text-xs text-slate-400 telemetry-mono">0 - 100%</span>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={telemetry}
              syncId="apexTelemetrySync"
              onMouseMove={handleMouseMove}
              margin={{ top: 5, right: 20, left: -20, bottom: 0 }}
            >
              <XAxis dataKey="distance" hide domain={[0, maxDist]} />
              <YAxis
                domain={[0, 100]}
                stroke="#475569"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
                formatter={(val: any, name: any) => [
                  `${val}%`,
                  name === 'throttle' ? 'Throttle' : 'Brake',
                ]}
                labelFormatter={(dist: any) => `Dist: ${dist}m`}
              />
              <ReferenceLine x={currentDistance} stroke="#38bdf8" strokeWidth={1.5} />
              <Line
                type="monotone"
                dataKey="throttle"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="brake"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Gear & RPM Chart */}
      <div className="bg-[#0b111e] rounded-xl border border-slate-800 p-3 shadow-lg">
        <div className="flex items-center justify-between mb-1 px-2">
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
            <span className="text-amber-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              Gear (1-6)
            </span>
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-500" />
              RPM
            </span>
          </div>
        </div>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={telemetry}
              syncId="apexTelemetrySync"
              onMouseMove={handleMouseMove}
              margin={{ top: 5, right: 20, left: -20, bottom: 0 }}
            >
              <XAxis dataKey="distance" hide domain={[0, maxDist]} />
              <YAxis
                yAxisId="gearAxis"
                domain={[1, 6]}
                stroke="#475569"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
              />
              <YAxis yAxisId="rpmAxis" orientation="right" hide domain={[4000, 9000]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
                formatter={(val: any, name: any) => [
                  name === 'gear' ? `Gear ${val}` : `${val} RPM`,
                  name === 'gear' ? 'Gear' : 'RPM',
                ]}
                labelFormatter={(dist: any) => `Dist: ${dist}m`}
              />
              <ReferenceLine
                yAxisId="gearAxis"
                x={currentDistance}
                stroke="#38bdf8"
                strokeWidth={1.5}
              />
              <Line
                yAxisId="gearAxis"
                type="stepAfter"
                dataKey="gear"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                yAxisId="rpmAxis"
                type="monotone"
                dataKey="rpm"
                stroke="#64748b"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Steering Chart */}
      <div className="bg-[#0b111e] rounded-xl border border-slate-800 p-3 shadow-lg">
        <div className="flex items-center justify-between mb-1 px-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-400" />
            Steering Angle (Deg)
          </span>
          <span className="text-xs text-slate-400 telemetry-mono">
            -Left / +Right
          </span>
        </div>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={telemetry}
              syncId="apexTelemetrySync"
              onMouseMove={handleMouseMove}
              margin={{ top: 5, right: 20, left: -20, bottom: 20 }}
            >
              <XAxis
                dataKey="distance"
                domain={[0, maxDist]}
                stroke="#475569"
                tick={{ fontSize: 10, fill: '#64748b' }}
                unit="m"
              />
              <YAxis
                domain={[-90, 90]}
                stroke="#475569"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [`${val}°`, 'Steering']}
                labelFormatter={(dist: any) => `Dist: ${dist}m`}
              />
              <ReferenceLine y={0} stroke="#334155" strokeDasharray="2 2" />
              <ReferenceLine x={currentDistance} stroke="#38bdf8" strokeWidth={1.5} />
              <Line
                type="monotone"
                dataKey="steering"
                stroke="#c084fc"
                strokeWidth={1.75}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
