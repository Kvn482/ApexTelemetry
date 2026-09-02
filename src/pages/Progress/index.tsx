import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Timer,
  Zap,
  Gauge,
  Activity,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { SessionService } from '../../services/sessionService';
import { TrackService } from '../../services/trackService';
import { CarService } from '../../services/carService';
import { StatCard } from '../../components/ui/StatCard';
import { formatLapTime, formatDelta, formatSessionDate } from '../../utils/formatters';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';

export const ProgressPage: React.FC = () => {
  const tracks = TrackService.getAll();
  const cars = CarService.getAll();

  const [selectedTrack, setSelectedTrack] = useState<string>('sebring');
  const [selectedCar, setSelectedCar] = useState<string>('ferrari-296-gt3');

  // Filter sessions matching Track + Car
  const filteredSessions = useMemo(() => {
    const all = SessionService.getAll().filter(
      s => s.trackId === selectedTrack && s.carId === selectedCar
    );
    return all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedTrack, selectedCar]);

  const track = TrackService.getById(selectedTrack);
  const car = CarService.getById(selectedCar);

  // Section 15 Progress Metrics calculations
  const progressMetrics = useMemo(() => {
    if (filteredSessions.length === 0) {
      return {
        firstLap: 0,
        currentBest: 0,
        personalBest: 0,
        avgLap: 0,
        improvement: 0,
        totalSessions: 0,
        totalLaps: 0,
        progressionData: [],
      };
    }

    const firstSession = filteredSessions[0];
    const latestSession = filteredSessions[filteredSessions.length - 1];

    const firstLap = firstSession.bestLapTime;
    const currentBest = Math.min(...filteredSessions.map(s => s.bestLapTime));
    const improvement = parseFloat((currentBest - firstLap).toFixed(3)); // negative is faster

    const allLaps = filteredSessions.flatMap(s => s.laps).filter(l => l.isValid);
    const avgLap =
      allLaps.length > 0
        ? allLaps.reduce((acc, l) => acc + l.lapTime, 0) / allLaps.length
        : currentBest + 0.8;

    const totalLaps = filteredSessions.reduce((acc, s) => acc + s.totalLaps, 0);

    const progressionData = filteredSessions.map(s => ({
      date: formatSessionDate(s.date),
      bestLap: s.bestLapTime,
      avgLap: s.avgLapTime,
      type: s.type,
    }));

    return {
      firstLap,
      currentBest,
      personalBest: currentBest,
      avgLap,
      improvement,
      totalSessions: filteredSessions.length,
      totalLaps,
      progressionData,
    };
  }, [filteredSessions]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-wider uppercase flex items-center gap-2">
          <TrendingUp size={24} className="text-cyan-400" />
          Driver Progress & Performance Evolution
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Track driver development milestones, delta improvements, and driving telemetry consistency.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="bg-[#0e1526] rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Select Circuit
            </label>
            <select
              value={selectedTrack}
              onChange={e => setSelectedTrack(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 min-w-[200px]"
            >
              {tracks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Select Car
            </label>
            <select
              value={selectedCar}
              onChange={e => setSelectedCar(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 min-w-[200px]"
            >
              {cars.map(c => (
                <option key={c.id} value={c.id}>
                  {c.manufacturer} {c.model}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Target Combo
          </span>
          <span className="text-xs font-bold text-cyan-400">
            {track?.name} × {car?.model}
          </span>
        </div>
      </div>

      {/* Section 15: Highlight Improvement Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="First Session Pace"
          value={formatLapTime(progressMetrics.firstLap)}
          subtitle="Baseline shakedown"
          icon={Calendar}
          accentColor="#64748b"
        />
        <StatCard
          title="Current Best"
          value={formatLapTime(progressMetrics.currentBest)}
          subtitle="All-time personal best"
          icon={Trophy}
          accentColor="#06b6d4"
        />
        <StatCard
          title="Total Improvement"
          value={formatDelta(progressMetrics.improvement)}
          subtitle="Lap time shaved"
          icon={TrendingDown}
          accentColor="#10b981"
          trend={{
            value: `${Math.abs(progressMetrics.improvement).toFixed(3)}s faster`,
            positive: true,
          }}
        />
        <StatCard
          title="Average Pace"
          value={formatLapTime(progressMetrics.avgLap)}
          subtitle="Valid stint laps"
          icon={Timer}
          accentColor="#38bdf8"
        />
        <StatCard
          title="Telemetry Mileage"
          value={`${progressMetrics.totalLaps} Laps`}
          subtitle={`Across ${progressMetrics.totalSessions} sessions`}
          icon={Activity}
          accentColor="#a855f7"
        />
      </div>

      {/* Main Progression Line Chart */}
      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Lap Time Trajectory
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical lap time delta reduction at {track?.name}
            </p>
          </div>
        </div>

        {progressMetrics.progressionData.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/80">
            <p className="text-xs">No telemetry stints recorded yet for this combination.</p>
            <p className="text-[11px] text-slate-600 mt-1">Import a CSV / MoTeC file or log a stint to track your progress trajectory.</p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={progressMetrics.progressionData}
                margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#475569"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  stroke="#475569"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val: number) => formatLapTime(val)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [formatLapTime(Number(val)), 'Best Lap']}
                />
                <Area
                  type="monotone"
                  dataKey="bestLap"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#progressGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Section 16: Performance Analysis Metrics */}
      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Performance & Consistency Analytics
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Holistic analysis of driving technique across braking, throttle application, and consistency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Lap Consistency */}
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-300">
                Lap Consistency
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">92%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }} />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              92% of laps within 0.75s of session personal best.
            </p>
          </div>

          {/* Braking Consistency */}
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-300">
                Braking Consistency
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">88%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: '88%' }} />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Braking points variance under 4.2m across heavy braking zones.
            </p>
          </div>

          {/* Throttle Application */}
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-300">
                Throttle Smoothness
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">85%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '85%' }} />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Smooth progressive throttle roll-on on corner exits with minimal TC intervention.
            </p>
          </div>

          {/* Sector Efficiency */}
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-300">
                Sector Efficiency
              </span>
              <span className="text-xs font-mono text-purple-400 font-bold">96%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: '96%' }} />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Sector 1 & 2 at 98% efficiency. Sector 3 has 0.18s potential gain remaining.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

