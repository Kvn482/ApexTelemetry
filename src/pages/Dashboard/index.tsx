import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Timer,
  Flag,
  Car,
  Clock,
  Trophy,
  Zap,
  TrendingDown,
  Upload,
  Plus,
  GitCompare,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SessionService } from '../../services/sessionService';
import { TrackService } from '../../services/trackService';
import { CarService } from '../../services/carService';
import { formatLapTime, formatDrivingDuration, formatSessionDate } from '../../utils/formatters';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [stats, setStats] = useState(() => SessionService.getOverallStats());
  const [recentSessions, setRecentSessions] = useState(() =>
    SessionService.getFiltered({ sortBy: 'date', sortOrder: 'desc' }).slice(0, 5)
  );

  const refreshData = () => {
    setStats(SessionService.getOverallStats());
    setRecentSessions(
      SessionService.getFiltered({ sortBy: 'date', sortOrder: 'desc' }).slice(0, 5)
    );
  };

  useEffect(() => {
    window.addEventListener('session-created', refreshData);
    return () => window.removeEventListener('session-created', refreshData);
  }, []);

  const performanceHistory = SessionService.getPerformanceHistory(periodDays);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome & Tagline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-wider uppercase">
              Pit Wall Dashboard
            </h1>
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry analytics, stint telemetry summaries & driver development metrics.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={Upload}
            onClick={() => navigate('/import')}
          >
            Import Telemetry
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={GitCompare}
            onClick={() => navigate('/compare')}
          >
            Compare Laps
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/sessions?new=true')}
          >
            New Session
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Sessions"
          value={stats.totalSessions}
          subtitle="Recorded training stints"
          icon={Timer}
          accentColor="#06b6d4"
        />
        <StatCard
          title="Total Laps"
          value={stats.totalLaps}
          subtitle="Full circuit laps"
          icon={Zap}
          accentColor="#10b981"
        />
        <StatCard
          title="Tracks"
          value={stats.tracksCount}
          subtitle="Active circuits"
          icon={Flag}
          accentColor="#f59e0b"
        />
        <StatCard
          title="Cars"
          value={stats.carsCount}
          subtitle="GT3 machinery"
          icon={Car}
          accentColor="#a855f7"
        />
        <StatCard
          title="Best Lap"
          value={stats.bestLapTime > 0 ? formatLapTime(stats.bestLapTime) : '--:--.---'}
          subtitle={stats.bestLapSession ? `${TrackService.getById(stats.bestLapSession.trackId)?.name.split(' ')[0]}` : 'Overall PB'}
          icon={Trophy}
          accentColor="#38bdf8"
        />
        <StatCard
          title="Driving Time"
          value={formatDrivingDuration(stats.totalDrivingMinutes)}
          subtitle="Total track time"
          icon={Clock}
          accentColor="#ec4899"
        />
      </div>

      {/* If 0 sessions: Onboarding Empty State */}
      {stats.totalSessions === 0 ? (
        <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-10 shadow-xl text-center max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Upload size={28} />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-wide">
            Your Telemetry Garage is Ready
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
            You don't have any telemetry sessions recorded yet. Drag and drop your MoTeC (.ld) log, export a CSV from MoTeC i2 Pro, or log a session manually to unlock lap time curves, apex analysis, and race engineering feedback.
          </p>
          <div className="flex items-center justify-center gap-3 pt-3">
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              onClick={() => navigate('/import')}
            >
              Import MoTeC / CSV File
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={Plus}
              onClick={() => navigate('/sessions?new=true')}
            >
              Log New Session
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Main Row: Performance Evolution Chart & Quick Progress Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Overview Chart */}
            <div className="lg:col-span-2 bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    Performance Overview
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Lap time progression across sessions (lower is faster)
                  </p>
                </div>

                {/* Time period filter buttons */}
                <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800 self-start">
                  {[
                    { label: '7 Days', days: 7 },
                    { label: '30 Days', days: 30 },
                    { label: '3 Months', days: 90 },
                    { label: 'All Time', days: 0 },
                  ].map(period => (
                    <button
                      key={period.label}
                      onClick={() => setPeriodDays(period.days)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                        periodDays === period.days
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={performanceHistory}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="date"
                      stroke="#475569"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <YAxis
                      domain={['dataMin - 1', 'dataMax + 1']}
                      stroke="#475569"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickFormatter={(val: number) => formatLapTime(val).slice(0, 7)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [formatLapTime(Number(val)), 'Best Lap']}
                      labelFormatter={(date: any) => `Date: ${date}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="bestLap"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#06b6d4', stroke: '#082f49', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#38bdf8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Stint Summary Card */}
            <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                    Latest Stint
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {recentSessions[0] ? formatSessionDate(recentSessions[0].date) : ''}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mt-3">
                  {recentSessions[0] ? TrackService.getById(recentSessions[0].trackId)?.name : 'No Stints'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {recentSessions[0] ? `${CarService.getById(recentSessions[0].carId)?.manufacturer} ${CarService.getById(recentSessions[0].carId)?.model}` : ''}
                </p>

                {recentSessions[0] && (
                  <div className="mt-5 space-y-3 bg-slate-900/80 rounded-xl p-3.5 border border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Best Lap</span>
                      <span className="text-cyan-400 font-mono font-bold">
                        {formatLapTime(recentSessions[0].bestLapTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Average Pace</span>
                      <span className="text-slate-300 font-mono font-semibold">
                        {formatLapTime(recentSessions[0].avgLapTime)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Laps Completed</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {recentSessions[0].totalLaps} laps
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() =>
                    recentSessions[0]
                      ? navigate(`/sessions/${recentSessions[0].id}`)
                      : navigate('/import')
                  }
                >
                  <span>{recentSessions[0] ? 'Inspect Stint' : 'Import Telemetry'}</span>
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Sessions List */}
          <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Recent Sessions
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Latest stints logged on the simulator
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/sessions')}
              >
                <span>View All Sessions</span>
                <ArrowRight size={14} />
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 px-3">Circuit</th>
                    <th className="pb-3 px-3">Car</th>
                    <th className="pb-3 px-3">Date</th>
                    <th className="pb-3 px-3">Type</th>
                    <th className="pb-3 px-3 text-center">Laps</th>
                    <th className="pb-3 px-3 text-right">Best Lap</th>
                    <th className="pb-3 px-3 text-right">Avg Lap</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentSessions.map(session => {
                    const track = TrackService.getById(session.trackId);
                    const car = CarService.getById(session.carId);
                    return (
                      <tr
                        key={session.id}
                        onClick={() => navigate(`/sessions/${session.id}`)}
                        className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 px-3 font-semibold text-white flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {track?.name || session.trackId}
                        </td>
                        <td className="py-3.5 px-3 text-slate-300">
                          {car?.manufacturer} {car?.model}
                        </td>
                        <td className="py-3.5 px-3 text-slate-400">
                          {formatSessionDate(session.date)}
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge sessionType={session.type}>{session.type}</Badge>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                          {session.totalLaps}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-cyan-400">
                          {formatLapTime(session.bestLapTime)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                          {formatLapTime(session.avgLapTime)}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <span className="text-cyan-400 group-hover:translate-x-1 inline-block transition-transform">
                            <ArrowRight size={14} />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
