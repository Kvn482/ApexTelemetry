import React from 'react';
import { TelemetryPoint } from '../../types';
import { formatLapTime } from '../../utils/formatters';

interface TelemetryHUDProps {
  point: TelemetryPoint;
  totalDistance: number;
  lapTimeSeconds: number;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  point,
  totalDistance,
  lapTimeSeconds,
}) => {
  const steeringPercent = Math.min(100, Math.max(-100, (point.steering / 180) * 100));

  return (
    <div className="bg-[#0b111e] rounded-xl border border-slate-800 p-4 shadow-xl select-none">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
        {/* Distance & Time */}
        <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Distance / Lap
          </span>
          <p className="text-base font-bold text-white telemetry-mono mt-0.5">
            {point.distance}m
          </p>
          <p className="text-[11px] text-slate-400 telemetry-mono">
            / {totalDistance}m
          </p>
        </div>

        {/* Lap Time */}
        <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Lap Time
          </span>
          <p className="text-base font-black text-cyan-400 telemetry-mono mt-0.5">
            {formatLapTime(point.time)}
          </p>
          <p className="text-[11px] text-slate-400 telemetry-mono">
            {formatLapTime(lapTimeSeconds)}
          </p>
        </div>

        {/* Speed */}
        <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Speed
          </span>
          <p className="text-xl font-black text-white telemetry-mono mt-0.5">
            {point.speed}{' '}
            <span className="text-[10px] font-normal text-slate-400">km/h</span>
          </p>
        </div>

        {/* Gear & RPM */}
        <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Gear / RPM
          </span>
          <div className="flex items-baseline justify-center gap-2 mt-0.5">
            <span className="text-2xl font-black text-amber-400 telemetry-mono">
              {point.gear === 0 ? 'N' : point.gear}
            </span>
            <span className="text-xs font-semibold text-slate-300 telemetry-mono">
              {point.rpm.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Throttle */}
        <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
            <span className="text-emerald-400">Throttle</span>
            <span className="text-white telemetry-mono">{point.throttle}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-75 rounded-full"
              style={{ width: `${point.throttle}%` }}
            />
          </div>
        </div>

        {/* Brake */}
        <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
            <span className="text-rose-400">Brake</span>
            <span className="text-white telemetry-mono">{point.brake}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
            <div
              className="bg-rose-500 h-full transition-all duration-75 rounded-full"
              style={{ width: `${point.brake}%` }}
            />
          </div>
        </div>

        {/* Steering */}
        <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
            <span className="text-cyan-400">Steer</span>
            <span className="text-white telemetry-mono">{point.steering}°</span>
          </div>
          {/* Steering horizontal bar indicator */}
          <div className="relative w-full bg-slate-800 rounded-full h-2 mt-2.5">
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-600 z-10" />
            {steeringPercent < 0 ? (
              <div
                className="absolute top-0 bottom-0 right-1/2 bg-cyan-400 rounded-l-full"
                style={{ width: `${Math.abs(steeringPercent) / 2}%` }}
              />
            ) : (
              <div
                className="absolute top-0 bottom-0 left-1/2 bg-cyan-400 rounded-r-full"
                style={{ width: `${steeringPercent / 2}%` }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
