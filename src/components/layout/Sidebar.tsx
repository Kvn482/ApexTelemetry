import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Timer,
  Flag,
  Car,
  TrendingUp,
  GitCompare,
  Target,
  Upload,
  Settings,
  Activity,
  Shield,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';

const NAV_ITEMS = [
  { label: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'Sessions', path: '/sessions', icon: Timer },
  { label: 'Tracks', path: '/tracks', icon: Flag },
  { label: 'Cars', path: '/cars', icon: Car },
  { label: 'Progress', path: '/progress', icon: TrendingUp },
  { label: 'Comparisons', path: '/compare', icon: GitCompare },
  { label: 'Goals', path: '/goals', icon: Target },
  { label: 'Import Telemetry', path: '/import', icon: Upload },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const driver = StorageService.getDriver();

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="px-6 py-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 glow-cyan">
              <Activity size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                Apex<span className="text-cyan-400">Telemetry</span>
              </h1>
              <p className="text-[10px] tracking-wide text-slate-400 uppercase font-medium">
                Driver Performance & Race Analysis
              </p>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`
                }
              >
                <Icon size={16} className="flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Driver Profile Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0d1424]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-xs uppercase">
                {driver.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0d1424]" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{driver.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{driver.team}</p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] bg-slate-900/90 rounded-md px-2.5 py-1.5 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield size={12} className="text-cyan-400" />
            <span>Safety:</span>
            <span className="text-white font-semibold telemetry-mono">{driver.safetyRating}</span>
          </div>
          <div className="text-emerald-400 font-semibold telemetry-mono">
            {driver.status}
          </div>
        </div>
      </div>
    </aside>
  );
};
