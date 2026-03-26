import React from 'react';
import clsx from 'clsx';

export const AppButton = ({
  children,
  variant = 'primary',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  ...rest
}) => {
  const baseStyle = 'px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
  const variants = {
    primary: 'bg-white text-black hover:bg-gray-200 shadow-lg hover:shadow-xl',
    secondary: 'bg-zinc-800/50 text-white backdrop-blur-md border border-zinc-700 hover:bg-zinc-700/50',
    outline: 'border border-zinc-600 text-zinc-300 hover:border-white hover:text-white',
    ghost: 'text-zinc-400 hover:text-white',
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={clsx(baseStyle, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
};

export const SectionHeading = ({ children, align = 'center', eyebrow }) => (
  <div className={clsx('mb-8 sm:mb-12 text-center', align === 'left' && 'text-left')}>
    {eyebrow && (
      <span className="inline-block py-1 px-3 rounded-full border border-lime-500/30 text-lime-400 text-xs font-bold tracking-widest uppercase mb-3 sm:mb-4">
        {eyebrow}
      </span>
    )}
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
      {children}
    </h2>
  </div>
);

export const GlassCard = ({ children, className = '', ...props }) => (
  <div className={clsx('bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl hover:border-zinc-600 transition-colors duration-500', className)} {...props}>
    {children}
  </div>
);

export const Pill = ({ children, className = '' }) => (
  <span className={clsx('inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900/50 px-3 py-1 text-xs font-medium uppercase tracking-wide', className)}>
    {children}
  </span>
);
