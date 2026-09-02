import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Download,
  RotateCcw,
} from 'lucide-react';
import { TelemetryParser } from '../../services/telemetryParser';
import { SessionService } from '../../services/sessionService';
import { TrackService } from '../../services/trackService';
import { CarService } from '../../services/carService';
import { SAMPLE_SEBRING_CSV } from '../../data/sampleCsv';
import { ColumnMapping, TelemetryPoint } from '../../types';
import { Button } from '../../components/ui/Button';
import { formatLapTime } from '../../utils/formatters';

export const ImportPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [rawCsvText, setRawCsvText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    distance: '',
    time: '',
    speed: '',
    rpm: '',
    gear: '',
    throttle: '',
    brake: '',
    steering: '',
  });

  // Session metadata to attach
  const [trackId, setTrackId] = useState('sebring');
  const [carId, setCarId] = useState('ferrari-296-gt3');
  const [sessionType, setSessionType] = useState<'Practice' | 'Qualifying' | 'Race' | 'Hotlap' | 'Testing'>('Testing');

  const tracks = TrackService.getAll();
  const cars = CarService.getAll();

  const [importedPoints, setImportedPoints] = useState<TelemetryPoint[] | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<string>('Standard CSV');

  const matchTrackFromName = (name?: string) => {
    if (!name) return;
    const lower = name.toLowerCase();
    const found = tracks.find(t => lower.includes(t.id) || lower.includes(t.name.toLowerCase().split(' ')[0]));
    if (found) setTrackId(found.id);
  };

  const matchCarFromName = (name?: string) => {
    if (!name) return;
    const lower = name.toLowerCase();
    const found = cars.find(c => lower.includes(c.manufacturer.toLowerCase()) || lower.includes(c.model.toLowerCase()));
    if (found) setCarId(found.id);
  };

  const handleProcessCsv = (text: string, name: string) => {
    setRawCsvText(text);
    setFileName(name);
    const parsed = TelemetryParser.parseCsv(text);

    if (parsed.headers.length === 0 || parsed.rows.length === 0) {
      alert('The CSV file does not contain valid tabular telemetry rows.');
      return;
    }

    setHeaders(parsed.headers);
    setRows(parsed.rows);
    setDetectedFormat(parsed.fileType === 'motec_csv' ? 'MoTeC i2 CSV Export' : 'Standard CSV');

    // Auto-select Track & Car if MoTeC metadata exists
    if (parsed.metadata.venue) matchTrackFromName(parsed.metadata.venue);
    if (parsed.metadata.vehicle) matchCarFromName(parsed.metadata.vehicle);

    // Auto-detect columns
    const detected = TelemetryParser.autoDetectMapping(parsed.headers);
    setMapping(detected);
    setStep('mapping');
  };

  const handleProcessBinaryLd = (buffer: ArrayBuffer, name: string) => {
    setFileName(name);
    const parsed = TelemetryParser.parseMotecLdBinary(buffer);

    setDetectedFormat('MoTeC .ld Binary Log');
    if (parsed.metadata.venue) matchTrackFromName(parsed.metadata.venue);
    if (parsed.metadata.vehicle) matchCarFromName(parsed.metadata.vehicle);

    if (parsed.directPoints && parsed.directPoints.length > 0) {
      setImportedPoints(parsed.directPoints);
      setHeaders(parsed.headers);
      setStep('mapping');
    } else {
      alert(
        'The MoTeC .ld binary was analyzed. For 100% telemetry channel precision across all custom ACC/iRacing setups, you can also export the lap directly from MoTeC i2 Pro via File -> Export Data (CSV).'
      );
      if (parsed.headers.length > 0) {
        setHeaders(parsed.headers);
        setStep('mapping');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.ld') || file.name.toLowerCase().endsWith('.ldx')) {
      const reader = new FileReader();
      reader.onload = event => {
        const buffer = event.target?.result as ArrayBuffer;
        handleProcessBinaryLd(buffer, file.name);
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = event => {
        const text = event.target?.result as string;
        handleProcessCsv(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.ld') || file.name.toLowerCase().endsWith('.ldx')) {
      const reader = new FileReader();
      reader.onload = event => {
        const buffer = event.target?.result as ArrayBuffer;
        handleProcessBinaryLd(buffer, file.name);
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = event => {
        const text = event.target?.result as string;
        handleProcessCsv(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = () => {
    handleProcessCsv(SAMPLE_SEBRING_CSV, 'sebring_ferrari296_fastlap.csv');
  };

  const validation = TelemetryParser.validateMapping(mapping);

  const handleCompleteImport = () => {
    let normalized: TelemetryPoint[];

    if (importedPoints && importedPoints.length > 0) {
      normalized = importedPoints;
    } else {
      if (!validation.isValid) {
        alert(`Please map all required columns: ${validation.missingFields.join(', ')}`);
        return;
      }
      normalized = TelemetryParser.normalize(rows, mapping);
    }

    const lastPoint = normalized[normalized.length - 1];
    const lapTime = lastPoint?.time || 104.102;

    const newSession = SessionService.create({
      trackId,
      carId,
      driverId: 'driver-kevin',
      date: new Date().toISOString(),
      type: sessionType,
      bestLapTime: lapTime,
      avgLapTime: parseFloat((lapTime + 0.5).toFixed(3)),
      totalLaps: 1,
      drivingTimeMinutes: Math.round(lapTime / 60) + 1,
      conditions: {
        airTemp: 26,
        trackTemp: 40,
        weather: 'Sunny',
        gripLevel: 98,
        windSpeed: 10,
      },
      notes: `Imported from CSV file: ${fileName} (${normalized.length} telemetry points logged)`,
      laps: [
        {
          id: 'imported-lap-1',
          lapNumber: 1,
          lapTime,
          formattedTime: formatLapTime(lapTime),
          delta: 0,
          topSpeed: Math.max(...normalized.map(p => p.speed)),
          avgSpeed: Math.round(
            (normalized[normalized.length - 1].distance / lapTime) * 3.6
          ),
          isValid: true,
          isSessionBest: true,
          sectors: [
            { sectorNumber: 1, time: parseFloat((lapTime * 0.33).toFixed(3)) },
            { sectorNumber: 2, time: parseFloat((lapTime * 0.37).toFixed(3)) },
            { sectorNumber: 3, time: parseFloat((lapTime * 0.30).toFixed(3)) },
          ],
          telemetry: normalized,
        },
      ],
    });

    navigate(`/analysis?sessionId=${newSession.id}&lapNumber=1`);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-wider uppercase flex items-center gap-2">
          <Upload size={24} className="text-cyan-400" />
          Import Telemetry Data
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ingest raw telemetry CSV logs from MoTeC, iRacing, Assetto Corsa, or custom telemetry loggers.
        </p>
      </div>

      {/* Pipeline Diagram (Section 10) */}
      <div className="bg-[#0e1526] rounded-xl border border-slate-800 p-4 shadow-lg flex items-center justify-between text-xs text-slate-400 overflow-x-auto">
        <div className={`flex items-center gap-2 font-bold ${step === 'upload' ? 'text-cyan-400' : 'text-slate-300'}`}>
          <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]">1</span>
          <span>Raw CSV File</span>
        </div>
        <ArrowRight size={14} className="text-slate-600" />
        <div className={`flex items-center gap-2 font-bold ${step === 'mapping' ? 'text-cyan-400' : 'text-slate-300'}`}>
          <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]">2</span>
          <span>Column Mapping</span>
        </div>
        <ArrowRight size={14} className="text-slate-600" />
        <div className={`flex items-center gap-2 font-bold ${step === 'preview' ? 'text-cyan-400' : 'text-slate-300'}`}>
          <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]">3</span>
          <span>Telemetry Normalizer</span>
        </div>
        <ArrowRight size={14} className="text-slate-600" />
        <div className="flex items-center gap-2 font-bold text-slate-500">
          <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]">4</span>
          <span>Session Storage</span>
        </div>
      </div>

      {/* Step 1: Upload / Dropzone */}
      {step === 'upload' && (
        <div className="space-y-6">
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-2xl p-12 text-center bg-[#0e1526]/50 hover:bg-[#0e1526] transition-all duration-200 cursor-pointer group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.ld,.ldx,text/csv"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-cyan-400 group-hover:scale-110 transition-transform">
              <Upload size={24} />
            </div>
            <h3 className="text-base font-bold text-white mt-4">
              Drag & Drop your Telemetry File here (.CSV or MoTeC .LD)
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto leading-relaxed">
              Supports <strong>MoTeC i2 Pro CSV Exports</strong>, <strong>MoTeC .ld Binary Files</strong>, ACC / iRacing logs, or any standard telemetry CSV containing speed, throttle, and brake.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 group-hover:bg-slate-700">
              <FileSpreadsheet size={15} />
              <span>Browse CSV or MoTeC .ld File</span>
            </div>
          </div>

          {/* Sample CSV Quick Loader */}
          <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400">
                <Sparkles size={16} />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Quick Test: Load Sample Telemetry Export
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Don't have a CSV file on hand? Click to instantly test the ingestion wizard with a genuine Sebring GT3 lap dataset.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleLoadSample}
            >
              Load Sample CSV
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Column Mapping & Metadata */}
      {step === 'mapping' && (
        <div className="space-y-6">
          <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Telemetry Column Mapping
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  File: <strong className="text-cyan-400 font-mono">{fileName}</strong> ({rows.length} data rows detected)
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={RotateCcw}
                onClick={() => setStep('upload')}
              >
                Choose Different File
              </Button>
            </div>

            {/* Session Association info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold uppercase">
                  Assign Circuit
                </label>
                <select
                  value={trackId}
                  onChange={e => setTrackId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  {tracks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold uppercase">
                  Assign Car
                </label>
                <select
                  value={carId}
                  onChange={e => setCarId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  {cars.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.manufacturer} {c.model}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold uppercase">
                  Session Type
                </label>
                <select
                  value={sessionType}
                  onChange={e => setSessionType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Practice">Practice</option>
                  <option value="Qualifying">Qualifying</option>
                  <option value="Race">Race</option>
                  <option value="Hotlap">Hotlap</option>
                  <option value="Testing">Testing</option>
                </select>
              </div>
            </div>

            {/* Channel Mapping Matrix */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-300 mb-3">
                Map CSV Columns to ApexTelemetry Channels:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { field: 'distance', label: 'Distance (meters)', required: true },
                  { field: 'speed', label: 'Speed (km/h)', required: true },
                  { field: 'throttle', label: 'Throttle (0-100%)', required: true },
                  { field: 'brake', label: 'Brake (0-100%)', required: true },
                  { field: 'time', label: 'Time Elapsed (sec)', required: false },
                  { field: 'rpm', label: 'Engine RPM', required: false },
                  { field: 'gear', label: 'Gear (1-6)', required: false },
                  { field: 'steering', label: 'Steering Angle (deg)', required: false },
                ].map(col => {
                  const currentMapped = mapping[col.field as keyof ColumnMapping];
                  return (
                    <div
                      key={col.field}
                      className="bg-slate-900/90 rounded-xl p-3 border border-slate-800"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-300">
                          {col.label}
                        </label>
                        {col.required && (
                          <span className="text-[10px] text-rose-400 font-bold uppercase">
                            Req
                          </span>
                        )}
                      </div>
                      <select
                        value={currentMapped}
                        onChange={e =>
                          setMapping({
                            ...mapping,
                            [col.field]: e.target.value,
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-cyan-400 font-mono focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">-- Select Header --</option>
                        {headers.map(h => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preview of first 5 rows */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">
                Raw CSV Data Preview (First 5 Rows):
              </h4>
              <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-800 p-2">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      {headers.map(h => (
                        <th key={h} className="p-2">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {rows.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        {headers.map(h => (
                          <td key={h} className="p-2">
                            {row[h]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Validation & Save Button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                {validation.isValid ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 size={15} /> All essential channels mapped! Ready to normalize.
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
                    <AlertTriangle size={15} /> Missing required channels: {validation.missingFields.join(', ')}
                  </span>
                )}
              </div>

              <Button
                variant="primary"
                size="md"
                disabled={!validation.isValid}
                onClick={handleCompleteImport}
              >
                Normalize & Save Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

