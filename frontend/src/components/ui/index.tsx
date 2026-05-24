import React, { forwardRef } from 'react';
import { Loader2, X } from 'lucide-react';

// ── Button ────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:   'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 active:bg-indigo-800',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300',
  ghost:     'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
  danger:    'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-200',
  outline:   'border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100',
};
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary', size = 'md', loading, leftIcon, rightIcon,
  fullWidth, className = '', children, disabled, ...props
}, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={[
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none',
      variantStyles[variant],
      sizeStyles[size],
      fullWidth ? 'w-full' : '',
      className,
    ].join(' ')}
    {...props}
  >
    {loading ? <Loader2 size={14} className="animate-spin" /> : leftIcon}
    {children}
    {!loading && rightIcon}
  </button>
));
Button.displayName = 'Button';

// ── Input ─────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, hint, leftAddon, rightAddon, className = '', ...props
}, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {props.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <div className="relative">
      {leftAddon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          {leftAddon}
        </div>
      )}
      <input
        ref={ref}
        className={[
          'block w-full rounded-xl border text-sm transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400',
          error ? 'border-red-400 focus:ring-red-400' : '',
          leftAddon ? 'pl-10' : 'pl-3.5',
          rightAddon ? 'pr-10' : 'pr-3.5',
          'py-2.5',
          className,
        ].join(' ')}
     
        {...props}
      />
      {rightAddon && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {rightAddon}
        </div>
      )}
    </div>
    {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
  </div>
));
Input.displayName = 'Input';

// ── Textarea ──────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label, error, hint, className = '', ...props
}, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {props.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <textarea
      ref={ref}
      className={[
        'block w-full rounded-xl border text-sm transition-all duration-150 resize-none',
        'focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400',
        error ? 'border-red-400' : '',
        'px-3.5 py-2.5',
        className,
      ].join(' ')}
     
      {...props}
    />
    {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

// ── Select ────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label, error, options, className = '', ...props
}, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {props.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <select
      ref={ref}
      className={[
        'block w-full rounded-xl border text-sm transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400',
        error ? 'border-red-400' : '',
        'px-3.5 py-2.5',
        className,
      ].join(' ')}
     
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
  </div>
));
Select.displayName = 'Select';

// ── Badge ─────────────────────────────────────
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-600 border-slate-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger:  'bg-red-50 text-red-600 border-red-200',
  info:    'bg-blue-50 text-blue-700 border-blue-200',
  purple:  'bg-violet-50 text-violet-700 border-violet-200',
};

export function Badge({ children, variant = 'default', className = '' }: {
  children: React.ReactNode; variant?: BadgeVariant; className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${badgeVariants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ── Spinner ───────────────────────────────────
export function Spinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin text-indigo-600 ${className}`} />;
}

// ── Card ──────────────────────────────────────
export function Card({ children, className = '', hover = false }: {
  children: React.ReactNode; className?: string; hover?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''} ${className}`}>
      {children}
    </div>
  );
}

// ── Modal ─────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const modalSizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${modalSizes[size]} overflow-hidden`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ── Avatar ────────────────────────────────────
export function Avatar({ name, src, size = 'md' }: {
  name: string; src?: string | null; size?: 'sm' | 'md' | 'lg';
}) {
  const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  if (src) return <img src={src} alt={name} className={`${sizeMap[size]} rounded-full object-cover`} />;
  return (
    <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ── ProgressBar ───────────────────────────────
export function ProgressBar({ value, showLabel = false, color = 'indigo', size = 'md' }: {
  value: number; showLabel?: boolean; color?: 'indigo' | 'emerald' | 'amber' | 'rose';
  size?: 'sm' | 'md' | 'lg';
}) {
  const colorMap = { indigo: 'bg-indigo-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', rose: 'bg-rose-500' };
  const sizeMap = { sm: 'h-1', md: 'h-1.5', lg: 'h-2.5' };
  const pct = Math.min(Math.max(value, 0), 100);
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-500">{pct}% funded</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeMap[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorMap[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode; title: string; description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-slate-300 mb-4">{icon}</div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      {description && <p className="text-sm max-w-xs mb-5">{description}</p>}
      {action}
    </div>
  );
}

// ── PageLoader ────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={28} />
    </div>
  );
}
