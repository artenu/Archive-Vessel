import { cloneElement, isValidElement } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

const variants = {
  primary: 'border border-brand-700 bg-brand-600 text-white shadow-[0_1px_0_rgba(255,255,255,0.22)_inset,0_8px_16px_rgba(186,0,7,0.20)] hover:bg-brand-700 hover:shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_10px_20px_rgba(186,0,7,0.24)] active:translate-y-px active:shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_4px_10px_rgba(186,0,7,0.20)] focus-visible:ring-brand-600',
  secondary: 'border border-slate-300 bg-white text-slate-700 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_4px_10px_rgba(15,23,42,0.06)] hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950 active:translate-y-px active:shadow-[0_2px_6px_rgba(15,23,42,0.06)] focus-visible:ring-brand-600',
  ghost: 'border border-transparent bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-brand-600',
  danger: 'border border-brand-700 bg-brand-600 text-white shadow-[0_1px_0_rgba(255,255,255,0.22)_inset,0_8px_16px_rgba(186,0,7,0.20)] hover:bg-brand-700 focus-visible:ring-brand-500',
}

const sizes = {
  sm: 'h-7 gap-1 px-2 text-xs',
  compact: 'h-7 gap-1 px-2.5 text-xs',
  md: 'h-8 gap-1.5 px-3 text-xs',
  lg: 'h-8 gap-1.5 px-3 text-sm',
  icon: 'h-7 w-7 p-0',
  'icon-sm': 'h-6 w-6 p-0',
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'compact',
  icon: Icon,
  isLoading = false,
  asChild = false,
  type = 'button',
  ...props
}) {
  const classNames = cn(
    'inline-flex shrink-0 items-center justify-center rounded-md font-sans font-semibold leading-none tracking-[0] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none',
    variants[variant],
    sizes[size],
    className,
  )

  const visualIcon = isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : Icon ? <Icon className="h-3.5 w-3.5" /> : null

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      className: cn(classNames, children.props.className),
      ...props,
      children: (
        <>
          {visualIcon}
          {children.props.children}
        </>
      ),
    })
  }

  return (
    <button
      type={type}
      className={classNames}
      title={props.title ?? props['aria-label']}
      {...props}
    >
      {visualIcon}
      {children}
    </button>
  )
}
