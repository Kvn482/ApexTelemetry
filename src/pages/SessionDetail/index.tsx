import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Timer,
  Gauge,
  Flag,
  CloudSun,
  Clock,
  Wind,
  Trophy,
  GitCompare,
  Activity,
  CheckCircle2,
  XCircle,
  Zap,
} from 'lucide-react';
import { SessionService } from '../../services/sessionService';
import { TrackService } from '../../services/trackService';
import { CarService } from '../../services/carService';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import {
  formatLapTime,
  formatDelta,
  formatSectorTime,
  formatSessionDate,
  formatDrivingDuration,
} from '../../utils/formatters';

export const SessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const session = SessionService.getById(id || '');
  const [selectedLapNumber, setSelectedLapNumber] = useState<number>(
    session && session.laps.length > 0 ? session.laps.find(l => l.isSessionBest)?.lapNumber || 1 : 1
  );

  if (!session) {
    return (
      <div className="p-12 text-center bg-[#0e1526] rounded-2xl border border-slate-800">
        <h3 className="text-lg font-bold text-white">Session not found</h3>
        <p className="text-xs text-slate-400 mt-1">
          The requested session could not be located in your telemetry database.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => navigate('/sessions')}
        >
          Back to Sessions
        </Button>
      </div>
    );
  }

  const track = TrackService.getById(session.trackId);
  const car = CarService.getById(session.carId);

  // Calculate consistency rating (% within 1.0s of best lap)
  const validLaps = session.laps.filter(l => l.isValid);
  const consistentLaps = validLaps.filter(
    l => l.lapTime - session.bestLapTime <= 1.0
  );
  const consistencyRating =
    validLaps.length > 0
      ? Math.round((consistentLaps.length / validLaps.length) * 100)
      : 85;

  const topSpeedOverall = Math.max(
    ...session.laps.map(l => l.topSpeed || 270)
  );
  const avgSpeedOverall =
    Math.round(
      session.laps.reduce((acc, l) => acc + (l.avgSpeed || 175), 0) /
        (session.laps.length || 1)
    );

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/sessions')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Sessions</span>
        </button>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={GitCompare}
            onClick={() =>
              navigate(`/compare?sessionA=${session.id}&lapA=${selectedLapNumber}`)
            }
          >
            Compare Lap {selectedLapNumber}
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Activity}
            onClick={() =>
              navigate(`/analysis?sessionId=${session.id}&lapNumber=${selectedLapNumber}`)
            }
          >
            Launch Lap Analysis
          </Button>
        </div>
      </div>

      {/* Session Header Card */}
      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge sessionType={session.type}>{session.type}</Badge>
              <span className="text-xs text-slate-400 font-mono">
                {formatSessionDate(session.date)}
              </span>
              <span className="text-xs text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-mono">
                Session ID: {session.id.slice(0, 16)}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-wide mt-2">
              {track?.name}
            </h1>
            <p className="text-sm text-cyan-400 font-semibold mt-1">
              {car?.manufacturer} {car?.model}{' '}
              <span className="text-slate-400 font-normal">({car?.class})</span>
            </p>

            {session.notes && (
              <p className="mt-3 text-xs text-slate-300 bg-slate-900/80 rounded-lg p-2.5 border border-slate-800/80 max-w-2xl leading-relaxed">
                <strong className="text-slate-400 uppercase text-[10px] block mb-0.5">
                  Engineer Stint Log:
                </strong>
                {session.notes}
              </p>
            )}
          </div>

          {/* Track Conditions Pill Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1">
                <CloudSun size={12} className="text-amber-400" /> Weather
              </span>
              <p className="font-semibold text-white mt-1">
                {session.conditions.weather} ({session.conditions.airTemp}°C)
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Track Temp
              </span>
              <p className="font-semibold text-rose-400 telemetry-mono mt-1">
                {session.conditions.trackTemp}°C
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Surface Grip
              </span>
              <p className="font-semibold text-emerald-400 telemetry-mono mt-1">
                {session.conditions.gripLevel}% Optimum
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1">
                <Wind size={12} className="text-slate-400" /> Wind
              </span>
              <p className="font-semibold text-white telemetry-mono mt-1">
                {session.conditions.windSpeed} km/h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Session Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Best Lap"
          value={formatLapTime(session.bestLapTime)}
          subtitle="Session fastest"
          icon={Trophy}
          accentColor="#06b6d4"
        />
        <StatCard
          title="Average Lap"
          value={formatLapTime(session.avgLapTime)}
          subtitle="All valid laps"
          icon={Timer}
          accentColor="#10b981"
        />
        <StatCard
          title="Top Speed"
          value={`${topSpeedOverall} km/h`}
          subtitle="Long straight trap"
          icon={Zap}
          accentColor="#f59e0b"
        />
        <StatCard
          title="Avg Speed"
          value={`${avgSpeedOverall} km/h`}
          subtitle="Full lap average"
          icon={Gauge}
          accentColor="#38bdf8"
        />
        <StatCard
          title="Total Laps"
          value={session.totalLaps}
          subtitle={`Duration: ${formatDrivingDuration(session.drivingTimeMinutes)}`}
          icon={Flag}
          accentColor="#a855f7"
        />
        <StatCard
          title="Consistency"
          value={`${consistencyRating}%`}
          subtitle="Laps within 1.0s"
          icon={Clock}
          accentColor="#10b981"
        />
      </div>

      {/* Lap Table */}
      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Lap Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a lap to load telemetry traces and replay telemetry on circuit
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Selected Lap: <strong className="text-cyan-400">#{selectedLapNumber}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Lap</th>
                <th className="py-3 px-4">Lap Time</th>
                <th className="py-3 px-4 text-center">Delta</th>
                <th className="py-3 px-4 text-center">Sector 1</th>
                <th className="py-3 px-4 text-center">Sector 2</th>
                <th className="py-3 px-4 text-center">Sector 3</th>
                <th className="py-3 px-4 text-right">Top Speed</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {session.laps.map(lap => {
                const isSelected = selectedLapNumber === lap.lapNumber;
                return (
                  <tr
                    key={lap.id}
                    onClick={() => setSelectedLapNumber(lap.lapNumber)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/10 border-l-2 border-cyan-400'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      #{lap.lapNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      <span
                        className={
                          lap.isSessionBest ? 'text-cyan-400 font-black' : ''
                        }
                      >
                        {lap.formattedTime}
                      </span>
                      {lap.isSessionBest && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-sans uppercase font-bold">
                          PB
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-xs">
                      {lap.isSessionBest ? (
                        <span className="text-slate-500">—</span>
                      ) : (
                        <span className="text-rose-400">
                          {formatDelta(lap.delta)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-300">
                      {formatSectorTime(lap.sectors[0]?.time)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-300">
                      {formatSectorTime(lap.sectors[1]?.time)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-300">
                      {formatSectorTime(lap.sectors[2]?.time)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {lap.topSpeed} km/h
                    </td>
                    <td className="py-3 px-4 text-center">
                      {lap.isValid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                          <CheckCircle2 size={13} />
                          <span>Valid</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 text-xs">
                          <XCircle size={13} />
                          <span>Track Limits</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant={isSelected ? 'primary' : 'outline'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/analysis?sessionId=${session.id}&lapNumber=${lap.lapNumber}`
                          );
                        }}
                      >
                        Analyze Lap
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

