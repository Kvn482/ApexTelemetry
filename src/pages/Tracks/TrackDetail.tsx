import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Flag, Trophy, Timer, Car, ArrowRight, Zap } from 'lucide-react';
import { TrackService } from '../../services/trackService';
import { TrackMap } from '../../components/telemetry/TrackMap';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatLapTime, formatSessionDate } from '../../utils/formatters';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const TrackDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const track = TrackService.getById(id || '');

  if (!track) {
    return (
      <div className="p-12 text-center bg-[#0e1526] rounded-2xl border border-slate-800">
        <h3 className="text-lg font-bold text-white">Track not found</h3>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => navigate('/tracks')}
        >
          Back to Tracks
        </Button>
      </div>
    );
  }

  const stats = TrackService.getTrackStats(track.id);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/tracks')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Circuit Catalog</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/sessions?track=${track.id}`)}
          >
            View Track Sessions ({stats.sessionsCount})
          </Button>
        </div>
      </div>

      {/* Main Track Header Card */}
      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
              {track.country}
            </span>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-wide mt-2">
              {track.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {track.description}
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-900/80 rounded-xl p-4 border border-slate-800 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Length</span>
              <p className="text-base font-black text-white telemetry-mono mt-0.5">
                {track.lengthMeters.toLocaleString()}m
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Turns</span>
              <p className="text-base font-black text-white telemetry-mono mt-0.5">
                {track.turns}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Track Record</span>
              <p className="text-base font-black text-amber-400 telemetry-mono mt-0.5">
                {formatLapTime(track.recordLapTime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Personal Best"
          value={stats.personalBest > 0 ? formatLapTime(stats.personalBest) : '--:--.---'}
          subtitle={
            stats.personalBest > 0
              ? `Delta to record: +${(stats.personalBest - track.recordLapTime).toFixed(3)}s`
              : 'No valid laps recorded'
          }
          icon={Trophy}
          accentColor="#06b6d4"
        />
        <StatCard
          title="Average Pace"
          value={stats.averageLap > 0 ? formatLapTime(stats.averageLap) : '--:--.---'}
          subtitle="All valid training laps"
          icon={Timer}
          accentColor="#10b981"
        />
        <StatCard
          title="Total Sessions"
          value={stats.sessionsCount}
          subtitle="Stints completed"
          icon={Flag}
          accentColor="#f59e0b"
        />
        <StatCard
          title="Total Laps"
          value={stats.totalLaps}
          subtitle="Circuits completed"
          icon={Zap}
          accentColor="#a855f7"
        />
      </div>

      {/* Track Map & Lap Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Circuit Map */}
        <div className="lg:col-span-6">
          <TrackMap
            track={track}
            progress={0.25}
            className="h-[360px]"
            showCorners={true}
          />
        </div>

        {/* Lap Time Evolution Chart */}
        <div className="lg:col-span-6 bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Lap Time Progression
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical lap time development across all sessions at {track.name.split(' ')[0]}
            </p>
          </div>

          {stats.progression.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/80 mt-4">
              <p className="text-xs">No sessions logged on this circuit yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">Import telemetry to populate lap progression.</p>
            </div>
          ) : (
            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.progression}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <XAxis
                    dataKey="date"
                    stroke="#475569"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                  />
                  <YAxis
                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                    stroke="#475569"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(val: number) => formatLapTime(val)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [formatLapTime(Number(val)), 'Best Lap']}
                  />
                  <Line
                    type="monotone"
                    dataKey="bestLap"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#06b6d4', stroke: '#082f49', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Cars Used at this track */}
      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
          Cars Driven at this Circuit
        </h3>

        {stats.carsUsed.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No cars have been driven at this circuit yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.carsUsed.map(item => {
              if (!item.car) return null;
              return (
                <div
                  key={item.carId}
                  onClick={() => navigate(`/cars/${item.carId}`)}
                  className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 hover:border-slate-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {item.car.manufacturer} {item.car.model}
                    </span>
                    <Badge variant="cyan">{item.car.class}</Badge>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Best Pace
                    </span>
                    <span className="text-sm font-black text-cyan-400 telemetry-mono">
                      {formatLapTime(item.bestLap)}
                    </span>
                  </div>

                  <div className="mt-1 flex items-baseline justify-between text-xs text-slate-400">
                    <span>Sessions logged:</span>
                    <span className="font-mono">{item.sessionsCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

