import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Car as CarIcon, Flag, Trophy, Timer, Zap, ArrowRight } from 'lucide-react';
import { CarService } from '../../services/carService';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatLapTime, formatSessionDate } from '../../utils/formatters';

export const CarDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const car = CarService.getById(id || '');

  if (!car) {
    return (
      <div className="p-12 text-center bg-[#0e1526] rounded-2xl border border-slate-800">
        <h3 className="text-lg font-bold text-white">Vehicle not found</h3>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => navigate('/cars')}
        >
          Back to Garage
        </Button>
      </div>
    );
  }

  const stats = CarService.getCarStats(car.id);

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/cars')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Garage</span>
        </button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(`/sessions?car=${car.id}`)}
        >
          View Car Sessions ({stats.sessionsCount})
        </Button>
      </div>

      {/* Car Header Banner */}
      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: car.accentColor }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {car.manufacturer}
              </span>
              <Badge variant="cyan">{car.class}</Badge>
              <span className="text-xs text-slate-400 font-mono">Model Year {car.year}</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-wide mt-2">
              {car.manufacturer} {car.model}
            </h1>

            <div className="mt-4 flex items-center gap-3 text-xs text-slate-300 flex-wrap">
              <span className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                Power: <strong className="text-white">{car.powerHp} HP</strong>
              </span>
              <span className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                Weight: <strong className="text-white">{car.weightKg} kg</strong>
              </span>
              <span className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                Drivetrain: <strong className="text-white">{car.driveTrain}</strong>
              </span>
              <span className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                Top Speed: <strong className="text-white">{car.topSpeedKmh} km/h</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-slate-900/80 rounded-xl p-4 border border-slate-800 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Circuits</span>
              <p className="text-lg font-black text-white telemetry-mono mt-0.5">
                {stats.tracksCount}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Stints</span>
              <p className="text-lg font-black text-white telemetry-mono mt-0.5">
                {stats.sessionsCount}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Laps</span>
              <p className="text-lg font-black text-white telemetry-mono mt-0.5">
                {stats.totalLaps}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 13: Circuit Performance Matrix Table */}
      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Circuit Performance Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Personal best lap times recorded with the {car.model} across circuits
            </p>
          </div>
        </div>

        {stats.trackPerformance.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400">No on-track sessions recorded with the {car.model} yet.</p>
            <p className="text-[11px] text-slate-600 mt-1">Import a MoTeC or CSV file to populate vehicle performance.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Circuit</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4 text-center">Sessions</th>
                  <th className="py-3 px-4 text-center">Laps</th>
                  <th className="py-3 px-4 text-right">Personal Best</th>
                  <th className="py-3 px-4 text-right">Track Record</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats.trackPerformance.map(item => {
                  if (!item.track) return null;
                  const deltaToRecord = item.bestLap - item.track.recordLapTime;

                  return (
                    <tr
                      key={item.trackId}
                      onClick={() => navigate(`/tracks/${item.trackId}`)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <Flag size={14} className="text-slate-500" />
                        <span>{item.track.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {item.track.country}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {item.sessionsCount}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {item.lapsCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-400">
                        {formatLapTime(item.bestLap)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        {formatLapTime(item.track.recordLapTime)}
                        <span className="text-[10px] text-amber-400 block">
                          (+{deltaToRecord > 0 ? deltaToRecord.toFixed(3) : '0.000'}s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
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
        )}
      </div>
    </div>
  );
};

