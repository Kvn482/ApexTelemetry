import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, ArrowRight, Trophy, Timer, Zap } from 'lucide-react';
import { TrackService } from '../../services/trackService';
import { formatLapTime } from '../../utils/formatters';

export const TracksPage: React.FC = () => {
  const navigate = useNavigate();
  const tracks = TrackService.getAll();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-wider uppercase flex items-center gap-2">
          Circuit Catalog & Telemetry Records
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore circuit technical profiles, personal records, track records and lap time evolution.
        </p>
      </div>

      {/* Track Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map(track => {
          const stats = TrackService.getTrackStats(track.id);

          return (
            <div
              key={track.id}
              onClick={() => navigate(`/tracks/${track.id}`)}
              className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl hover:border-slate-700 cursor-pointer transition-all duration-150 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                    {track.country}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {track.turns} Turns
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mt-3 group-hover:text-cyan-400 transition-colors">
                  {track.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {track.description}
                </p>

                {/* Circuit SVG Preview */}
                <div className="my-4 h-28 bg-slate-950/80 rounded-xl border border-slate-800/80 p-2 flex items-center justify-center">
                  <svg viewBox={track.viewBox} className="w-full h-full">
                    <path
                      d={track.svgPath}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="4"
                      className="opacity-80"
                    />
                  </svg>
                </div>

                {/* Stats Breakdown */}
                <div className="grid grid-cols-2 gap-3 bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Personal Best
                    </span>
                    <span className="text-sm font-black text-cyan-400 telemetry-mono">
                      {formatLapTime(stats.personalBest)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Sessions / Laps
                    </span>
                    <span className="text-xs font-semibold text-slate-300 telemetry-mono">
                      {stats.sessionsCount} stints • {stats.totalLaps} laps
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Length: {track.lengthMeters.toLocaleString()}m</span>
                <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>View Track</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

