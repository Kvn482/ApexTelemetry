import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}) => {
  let variantStyles = '';

  switch (variant) {
    case 'primary':
      variantStyles =
        'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-md shadow-cyan-500/20 active:scale-[0.98]';
      break;
    case 'secondary':
      variantStyles =
        'bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium border border-slate-700 active:scale-[0.98]';
      break;
    case 'outline':
      variantStyles =
        'bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700/80 hover:border-slate-600 active:scale-[0.98]';
      break;
    case 'ghost':
      variantStyles =
        'bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white';
      break;
    case 'danger':
      variantStyles =
        'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30';
      break;
  }

  const sizeStyles =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs rounded-lg'
      : size === 'lg'
      ? 'px-5 py-2.5 text-sm rounded-xl'
      : 'px-4 py-2 text-xs font-medium rounded-lg';

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
    </button>
  );
};
