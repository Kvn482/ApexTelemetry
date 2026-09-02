import React, { useMemo } from 'react';
import { Track } from '../../types';
import { getCarPositionOnTrack } from '../../utils/trackGeometry';

interface TrackMapProps {
  track: Track;
  progress: number; // 0 to 1
  currentSpeed?: number;
  highlightCorner?: number;
  onSelectCorner?: (cornerNumber: number) => void;
  className?: string;
  showCorners?: boolean;
}

export const TrackMap: React.FC<TrackMapProps> = ({
  track,
  progress,
  currentSpeed,
  highlightCorner,
  onSelectCorner,
  className = '',
  showCorners = true,
}) => {
  // Calculate car position and orientation
  const carPos = useMemo(() => {
    return getCarPositionOnTrack(track.svgPath, progress);
  }, [track.svgPath, progress]);

  return (
    <div
      className={`relative flex items-center justify-center bg-[#0d1424]/90 rounded-2xl border border-slate-800/90 p-4 shadow-xl overflow-hidden ${className}`}
    >
      {/* Background grid line styling */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

      {/* Top track watermark info */}
      <div className="absolute top-4 left-4 z-10">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          {track.name}
        </h4>
        <p className="text-[11px] text-slate-400 font-mono">
          {track.lengthMeters.toLocaleString()}m • {track.turns} Turns
        </p>
      </div>

      {currentSpeed !== undefined && (
        <div className="absolute top-4 right-4 z-10 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 flex items-baseline gap-1.5 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400">Speed:</span>
          <span className="text-sm font-black text-cyan-400 telemetry-mono">
            {currentSpeed} <span className="text-[10px] text-slate-400">km/h</span>
          </span>
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        viewBox={track.viewBox || '0 0 800 500'}
        className="w-full h-full max-h-[380px] drop-shadow-lg select-none"
      >
        <defs>
          {/* Circuit background glow filter */}
          <filter id="track-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#06b6d4" floodOpacity="0.25" />
          </filter>
          <radialGradient id="car-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer asphalt track outline */}
        <path
          d={track.svgPath}
          fill="none"
          stroke="#1e293b"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Track curb border */}
        <path
          d={track.svgPath}
          fill="none"
          stroke="#334155"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Racing line centerline */}
        <path
          d={track.svgPath}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#track-glow)"
          className="opacity-90"
        />

        {/* Start / Finish line marker */}
        <line
          x1="130"
          y1="370"
          x2="150"
          y2="390"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="square"
        />

        {/* Corner markers & labels */}
        {showCorners &&
          track.corners.map(corner => {
            const isHighlighted = highlightCorner === corner.number;
            return (
              <g
                key={corner.number}
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => onSelectCorner && onSelectCorner(corner.number)}
              >
                <circle
                  cx={corner.x}
                  cy={corner.y}
                  r={isHighlighted ? 9 : 6}
                  fill={isHighlighted ? '#f59e0b' : '#0f172a'}
                  stroke={isHighlighted ? '#ffffff' : '#64748b'}
                  strokeWidth="2"
                />
                <text
                  x={corner.x + 9}
                  y={corner.y - 7}
                  fill={isHighlighted ? '#f59e0b' : '#94a3b8'}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  T{corner.number}
                </text>
              </g>
            );
          })}

        {/* Dynamic Car Marker dot on track */}
        <g transform={`translate(${carPos.x}, ${carPos.y})`}>
          {/* Pulsing halo */}
          <circle r="14" fill="url(#car-glow)" className="animate-pulse" />
          {/* Car dot */}
          <circle
            r="6"
            fill="#ffffff"
            stroke="#0284c7"
            strokeWidth="2.5"
            className="shadow-md"
          />
          {/* Direction indicator arrow */}
          <g transform={`rotate(${carPos.angleDeg})`}>
            <polygon points="9,0 3,-3.5 3,3.5" fill="#38bdf8" />
          </g>
        </g>
      </svg>
    </div>
  );
};
