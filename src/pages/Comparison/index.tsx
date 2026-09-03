import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
  GitCompare,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Bot,
  Zap,
  Gauge,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { SessionService } from '../../services/sessionService';
import { TrackService } from '../../services/trackService';
import { CarService } from '../../services/carService';
import { getLapTelemetry } from '../../services/telemetryService';
import { ComparisonService } from '../../services/comparisonService';
import { EngineerService } from '../../services/engineerService';
import { ComparisonCharts } from '../../components/comparison/ComparisonCharts';
import { EngineerInsightCard } from '../../components/engineer/EngineerInsightCard';
import { TrackMap } from '../../components/telemetry/TrackMap';
import { Badge } from '../../components/ui/Badge';
import { formatLapTime, formatDelta, formatSectorTime } from '../../utils/formatters';

export const ComparisonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const allSessions = SessionService.getAll();

  if (allSessions.length === 0) {
    return (
      <div className="p-12 text-center bg-[#0e1526] rounded-2xl border border-slate-800 max-w-lg mx-auto mt-12 space-y-4">
        <GitCompare size={36} className="mx-auto text-slate-600" />
        <h3 className="text-lg font-bold text-white uppercase tracking-wide">No Sessions to Compare</h3>
        <p className="text-xs text-slate-400">
          You need at least one recorded session to compare laps and generate race engineer delta insights.
        </p>
        <Button variant="primary" size="md" onClick={() => navigate('/import')}>
          Import Telemetry
        </Button>
      </div>
    );
  }

  const initialSessionA = searchParams.get('sessionA') || allSessions[0]?.id || '';
  const initialLapA = parseInt(searchParams.get('lapA') || '1', 10);

  // Default Lap B: Reference session or previous baseline
  const initialSessionB =
    searchParams.get('sessionB') ||
    allSessions.find(s => s.id !== initialSessionA)?.id ||
    allSessions[1]?.id ||
    initialSessionA;
  const initialLapB = parseInt(searchParams.get('lapB') || '1', 10);

  const [sessionAId, setSessionAId] = useState(initialSessionA);
  const [lapANum, setLapANum] = useState(initialLapA);

  const [sessionBId, setSessionBId] = useState(initialSessionB);
  const [lapBNum, setLapBNum] = useState(initialLapB);

  const [hoverDist, setHoverDist] = useState<number | undefined>(undefined);

  const sessionA = SessionService.getById(sessionAId) || allSessions[0];
  const sessionB = SessionService.getById(sessionBId) || allSessions[1] || allSessions[0];

  const trackA = TrackService.getById(sessionA.trackId) || TrackService.getAll()[0];
  const carA = CarService.getById(sessionA.carId) || CarService.getAll()[0];
  const carB = CarService.getById(sessionB.carId) || CarService.getAll()[0];

  const lapA = useMemo(() => {
    return (
      sessionA.laps.find(l => l.lapNumber === lapANum) ||
      sessionA.laps[0] || {
        id: 'a',
        lapNumber: 1,
        lapTime: sessionA.bestLapTime,
        formattedTime: formatLapTime(sessionA.bestLapTime),
        sectors: [
          { sectorNumber: 1, time: 34.3 },
          { sectorNumber: 2, time: 38.5 },
          { sectorNumber: 3, time: 31.3 },
        ],
        topSpeed: 280,
        avgSpeed: 183,
        isValid: true,
      }
    );
  }, [sessionA, lapANum]);

  const lapB = useMemo(() => {
    return (
      sessionB.laps.find(l => l.lapNumber === lapBNum) ||
      sessionB.laps[0] || {
        id: 'b',
        lapNumber: 1,
        lapTime: sessionB.bestLapTime,
        formattedTime: formatLapTime(sessionB.bestLapTime),
        sectors: [
          { sectorNumber: 1, time: 34.1 },
          { sectorNumber: 2, time: 38.2 },
          { sectorNumber: 3, time: 31.4 },
        ],
        topSpeed: 282,
        avgSpeed: 185,
        isValid: true,
      }
    );
  }, [sessionB, lapBNum]);

  // Retrieve or generate telemetry for both laps
  const telemetryA = useMemo(() => {
    if (lapA?.telemetry && lapA.telemetry.length > 0) {
      return lapA.telemetry;
    }
    return getLapTelemetry(trackA.id, lapA.lapTime, false, lapA.lapNumber * 0.1);
  }, [trackA.id, lapA]);

  const telemetryB = useMemo(() => {
    if (lapB?.telemetry && lapB.telemetry.length > 0) {
      return lapB.telemetry;
    }
    return getLapTelemetry(trackA.id, lapB.lapTime, true, lapB.lapNumber * 0.1);
  }, [trackA.id, lapB]);

  // Align traces & calculate continuous delta
  const alignedComparison = useMemo(() => {
    return ComparisonService.alignLaps(telemetryA, telemetryB, lapA.lapTime, lapB.lapTime);
  }, [telemetryA, telemetryB, lapA.lapTime, lapB.lapTime]);

  // Deterministic Race Engineer Insights
  const engineerInsights = useMemo(() => {
    return EngineerService.generateInsights(
      trackA,
      alignedComparison,
      lapA.lapTime,
      lapB.lapTime
    );
  }, [trackA, alignedComparison, lapA.lapTime, lapB.lapTime]);

  const totalDelta = parseFloat((lapA.lapTime - lapB.lapTime).toFixed(3));
  const potentialTotalGain = engineerInsights.reduce((acc, i) => acc + i.potentialGainSec, 0);

  const progressRatio = hoverDist ? hoverDist / trackA.lengthMeters : 0.5;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wider uppercase flex items-center gap-2">
            <GitCompare size={24} className="text-cyan-400" />
            Lap Comparison & Delta Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyze time gains and losses down to the meter against your personal best or reference stint.
          </p>
        </div>
      </div>

      {/* Dual Lap Selection Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lap A Card (Driver Lap) */}
        <div className="bg-[#0e1526] rounded-2xl border-2 border-cyan-500/40 p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-500/30">
              Lap A (Primary)
            </span>
            <span className="text-xs text-slate-400 font-mono">Kevin Vance</span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-white telemetry-mono">
              {lapA.formattedTime}
            </h3>
            <span className="text-xs font-semibold text-slate-300">
              Top: {lapA.topSpeed} km/h
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-0.5">
            {trackA.name} • {carA.manufacturer} {carA.model}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Session
              </label>
              <select
                value={sessionAId}
                onChange={e => {
                  setSessionAId(e.target.value);
                  setLapANum(1);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {allSessions.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.type} - {formatLapTime(s.bestLapTime)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Lap #
              </label>
              <select
                value={lapANum}
                onChange={e => setLapANum(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white telemetry-mono focus:outline-none focus:border-cyan-500"
              >
                {sessionA.laps.map(l => (
                  <option key={l.id} value={l.lapNumber}>
                    Lap {l.lapNumber} ({l.formattedTime})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lap B Card (Reference Lap) */}
        <div className="bg-[#0e1526] rounded-2xl border-2 border-amber-500/40 p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
              Lap B (Reference)
            </span>
            <span className="text-xs text-slate-400 font-mono">Reference Stint</span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-amber-400 telemetry-mono">
              {lapB.formattedTime}
            </h3>
            <span className="text-xs font-semibold text-slate-300">
              Top: {lapB.topSpeed} km/h
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-0.5">
            {trackA.name} • {carB.manufacturer} {carB.model}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Session
              </label>
              <select
                value={sessionBId}
                onChange={e => {
                  setSessionBId(e.target.value);
                  setLapBNum(1);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {allSessions.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.type} - {formatLapTime(s.bestLapTime)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Lap #
              </label>
              <select
                value={lapBNum}
                onChange={e => setLapBNum(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white telemetry-mono focus:outline-none focus:border-cyan-500"
              >
                {sessionB.laps.map(l => (
                  <option key={l.id} value={l.lapNumber}>
                    Lap {l.lapNumber} ({l.formattedTime})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Delta KPI Banner & Sector Micro-Deltas */}
      <div className="bg-[#0b111e] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <TrendingDown
              size={24}
              className={totalDelta > 0 ? 'text-rose-400' : 'text-emerald-400'}
            />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Overall Lap Delta
            </span>
            <h3
              className={`text-2xl font-black telemetry-mono mt-0.5 ${
                totalDelta > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {formatDelta(totalDelta)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {totalDelta > 0
                ? 'Lap A is slower than reference'
                : 'Lap A is faster than reference'}
            </p>
          </div>
        </div>

        {/* Sector Comparison Table */}
        <div className="flex items-center gap-6 text-center text-xs">
          {[1, 2, 3].map(secNum => {
            const timeA = lapA.sectors[secNum - 1]?.time || 0;
            const timeB = lapB.sectors[secNum - 1]?.time || 0;
            const secDelta = parseFloat((timeA - timeB).toFixed(3));
            return (
              <div key={secNum} className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80 min-w-[110px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Sector {secNum}
                </span>
                <p className="text-sm font-bold text-white telemetry-mono mt-1">
                  {formatSectorTime(timeA)}s
                </p>
                <span
                  className={`text-xs font-black telemetry-mono block mt-0.5 ${
                    secDelta > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {formatDelta(secDelta)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row: Delta Continuous Chart & Track Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {/* Comprehensive Comparison Charts Suite (Delta, Speed, Throttle, Brake, Gear, RPM, Steering) */}
          <ComparisonCharts
            data={alignedComparison}
            labelA={`Lap ${lapA.lapNumber}`}
            labelB={`Ref Lap ${lapB.lapNumber}`}
            overallDelta={totalDelta}
            currentDistance={hoverDist}
            onHoverDistance={(dist) => setHoverDist(dist)}
            sectorBoundaries={trackA.sectorBoundaries}
          />
        </div>

        {/* Right Column: Track Map & Inspector */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <TrackMap
            track={trackA}
            progress={progressRatio}
            showCorners={true}
            onSelectCorner={(cNum) => {
              const corner = trackA.corners.find(c => c.number === cNum);
              if (corner) setHoverDist(corner.distance);
            }}
            className="h-[320px]"
          />

          {/* Theoretical Lap Improvement Card */}
          <div className="bg-gradient-to-br from-[#0e1526] to-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Sparkles size={16} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Theoretical Optimal Pace
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Eliminating braking and apex hesitation identified by telemetry would yield:
            </p>

            <div className="mt-4 bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Potential Gain:</span>
              <span className="text-base font-black text-emerald-400 telemetry-mono">
                +{potentialTotalGain.toFixed(2)}s
              </span>
            </div>

            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Theoretical Best:</span>
              <span className="text-cyan-400 font-mono font-bold">
                {formatLapTime(lapA.lapTime - potentialTotalGain)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 18: Race Engineer Insights */}
      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                Race Engineer Diagnostic Insights
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic telemetry analysis pinpointing corner-by-corner time loss and driver recommendations.
              </p>
            </div>
          </div>

          <Badge variant="cyan">{engineerInsights.length} Observations</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {engineerInsights.map(insight => (
            <EngineerInsightCard
              key={insight.id}
              insight={insight}
              onFocusCorner={(dist) => setHoverDist(dist)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

