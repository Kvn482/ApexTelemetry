import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GitCompare, Share2 } from 'lucide-react';
import { SessionService } from '../../services/sessionService';
import { TrackService } from '../../services/trackService';
import { CarService } from '../../services/carService';
import { getLapTelemetry } from '../../services/telemetryService';
import { TrackMap } from '../../components/telemetry/TrackMap';
import { TelemetryHUD } from '../../components/telemetry/TelemetryHUD';
import { LapReplayer } from '../../components/telemetry/LapReplayer';
import { TelemetryCharts } from '../../components/telemetry/TelemetryCharts';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatLapTime, formatSessionDate } from '../../utils/formatters';

export const LapAnalysisPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const allSessions = SessionService.getAll();
  const defaultSessionId = allSessions[0]?.id || '';
  const sessionId = searchParams.get('sessionId') || defaultSessionId;

  const currentSession = SessionService.getById(sessionId) || allSessions[0];
  const lapNumberParam = parseInt(searchParams.get('lapNumber') || '1', 10);

  const [selectedLapNum, setSelectedLapNum] = useState<number>(lapNumberParam);
  const [currentTime, setCurrentTime] = useState<number>(0);

  if (!currentSession) {
    return (
      <div className="p-12 text-center bg-[#0e1526] rounded-2xl border border-slate-800 max-w-lg mx-auto mt-12 space-y-4">
        <h3 className="text-lg font-bold text-white uppercase tracking-wide">No Telemetry Sessions Yet</h3>
        <p className="text-xs text-slate-400">
          Upload a MoTeC (.ld) log or CSV telemetry export to view lap replays and telemetry curves on the circuit.
        </p>
        <Button variant="primary" size="md" onClick={() => navigate('/import')}>
          Import Telemetry File
        </Button>
      </div>
    );
  }

  // Sync state if URL changes
  useEffect(() => {
    if (lapNumberParam && lapNumberParam !== selectedLapNum) {
      setSelectedLapNum(lapNumberParam);
    }
  }, [lapNumberParam]);

  const track = TrackService.getById(currentSession?.trackId || 'sebring') || TrackService.getAll()[0];
  const car = CarService.getById(currentSession?.carId || 'ferrari-296-gt3') || CarService.getAll()[0];

  const currentLap = useMemo(() => {
    if (!currentSession || !currentSession.laps.length) {
      return {
        id: 'lap-1',
        lapNumber: 1,
        lapTime: currentSession?.bestLapTime || 104.102,
        formattedTime: formatLapTime(currentSession?.bestLapTime || 104.102),
        sectors: [
          { sectorNumber: 1, time: 34.2 },
          { sectorNumber: 2, time: 38.5 },
          { sectorNumber: 3, time: 31.4 },
        ],
        topSpeed: 278,
        avgSpeed: 184,
        isValid: true,
      };
    }
    return (
      currentSession.laps.find(l => l.lapNumber === selectedLapNum) ||
      currentSession.laps[0]
    );
  }, [currentSession, selectedLapNum]);

  // High density telemetry traces for this lap (use real imported data if present)
  const telemetry = useMemo(() => {
    if (currentLap?.telemetry && currentLap.telemetry.length > 0) {
      return currentLap.telemetry;
    }
    return getLapTelemetry(
      track.id,
      currentLap.lapTime,
      currentLap.lapNumber === 7, // seed variance
      currentLap.lapNumber * 0.15
    );
  }, [track.id, currentLap]);

  const totalTrackDistance = useMemo(() => {
    if (currentLap?.telemetry && currentLap.telemetry.length > 0) {
      const endDist = currentLap.telemetry[currentLap.telemetry.length - 1].distance;
      if (endDist > 500) return endDist;
    }
    return track.lengthMeters;
  }, [currentLap, track.lengthMeters]);

  // Active telemetry point corresponding to currentTime
  const activePoint = useMemo(() => {
    if (!telemetry.length) {
      return {
        distance: 0,
        time: 0,
        speed: 0,
        rpm: 0,
        gear: 1,
        throttle: 0,
        brake: 0,
        steering: 0,
      };
    }

    // Find point closest to currentTime
    let closest = telemetry[0];
    let minDiff = Infinity;

    for (let i = 0; i < telemetry.length; i++) {
      const diff = Math.abs(telemetry[i].time - currentTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = telemetry[i];
      }
    }

    return closest;
  }, [telemetry, currentTime]);

  // Progress along lap (0 to 1)
  const progressRatio = useMemo(() => {
    if (!totalTrackDistance || !activePoint) return 0;
    return Math.min(1, Math.max(0, activePoint.distance / totalTrackDistance));
  }, [activePoint, totalTrackDistance]);

  const handleHoverDistance = (distance: number) => {
    // Find point with matching distance and update time
    const matched = telemetry.find(p => p.distance >= distance);
    if (matched) {
      setCurrentTime(matched.time);
    }
  };

  const handleSelectLap = (lapNum: number) => {
    setSelectedLapNum(lapNum);
    setCurrentTime(0);
    setSearchParams({ sessionId: currentSession.id, lapNumber: lapNum.toString() });
  };

  const handleSelectSession = (newSessionId: string) => {
    const s = SessionService.getById(newSessionId);
    if (s) {
      setSelectedLapNum(1);
      setCurrentTime(0);
      setSearchParams({ sessionId: newSessionId, lapNumber: '1' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Lap Selector Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/sessions/${currentSession.id}`)}
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Back to Session"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-wider uppercase">
                Lap Telemetry Analysis
              </h1>
              <Badge variant="cyan">Lap #{currentLap.lapNumber}</Badge>
              {currentLap.isValid ? (
                <Badge variant="green">Valid</Badge>
              ) : (
                <Badge variant="red">Track Limits</Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {track.name} • {car.manufacturer} {car.model} • {formatSessionDate(currentSession.date)}
            </p>
          </div>
        </div>

        {/* Quick Selectors & Compare Button */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Session Switcher */}
          <select
            value={currentSession.id}
            onChange={e => handleSelectSession(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            {allSessions.map(s => (
              <option key={s.id} value={s.id}>
                {TrackService.getById(s.trackId)?.name.split(' ')[0]} - {formatSessionDate(s.date)} ({s.type})
              </option>
            ))}
          </select>

          {/* Lap Switcher */}
          <select
            value={selectedLapNum}
            onChange={e => handleSelectLap(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white telemetry-mono focus:outline-none focus:border-cyan-500"
          >
            {currentSession.laps.map(l => (
              <option key={l.id} value={l.lapNumber}>
                Lap {l.lapNumber} — {l.formattedTime} {l.isSessionBest ? '(PB)' : ''}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            icon={GitCompare}
            onClick={() =>
              navigate(
                `/compare?sessionA=${currentSession.id}&lapA=${selectedLapNum}`
              )
            }
          >
            Compare Lap
          </Button>
        </div>
      </div>

      {/* Row 1: SVG Track Map + Replayer & Cockpit HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive SVG Track Map */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <TrackMap
            track={track}
            progress={progressRatio}
            currentSpeed={activePoint.speed}
            className="h-[360px]"
            showCorners={true}
          />
        </div>

        {/* Right Column: Lap Replay Controls & Live HUD */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          {/* Telemetry Cockpit HUD */}
          <TelemetryHUD
            point={activePoint}
            totalDistance={totalTrackDistance}
            lapTimeSeconds={currentLap.lapTime}
          />

          {/* Lap Replayer Timeline Scrubber */}
          <LapReplayer
            lapTimeSeconds={currentLap.lapTime}
            totalDistance={totalTrackDistance}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
          />

          {/* Sector Times Card */}
          <div className="bg-[#0b111e] rounded-xl border border-slate-800 p-4 grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Sector 1
              </span>
              <p className="text-base font-black text-white telemetry-mono mt-0.5">
                {currentLap.sectors[0]?.time.toFixed(3)}s
              </p>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Sector 2
              </span>
              <p className="text-base font-black text-white telemetry-mono mt-0.5">
                {currentLap.sectors[1]?.time.toFixed(3)}s
              </p>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Sector 3
              </span>
              <p className="text-base font-black text-white telemetry-mono mt-0.5">
                {currentLap.sectors[2]?.time.toFixed(3)}s
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Synchronized Telemetry Multi-Charts Stack */}
      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Telemetry Channel Analysis
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hover across any trace to scrub telemetry needles and pinpoint the car position on the circuit.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/30">
            Cursor @ {activePoint.distance}m
          </span>
        </div>

        <TelemetryCharts
          telemetry={telemetry}
          currentDistance={activePoint.distance}
          onHoverDistance={handleHoverDistance}
          sectorBoundaries={track.sectorBoundaries}
        />
      </div>
    </div>
  );
};

