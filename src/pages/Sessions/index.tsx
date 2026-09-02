import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  List,
  Calendar,
  CloudSun,
  Timer,
  Car as CarIcon,
  Flag,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { SessionService } from '../../services/sessionService';
import { TrackService } from '../../services/trackService';
import { CarService } from '../../services/carService';
import { SessionType } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatLapTime, formatSessionDate, formatDrivingDuration } from '../../utils/formatters';

export const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>(searchParams.get('track') || '');
  const [selectedCar, setSelectedCar] = useState<string>(searchParams.get('car') || '');
  const [selectedType, setSelectedType] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'lapTime' | 'laps'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const tracks = TrackService.getAll();
  const cars = CarService.getAll();

  // Filter and sort sessions
  const sessions = useMemo(() => {
    return SessionService.getFiltered({
      trackId: selectedTrack || undefined,
      carId: selectedCar || undefined,
      sessionType: (selectedType as SessionType) || undefined,
      searchQuery: searchQuery || undefined,
      sortBy,
      sortOrder,
    });
  }, [selectedTrack, selectedCar, selectedType, searchQuery, sortBy, sortOrder]);

  // Combined Track + Car Matrix Statistics (Section 14 of requirements)
  const combinedMatrixStats = useMemo(() => {
    if (!selectedTrack || !selectedCar) return null;
    const matched = sessions.filter(
      s => s.trackId === selectedTrack && s.carId === selectedCar
    );
    if (matched.length === 0) return null;

    const totalLaps = matched.reduce((acc, s) => acc + s.totalLaps, 0);
    const bestLap = Math.min(...matched.map(s => s.bestLapTime));
    const avgLap =
      matched.reduce((acc, s) => acc + s.avgLapTime, 0) / matched.length;

    const trackObj = TrackService.getById(selectedTrack);
    const carObj = CarService.getById(selectedCar);

    return {
      title: `${trackObj?.name.toUpperCase()} × ${carObj?.manufacturer.toUpperCase()} ${carObj?.model.toUpperCase()}`,
      sessionsCount: matched.length,
      laps: totalLaps,
      best: bestLap,
      average: avgLap,
    };
  }, [selectedTrack, selectedCar, sessions]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTrack('');
    setSelectedCar('');
    setSelectedType('');
    setSortBy('date');
    setSortOrder('desc');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wider uppercase flex items-center gap-2">
            Session History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, filter, and drill into telemetry logs from all circuits and cars.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${
                viewMode === 'table' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Combined Track + Car Banner (Section 14) */}
      {combinedMatrixStats && (
        <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-slate-900/90 border border-cyan-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                <Sparkles size={12} /> Combined Filter Matrix
              </span>
              <h3 className="text-lg font-black text-white tracking-wide mt-1">
                {combinedMatrixStats.title}
              </h3>
            </div>

            <div className="flex items-center gap-6 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Sessions</span>
                <p className="text-lg font-black text-white telemetry-mono">
                  {combinedMatrixStats.sessionsCount}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Laps</span>
                <p className="text-lg font-black text-white telemetry-mono">
                  {combinedMatrixStats.laps}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400">Best Lap</span>
                <p className="text-lg font-black text-emerald-400 telemetry-mono">
                  {formatLapTime(combinedMatrixStats.best)}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Average</span>
                <p className="text-lg font-black text-slate-300 telemetry-mono">
                  {formatLapTime(combinedMatrixStats.average)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-[#0e1526] rounded-xl border border-slate-800 p-4 shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search sessions, notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Track Filter */}
          <select
            value={selectedTrack}
            onChange={e => setSelectedTrack(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Circuits</option>
            {tracks.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Car Filter */}
          <select
            value={selectedCar}
            onChange={e => setSelectedCar(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Cars</option>
            {cars.map(c => (
              <option key={c.id} value={c.id}>
                {c.manufacturer} {c.model}
              </option>
            ))}
          </select>

          {/* Session Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Types</option>
            <option value="Practice">Practice</option>
            <option value="Qualifying">Qualifying</option>
            <option value="Race">Race</option>
            <option value="Hotlap">Hotlap</option>
            <option value="Testing">Testing</option>
          </select>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="date">Sort by Date</option>
              <option value="lapTime">Sort by Lap Time</option>
              <option value="laps">Sort by Lap Count</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
              title={`Toggle sort order (${sortOrder})`}
            >
              <ArrowUpDown size={15} />
            </button>
          </div>
        </div>

        {/* Active filter count & clear */}
        {(selectedTrack || selectedCar || selectedType || searchQuery) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
            <span>
              Showing <strong>{sessions.length}</strong> matching sessions
            </span>
            <button
              onClick={handleResetFilters}
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Sessions Display (Table or Grid) */}
      {sessions.length === 0 ? (
        <div className="p-12 text-center bg-[#0e1526] rounded-2xl border border-slate-800">
          <Timer size={36} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white">No sessions found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filter criteria, or import a new session.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={handleResetFilters}
          >
            Clear Filters
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-[#0e1526] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Circuit</th>
                  <th className="py-3 px-4">Car</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-center">Laps</th>
                  <th className="py-3 px-4 text-right">Best Lap</th>
                  <th className="py-3 px-4 text-right">Avg Lap</th>
                  <th className="py-3 px-4">Conditions</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sessions.map(s => {
                  const track = TrackService.getById(s.trackId);
                  const car = CarService.getById(s.carId);
                  return (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/sessions/${s.id}`)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <Flag size={14} className="text-slate-500" />
                        <span>{track?.name || s.trackId}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {car?.manufacturer} {car?.model}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {formatSessionDate(s.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge sessionType={s.type}>{s.type}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {s.totalLaps}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-400">
                        {formatLapTime(s.bestLapTime)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        {formatLapTime(s.avgLapTime)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <CloudSun size={13} className="text-amber-400" />
                          <span>
                            {s.conditions.weather} {s.conditions.airTemp}°C
                          </span>
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map(s => {
            const track = TrackService.getById(s.trackId);
            const car = CarService.getById(s.carId);
            return (
              <div
                key={s.id}
                onClick={() => navigate(`/sessions/${s.id}`)}
                className="bg-[#0e1526] rounded-xl border border-slate-800 p-5 shadow-lg hover:border-slate-700 cursor-pointer transition-all duration-150 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Badge sessionType={s.type}>{s.type}</Badge>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatSessionDate(s.date)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-3 group-hover:text-cyan-400 transition-colors">
                    {track?.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {car?.manufacturer} {car?.model}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 bg-slate-900/80 rounded-lg p-3 border border-slate-800/80">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Best Lap
                      </span>
                      <span className="text-base font-black text-cyan-400 telemetry-mono">
                        {formatLapTime(s.bestLapTime)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Laps / Time
                      </span>
                      <span className="text-xs font-semibold text-slate-300 telemetry-mono">
                        {s.totalLaps} laps ({formatDrivingDuration(s.drivingTimeMinutes)})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Track: {s.conditions.gripLevel}% Grip</span>
                  <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

