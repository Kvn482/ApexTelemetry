import React from 'react';
import { SessionType } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'cyan' | 'green' | 'red' | 'amber' | 'purple' | 'slate';
  sessionType?: SessionType;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  sessionType,
  className = '',
  size = 'sm',
}) => {
  let colorStyles = 'bg-slate-800 text-slate-300 border-slate-700';

  if (sessionType) {
    switch (sessionType) {
      case 'Race':
        colorStyles = 'bg-red-500/10 text-red-400 border-red-500/30';
        break;
      case 'Qualifying':
        colorStyles = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
        break;
      case 'Practice':
        colorStyles = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
        break;
      case 'Hotlap':
        colorStyles = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        break;
      case 'Testing':
        colorStyles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        break;
    }
  } else if (variant) {
    switch (variant) {
      case 'cyan':
        colorStyles = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
        break;
      case 'green':
        colorStyles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        break;
      case 'red':
        colorStyles = 'bg-red-500/10 text-red-400 border-red-500/30';
        break;
      case 'amber':
        colorStyles = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        break;
      case 'purple':
        colorStyles = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
        break;
      case 'slate':
        colorStyles = 'bg-slate-800/80 text-slate-400 border-slate-700/60';
        break;
      default:
        colorStyles = 'bg-slate-800 text-slate-300 border-slate-700';
    }
  }

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border tracking-wide uppercase ${sizeStyles} ${colorStyles} ${className}`}
    >
      {children}
    </span>
  );
};
