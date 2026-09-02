import React from 'react';
import { AlertTriangle, Info, CheckCircle2, TrendingUp, Compass } from 'lucide-react';
import { EngineerInsight } from '../../types';

interface EngineerInsightCardProps {
  insight: EngineerInsight;
  onFocusCorner?: (distance: number) => void;
}

export const EngineerInsightCard: React.FC<EngineerInsightCardProps> = ({
  insight,
  onFocusCorner,
}) => {
  const getIcon = () => {
    switch (insight.severity) {
      case 'critical':
        return <AlertTriangle size={18} className="text-rose-400" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-amber-400" />;
      case 'positive':
        return <CheckCircle2 size={18} className="text-emerald-400" />;
      default:
        return <Info size={18} className="text-cyan-400" />;
    }
  };

  const getBorderColor = () => {
    switch (insight.severity) {
      case 'critical':
        return 'border-rose-500/40 bg-rose-950/10';
      case 'warning':
        return 'border-amber-500/40 bg-amber-950/10';
      case 'positive':
        return 'border-emerald-500/40 bg-emerald-950/10';
      default:
        return 'border-cyan-500/30 bg-cyan-950/10';
    }
  };

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-150 hover:border-slate-700 ${getBorderColor()}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-white">
                {insight.cornerName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                @{insight.distanceMeters}m
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-100 mt-0.5">
              {insight.title}
            </h4>
          </div>
        </div>

        {insight.potentialGainSec > 0 && (
          <div className="flex-shrink-0 bg-emerald-500/15 border border-emerald-500/30 rounded-lg px-2.5 py-1 text-right">
            <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold block">
              Potential Gain
            </span>
            <span className="text-xs font-black text-emerald-300 telemetry-mono">
              +{insight.potentialGainSec}s
            </span>
          </div>
        )}
      </div>

      <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
        {insight.observation}
      </p>

      {/* Recommendation box */}
      <div className="mt-3 bg-slate-900/80 rounded-lg p-3 border border-slate-800/80 text-xs flex items-start gap-2">
        <TrendingUp size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-bold text-cyan-400 block mb-0.5">
            Engineer Recommendation:
          </span>
          <p className="text-slate-300">{insight.recommendation}</p>
        </div>
      </div>

      {/* Footer comparison pill */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            You:{' '}
            <strong className="text-white font-mono">
              {insight.userValue}
              {insight.unit}
            </strong>
          </span>
          <span>
            Ref:{' '}
            <strong className="text-amber-400 font-mono">
              {insight.refValue}
              {insight.unit}
            </strong>
          </span>
        </div>

        {onFocusCorner && insight.distanceMeters > 0 && (
          <button
            onClick={() => onFocusCorner(insight.distanceMeters)}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
          >
            <Compass size={12} />
            <span>Inspect on Map</span>
          </button>
        )}
      </div>
    </div>
  );
};
