import React, { useState, useCallback, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { ComparisonPoint } from '../../services/comparisonService';

interface ComparisonChartsProps {
  data: ComparisonPoint[];
  labelA?: string;
  labelB?: string;
  overallDelta?: number;
  currentDistance?: number;
  onHoverDistance?: (distance: number) => void;
  sectorBoundaries?: {
    sector1EndDist: number;
    sector2EndDist: number;
  };
  className?: string;
}

export const ComparisonCharts: React.FC<ComparisonChartsProps> = ({
  data,
  labelA = 'Lap A',
  labelB = 'Ref Lap B',
  overallDelta,
  currentDistance,
  onHoverDistance,
  sectorBoundaries,
  className = '',
}) => {
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null);
  const [refAreaLeft, setRefAreaLeft] = useState<number | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  const maxDist = data && data.length > 0 ? data[data.length - 1].distance : 5000;
  const activeDomain: [number, number] = zoomDomain || [0, maxDist];

  const handleMouseDown = useCallback((e: any) => {
    if (e && e.activeLabel !== undefined && e.activeLabel !== null) {
      setRefAreaLeft(Number(e.activeLabel));
      setRefAreaRight(null);
      setIsSelecting(true);
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: any) => {
      if (isSelecting && e && e.activeLabel !== undefined && e.activeLabel !== null) {
        setRefAreaRight(Number(e.activeLabel));
      }
      if (e && e.activePayload && e.activePayload.length > 0) {
        const point = e.activePayload[0].payload as ComparisonPoint;
        if (point && onHoverDistance) {
          onHoverDistance(point.distance);
        }
      }
    },
    [isSelecting, onHoverDistance]
  );

  const handleMouseUp = useCallback(() => {
    if (refAreaLeft !== null && refAreaRight !== null) {
      const left = Math.min(refAreaLeft, refAreaRight);
      const right = Math.max(refAreaLeft, refAreaRight);
      if (right - left >= 15) {
        setZoomDomain([Math.max(0, left), Math.min(maxDist, right)]);
      }
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setIsSelecting(false);
  }, [refAreaLeft, refAreaRight, maxDist]);

  useEffect(() => {
    if (!isSelecting) return;
    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isSelecting, handleMouseUp]);

  const handleZoomIn = () => {
    const [left, right] = activeDomain;
    const span = right - left;
    const center = (left + right) / 2;
    const newSpan = span * 0.7;
    if (newSpan >= 20) {
      setZoomDomain([
        Math.max(0, Math.round(center - newSpan / 2)),
        Math.min(maxDist, Math.round(center + newSpan / 2)),
      ]);
    }
  };

  const handleZoomOut = () => {
    const [left, right] = activeDomain;
    const span = right - left;
    const center = (left + right) / 2;
    const newSpan = span * 1.4;
    if (newSpan >= maxDist * 0.95) {
      setZoomDomain(null);
    } else {
      setZoomDomain([
        Math.max(0, Math.round(center - newSpan / 2)),
        Math.min(maxDist, Math.round(center + newSpan / 2)),
      ]);
    }
  };

  const handlePan = (direction: 'left' | 'right') => {
    const [left, right] = activeDomain;
    const span = right - left;
    const shift = span * 0.25;
    if (direction === 'left') {
      const newLeft = Math.max(0, Math.round(left - shift));
      setZoomDomain([newLeft, newLeft + span]);
    } else {
      const newRight = Math.min(maxDist, Math.round(right + shift));
      setZoomDomain([Math.max(0, newRight - span), newRight]);
    }
  };

  const handleResetZoom = () => {
    setZoomDomain(null);
    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  const s1End = sectorBoundaries?.sector1EndDist || Math.round(maxDist * 0.33);
  const s2End = sectorBoundaries?.sector2EndDist || Math.round(maxDist * 0.67);

  const handleSectorZoom = (sector: 1 | 2 | 3 | 'all') => {
    if (sector === 'all') {
      setZoomDomain(null);
    } else if (sector === 1) {
      setZoomDomain([0, s1End]);
    } else if (sector === 2) {
      setZoomDomain([s1End, s2End]);
    } else if (sector === 3) {
      setZoomDomain([s2End, maxDist]);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.altKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.25 : 0.8;
      const [curLeft, curRight] = activeDomain;
      const span = curRight - curLeft;
      const center = currentDistance !== undefined && currentDistance >= curLeft && currentDistance <= curRight
        ? currentDistance
        : (curLeft + curRight) / 2;

      const newSpan = span * zoomFactor;
      if (newSpan >= maxDist * 0.98) {
        setZoomDomain(null);
      } else if (newSpan > 25) {
        const newLeft = Math.max(0, Math.round(center - (center - curLeft) * zoomFactor));
        const newRight = Math.min(maxDist, Math.round(center + (curRight - center) * zoomFactor));
        setZoomDomain([newLeft, newRight]);
      }
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-[#0d1424] rounded-xl border border-slate-800">
        No comparison telemetry traces available.
      </div>
    );
  }

  const maxDelta = Math.max(...data.map(d => Math.abs(d.delta)), 0.5);
  const finalDelta = overallDelta !== undefined ? overallDelta : (data[data.length - 1]?.delta ?? 0);

  return (
    <div
      className={`space-y-3 telemetry-containment select-none ${className}`}
      onWheel={handleWheel}
    >
      {/* Zoom and Navigation Controls Bar */}
      <div className="bg-[#0b111e] rounded-xl border border-slate-800 p-2.5 px-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Left: Zoom Window Status & Legend */}
        <div className="flex items-center gap-2.5">
          {zoomDomain ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Zoom: {Math.round(activeDomain[0])}m – {Math.round(activeDomain[1])}m
              <span className="text-slate-400 text-[10px]">
                ({Math.round(activeDomain[1] - activeDomain[0])}m ventana)
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800">
              Vuelta Completa: 0m – {maxDist}m
            </span>
          )}

          {/* Quick Legend: Lap A (solid) vs Lap B (dashed gray) */}
          <div className="flex items-center gap-3 text-xs pl-2 border-l border-slate-800">
            <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
              <span className="w-3 h-0.5 bg-cyan-400" />
              {labelA}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <span className="w-3 h-0.5 bg-slate-300 border-b border-dashed border-slate-300" />
              {labelB} (Ref)
            </span>
          </div>

          <span className="text-[11px] text-slate-400 hidden xl:flex items-center gap-1">
            <Info size={13} className="text-slate-400" />
            Arrastra sobre cualquier gráfica para comparar esa curva
          </span>
        </div>

        {/* Center: Sector Quick Shortcuts */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => handleSectorZoom('all')}
            className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
              !zoomDomain
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todo
          </button>
          <button
            type="button"
            onClick={() => handleSectorZoom(1)}
            className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
              zoomDomain && zoomDomain[0] === 0 && zoomDomain[1] === s1End
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sector 1
          </button>
          <button
            type="button"
            onClick={() => handleSectorZoom(2)}
            className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
              zoomDomain && zoomDomain[0] === s1End && zoomDomain[1] === s2End
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sector 2
          </button>
          <button
            type="button"
            onClick={() => handleSectorZoom(3)}
            className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
              zoomDomain && zoomDomain[0] === s2End && zoomDomain[1] === maxDist
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sector 3
          </button>
        </div>

        {/* Right: Zoom & Pan Action Buttons */}
        <div className="flex items-center gap-1.5">
          {zoomDomain && (
            <div className="flex items-center gap-1 mr-1">
              <button
                type="button"
                onClick={() => handlePan('left')}
                title="Desplazar a la izquierda"
                className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => handlePan('right')}
                title="Desplazar a la derecha"
                className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleZoomIn}
            title="Acercar zoom (+)"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <ZoomIn size={13} />
            <span>Acercar</span>
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            title="Alejar zoom (-)"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <ZoomOut size={13} />
            <span>Alejar</span>
          </button>

          {zoomDomain && (
            <button
              type="button"
              onClick={handleResetZoom}
              title="Restablecer a vuelta completa"
              className="flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 hover:bg-rose-500/20 transition font-medium"
            >
              <RotateCcw size={13} />
              <span>Reiniciar</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Time Delta Chart */}
      <div className="bg-[#0b111e] rounded-xl border border-slate-800 p-2.5 px-3 shadow-lg">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-400" />
              Time Delta (vs Reference Lap)
            </span>
            <span className="text-[11px] text-slate-400">
              <span className="text-rose-400 font-semibold">+Slower</span> /{' '}
              <span className="text-emerald-400 font-semibold">-Faster</span>
            </span>
          </div>
          <span className="text-xs font-mono text-slate-300">
            Finish Delta:{' '}
            <strong className={finalDelta > 0 ? 'text-rose-400' : 'text-emerald-400'}>
              {finalDelta > 0 ? '+' : ''}
              {finalDelta.toFixed(3)}s
            </strong>
          </span>
        </div>
        <div className="h-28 w-full cursor-crosshair">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              syncId="apexComparisonSync"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              margin={{ top: 5, right: 20, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="compDeltaColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity={0.4} />
                  <stop offset="90%" stopColor="#c084fc" stopOpacity={0.06} />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="distance"
                type="number"
                domain={activeDomain}
                allowDataOverflow
                hide
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
              {refAreaLeft !== null && refAreaRight !== null && (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  stroke="#06b6d4"
                  strokeOpacity={0.8}
                  fill="#06b6d4"
                  fillOpacity={0.18}
                />
              )}
              <Area
                type="linear"
                dataKey="delta"
                stroke="#c084fc"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#compDeltaColor)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Speed Comparison Chart */}
      <div className="bg-[#0b111e] rounded-xl border border-slate-800 p-2.5 px-3 shadow-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
            Speed (km/h)
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-cyan-400 font-mono">
              {labelA}: {Math.max(...data.map(p => p.speedA))} km/h
            </span>
            <span className="text-slate-300 font-mono">
              {labelB}: {Math.max(...data.map(p => p.speedB))} km/h
            </span>
          </div>
        </div>
        <div className="h-32 w-full cursor-crosshair">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              syncId="apexComparisonSync"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              margin={{ top: 5, right: 20, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="compSpeedColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="85%" stopColor="#06b6d4" stopOpacity={0.06} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="distance"
                type="number"
                domain={activeDomain}
                allowDataOverflow
                hide
              />
              <YAxis
                domain={[0, 'auto']}
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
                  `${val} km/h`,
                  name === 'speedA' ? labelA : labelB,
                ]}
                labelFormatter={(dist: any) => `Dist: ${dist}m`}
              />
              {currentDistance !== undefined && (
                <ReferenceLine x={currentDistance} stroke="#38bdf8" strokeWidth={1.5} />
              )}
              {refAreaLeft !== null && refAreaRight !== null && (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  stroke="#06b6d4"
                  strokeOpacity={0.8}
                  fill="#06b6d4"
                  fillOpacity={0.18}
                />
              )}
              {/* Primary Area with Gradient */}
              <Area
                type="linear"
                dataKey="speedA"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#compSpeedColor)"
                dot={false}
                isAnimationActive={false}
              />
              {/* Comparison Line rendered on TOP of Area fill so it is never obscured */}
              <Line
                type="linear"
                dataKey="speedB"
                stroke="#cbd5e1"
                strokeWidth={1.75}
                strokeDasharray="3 2"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Throttle Comparison Chart (Separated) */}
      <div className="bg-[#0b111e] rounded-xl border border-slate-800 p-2.5 px-3 shadow-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            Throttle (%)
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-emerald-400 font-medium">{labelA} (solid)</span>
            <span className="text-slate-300 font-medium">{labelB} (dashed)</span>
          </div>
        </div>
        <div className="h-28 w-full cursor-crosshair">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              syncId="apexComparisonSync"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              margin={{ top: 5, right: 20, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="compThrottleColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.42} />
                  <stop offset="85%" stopColor="#10b981" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="distance"
                type="number"
                domain={activeDomain}
                allowDataOverflow
                hide
              />
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
                  name === 'throttleA' ? `${labelA} Throttle` : `${labelB} Throttle`,
                ]}
                labelFormatter={(dist: any) => `Dist: ${dist}m`}
              />
              {currentDistance !== undefined && (
                <ReferenceLine x={currentDistance} stroke="#38bdf8" strokeWidth={1.5} />
              )}
              {refAreaLeft !== null && refAreaRight !== null && (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  stroke="#06b6d4"
                  strokeOpacity={0.8}
                  fill="#06b6d4"
                  fillOpacity={0.18}
                />
              )}
              {/* Primary Area with Gradient */}
              <Area
                type="linear"
                dataKey="throttleA"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#compThrottleColor)"
                dot={false}
                isAnimationActive={false}
              />
              {/* Comparison Line rendered on TOP */}
              <Line
                type="linear"
                dataKey="throttleB"
                stroke="#cbd5e1"
                strokeWidth={1.75}
                strokeDasharray="3 2"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Brake Comparison Chart (Separated) */}
      <div className="bg-[#0b111e] rounded-xl border border-slate-800 p-2.5 px-3 shadow-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" />
            Brake (%)
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-rose-400 font-medium">{labelA} (solid)</span>
            <span className="text-slate-300 font-medium">{labelB} (dashed)</span>
          </div>
        </div>
        <div className="h-28 w-full cursor-crosshair">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              syncId="apexComparisonSync"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              margin={{ top: 5, right: 20, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="compBrakeColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.42} />
                  <stop offset="85%" stopColor="#f43f5e" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="distance"
                type="number"
                domain={activeDomain}
                allowDataOverflow
                hide
              />
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
                  name === 'brakeA' ? `${labelA} Brake` : `${labelB} Brake`,
                ]}
                labelFormatter={(dist: any) => `Dist: ${dist}m`}
              />
              {currentDistance !== undefined && (
                <ReferenceLine x={currentDistance} stroke="#38bdf8" strokeWidth={1.5} />
              )}
              {refAreaLeft !== null && refAreaRight !== null && (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  stroke="#06b6d4"
                  strokeOpacity={0.8}
                  fill="#06b6d4"
                  fillOpacity={0.18}
                />
              )}
              {/* Primary Area with Gradient */}
              <Area
                type="linear"
                dataKey="brakeA"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#compBrakeColor)"
                dot={false}
                isAnimationActive={false}
              />
              {/* Comparison Line rendered on TOP */}
              <Line
                type="linear"
                dataKey="brakeB"
                stroke="#cbd5e1"
                strokeWidth={1.75}
                strokeDasharray="3 2"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Gear Comparison Chart (Separated) */}
      <div className="bg-[#0b111e] rounded-xl border border-slate-800 p-2.5 px-3 shadow-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            Gear
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-amber-400 font-medium">{labelA} (solid)</span>
            <span className="text-slate-300 font-medium">{labelB} (dashed)</span>
          </div>
        </div>
        <div className="h-24 w-full cursor-crosshair">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              syncId="apexComparisonSync"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              margin={{ top: 5, right: 20, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="compGearColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.28} />
                  <stop offset="90%" stopColor="#f59e0b" stopOpacity={0.04} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="distance"
                type="number"
                domain={activeDomain}
                allowDataOverflow
                hide
              />
              <YAxis
                domain={[0, 'auto']}
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
                  `Gear ${val}`,
                  name === 'gearA' ? `${labelA} Gear` : `${labelB} Gear`,
                ]}
                labelFormatter={(dist: any) => `Dist: ${dist}m`}
              />
              {currentDistance !== undefined && (
                <ReferenceLine x={currentDistance} stroke="#38bdf8" strokeWidth={1.5} />
              )}
              {refAreaLeft !== null && refAreaRight !== null && (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  stroke="#06b6d4"
                  strokeOpacity={0.8}
                  fill="#06b6d4"
                  fillOpacity={0.18}
                />
              )}
              <Area
                type="stepAfter"
                dataKey="gearA"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#compGearColor)"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="stepAfter"
                dataKey="gearB"
                stroke="#cbd5e1"
                strokeWidth={1.75}
                strokeDasharray="3 2"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. Engine RPM Comparison Chart (Separated) */}
      <div className="bg-[#0b111e] rounded-xl border border-slate-800 p-2.5 px-3 shadow-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-400" />
            Engine RPM
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-sky-400 font-mono">
              {labelA}: {Math.max(...data.map(p => p.rpmA || 0))} RPM
            </span>
            <span className="text-slate-300 font-mono">
              {labelB}: {Math.max(...data.map(p => p.rpmB || 0))} RPM
            </span>
          </div>
        </div>
        <div className="h-28 w-full cursor-crosshair">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              syncId="apexComparisonSync"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              margin={{ top: 5, right: 20, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="compRpmColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.32} />
                  <stop offset="90%" stopColor="#38bdf8" stopOpacity={0.05} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="distance"
                type="number"
                domain={activeDomain}
                allowDataOverflow
                hide
              />
              <YAxis
                domain={['auto', 'auto']}
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
                  `${val} RPM`,
                  name === 'rpmA' ? `${labelA} RPM` : `${labelB} RPM`,
                ]}
                labelFormatter={(dist: any) => `Dist: ${dist}m`}
              />
              {currentDistance !== undefined && (
                <ReferenceLine x={currentDistance} stroke="#38bdf8" strokeWidth={1.5} />
              )}
              {refAreaLeft !== null && refAreaRight !== null && (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  stroke="#06b6d4"
                  strokeOpacity={0.8}
                  fill="#06b6d4"
                  fillOpacity={0.18}
                />
              )}
              <Area
                type="linear"
                dataKey="rpmA"
                stroke="#38bdf8"
                strokeWidth={1.75}
                fillOpacity={1}
                fill="url(#compRpmColor)"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="rpmB"
                stroke="#cbd5e1"
                strokeWidth={1.5}
                strokeDasharray="3 2"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7. Steering Comparison Chart */}
      <div className="bg-[#0b111e] rounded-xl border border-slate-800 p-2.5 px-3 shadow-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-400" />
            Steering Angle (Deg)
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-purple-400 font-medium">{labelA} (solid)</span>
            <span className="text-slate-300 font-medium">{labelB} (dashed)</span>
          </div>
        </div>
        <div className="h-28 w-full cursor-crosshair">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              syncId="apexComparisonSync"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              margin={{ top: 5, right: 20, left: -20, bottom: 20 }}
            >
              <XAxis
                dataKey="distance"
                type="number"
                domain={activeDomain}
                allowDataOverflow
                stroke="#475569"
                tick={{ fontSize: 10, fill: '#64748b' }}
                unit="m"
              />
              <YAxis
                domain={[-180, 180]}
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
                  `${val}°`,
                  name === 'steeringA' ? `${labelA} Steering` : `${labelB} Steering`,
                ]}
                labelFormatter={(dist: any) => `Dist: ${dist}m`}
              />
              <ReferenceLine y={0} stroke="#334155" strokeDasharray="2 2" />
              {currentDistance !== undefined && (
                <ReferenceLine x={currentDistance} stroke="#38bdf8" strokeWidth={1.5} />
              )}
              {refAreaLeft !== null && refAreaRight !== null && (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  stroke="#06b6d4"
                  strokeOpacity={0.8}
                  fill="#06b6d4"
                  fillOpacity={0.18}
                />
              )}
              <Line
                type="linear"
                dataKey="steeringA"
                stroke="#c084fc"
                strokeWidth={1.75}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="steeringB"
                stroke="#cbd5e1"
                strokeWidth={1.5}
                strokeDasharray="3 2"
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
