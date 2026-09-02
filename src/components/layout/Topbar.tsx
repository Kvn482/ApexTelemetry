import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, Plus, Sun, Gauge } from 'lucide-react';
import { Button } from '../ui/Button';

interface TopbarProps {
  onOpenNewSession?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenNewSession }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get readable page name
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Telemetry Overview';
    if (path.startsWith('/sessions')) return 'Session Analysis';
    if (path.startsWith('/tracks')) return 'Circuit Performance';
    if (path.startsWith('/cars')) return 'Vehicle Telemetry';
    if (path.startsWith('/progress')) return 'Driver Progress';
    if (path.startsWith('/compare')) return 'Lap Comparison';
    if (path.startsWith('/goals')) return 'Training Goals';
    if (path.startsWith('/import')) return 'Import Telemetry';
    if (path.startsWith('/settings')) return 'Telemetry Settings';
    return 'ApexTelemetry';
  };

  return (
    <header className="h-16 px-8 border-b border-slate-800/80 bg-[#0a0f1d]/80 backdrop-blur sticky top-0 z-20 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-bold text-white tracking-wide uppercase">
          {getPageTitle()}
        </h2>
        <span className="h-4 w-[1px] bg-slate-800 hidden sm:block" />
        <div className="hidden lg:flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800/80">
            <Sun size={13} className="text-amber-400" />
            <span>Sebring: <strong className="text-slate-200">27°C Track 42°C</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800/80">
            <Gauge size={13} className="text-cyan-400" />
            <span>Grip: <strong className="text-emerald-400">98% Optimum</strong></span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          icon={Upload}
          onClick={() => navigate('/import')}
        >
          Import CSV
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={onOpenNewSession || (() => navigate('/sessions?new=true'))}
        >
          New Session
        </Button>
      </div>
    </header>
  );
};
