import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { SessionService } from '../../services/sessionService';
import { MOCK_TRACKS } from '../../data/mockTracks';
import { MOCK_CARS } from '../../data/mockCars';
import { SessionType, WeatherType } from '../../types';
import { parseLapTimeToSeconds } from '../../utils/formatters';

export const MainLayout: React.FC = () => {
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [trackId, setTrackId] = useState(MOCK_TRACKS[0].id);
  const [carId, setCarId] = useState(MOCK_CARS[0].id);
  const [sessionType, setSessionType] = useState<SessionType>('Practice');
  const [bestLapStr, setBestLapStr] = useState('1:44.250');
  const [totalLaps, setTotalLaps] = useState(12);
  const [drivingMinutes, setDrivingMinutes] = useState(35);
  const [weather, setWeather] = useState<WeatherType>('Sunny');
  const [notes, setNotes] = useState('');

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const lapSeconds = parseLapTimeToSeconds(bestLapStr) || 104.25;

    SessionService.create({
      trackId,
      carId,
      driverId: 'driver-kevin',
      date: new Date().toISOString(),
      type: sessionType,
      bestLapTime: lapSeconds,
      avgLapTime: parseFloat((lapSeconds + 0.85).toFixed(3)),
      totalLaps: Number(totalLaps) || 10,
      drivingTimeMinutes: Number(drivingMinutes) || 30,
      conditions: {
        airTemp: 24,
        trackTemp: 38,
        weather,
        gripLevel: 98,
        windSpeed: 10,
      },
      notes,
      laps: [],
    });

    setIsNewSessionOpen(false);
    window.dispatchEvent(new CustomEvent('session-created'));
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex text-slate-100 antialiased font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenNewSession={() => setIsNewSessionOpen(true)} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* New Session Modal */}
      <Modal
        isOpen={isNewSessionOpen}
        onClose={() => setIsNewSessionOpen(false)}
        title="Record New Session"
        subtitle="Log an on-track training or race session"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">Circuit</label>
              <select
                value={trackId}
                onChange={e => setTrackId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none"
              >
                {MOCK_TRACKS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">Car</label>
              <select
                value={carId}
                onChange={e => setCarId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none"
              >
                {MOCK_CARS.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.manufacturer} {c.model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">Session Type</label>
              <select
                value={sessionType}
                onChange={e => setSessionType(e.target.value as SessionType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Practice">Practice</option>
                <option value="Qualifying">Qualifying</option>
                <option value="Race">Race</option>
                <option value="Hotlap">Hotlap</option>
                <option value="Testing">Testing</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">Conditions</label>
              <select
                value={weather}
                onChange={e => setWeather(e.target.value as WeatherType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Sunny">Sunny (27°C / 42°C Track)</option>
                <option value="Dry">Dry / Mild (22°C)</option>
                <option value="Overcast">Overcast (19°C)</option>
                <option value="Damp">Damp (17°C)</option>
                <option value="Wet">Wet (15°C)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">Best Lap Time</label>
              <input
                type="text"
                placeholder="1:44.102"
                value={bestLapStr}
                onChange={e => setBestLapStr(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white telemetry-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">Total Laps</label>
              <input
                type="number"
                value={totalLaps}
                onChange={e => setTotalLaps(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white telemetry-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">Time (Minutes)</label>
              <input
                type="number"
                value={drivingMinutes}
                onChange={e => setDrivingMinutes(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white telemetry-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold uppercase">Engineer Notes</label>
            <textarea
              rows={3}
              placeholder="Aero balance, tire pressures, corner feedback..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewSessionOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Session
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
