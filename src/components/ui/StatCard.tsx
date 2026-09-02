import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  accentColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = '#06b6d4',
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-[#0f172a]/90 border border-slate-800/80 p-5 shadow-lg backdrop-blur transition-all duration-200 hover:border-slate-700/80 ${className}`}
    >
      {/* Top accent glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-white telemetry-mono">
              {value}
            </h3>
            {trend && (
              <span
                className={`inline-flex items-center text-xs font-medium ${
                  trend.positive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className="rounded-lg p-2.5 bg-slate-900/80 border border-slate-800 text-slate-300"
            style={{ color: accentColor }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
};
