import React, { useState } from 'react';
import { Settings, Shield, User, Database, RotateCcw, Check, Save } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { Driver } from '../../types';
import { Button } from '../../components/ui/Button';

export const SettingsPage: React.FC = () => {
  const [driver, setDriver] = useState<Driver>(() => StorageService.getDriver());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveDriver(driver);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all telemetry data, sessions and goals back to default demo records?'
      )
    ) {
      StorageService.resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-wider uppercase flex items-center gap-2">
          <Settings size={24} className="text-cyan-400" />
          Telemetry System Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure sim driver credentials, telemetry measurement units, and local database storage.
        </p>
      </div>

      {/* Driver Profile Section */}
      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <User size={18} className="text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Sim Racing Driver Profile
          </h3>
        </div>

        <form onSubmit={handleSaveDriver} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">
                Driver Name
              </label>
              <input
                type="text"
                value={driver.name}
                onChange={e => setDriver({ ...driver, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">
                Racing Team / Organization
              </label>
              <input
                type="text"
                value={driver.team}
                onChange={e => setDriver({ ...driver, team: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">
                Safety Rating
              </label>
              <input
                type="text"
                value={driver.safetyRating}
                onChange={e =>
                  setDriver({ ...driver, safetyRating: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">
                Driver iRating / Elo
              </label>
              <input
                type="number"
                value={driver.irating}
                onChange={e =>
                  setDriver({ ...driver, irating: Number(e.target.value) })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">
                Country
              </label>
              <input
                type="text"
                value={driver.country}
                onChange={e =>
                  setDriver({ ...driver, country: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {savedSuccess ? (
              <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <Check size={14} /> Profile updated successfully!
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                Changes persist across browser sessions.
              </span>
            )}

            <Button type="submit" variant="primary" size="sm" icon={Save}>
              Save Profile
            </Button>
          </div>
        </form>
      </div>

      {/* Measurement Units */}
      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Telemetry Units
        </h3>
        <p className="text-xs text-slate-400">
          Select standard motorsport metric or imperial telemetry display formats:
        </p>

        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="unit"
              checked={units === 'metric'}
              onChange={() => setUnits('metric')}
              className="accent-cyan-500"
            />
            <span className="text-slate-200 font-semibold">
              Metric (km/h, meters, °C)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="unit"
              checked={units === 'imperial'}
              onChange={() => setUnits('imperial')}
              className="accent-cyan-500"
            />
            <span className="text-slate-200 font-semibold">
              Imperial (mph, feet, °F)
            </span>
          </label>
        </div>
      </div>

      {/* Database Management */}
      <div className="bg-[#0e1526] rounded-2xl border border-rose-500/20 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-rose-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Telemetry Database Management
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          ApexTelemetry saves all stints, custom CSV imports, and driver goals into browser LocalStorage. If you want to purge custom edits and restore the realistic default motorsport dataset, click below.
        </p>

        <div className="pt-2">
          <Button
            variant="danger"
            size="sm"
            icon={RotateCcw}
            onClick={handleResetData}
          >
            Reset Database to Demo Factory Data
          </Button>
        </div>
      </div>
    </div>
  );
};

