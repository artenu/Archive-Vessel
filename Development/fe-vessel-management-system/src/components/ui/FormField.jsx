import { cn } from '../../utils/cn'

export function FormField({ label, hint, error, className, labelClassName, children }) {
  return (
    <label className={cn('block space-y-1 text-left', className)}>
      <span className={cn('text-xs font-medium text-slate-600', labelClassName)}>{label}</span>
      {children}
      {error ? <span className="block text-xs font-medium text-red-600">{error}</span> : null}
      {hint ? <span className="block text-xs text-slate-500">{hint}</span> : null}
    </label>
  )
}

const fieldSizes = {
  compact: 'h-7 px-2 text-xs',
  sm: 'h-7 px-2 text-xs',
  md: 'h-8 px-2.5 text-sm',
}

export function TextInput({ className, size = 'compact', ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-md border border-slate-200 bg-white text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
        fieldSizes[size],
        className,
      )}
      {...props}
    />
  )
}

export function SelectInput({ className, children, size = 'compact', ...props }) {
  return (
    <select
      className={cn(
        'w-full rounded-md border border-slate-200 bg-white font-normal text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
        fieldSizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export const Input = TextInput
export const Select = SelectInput
