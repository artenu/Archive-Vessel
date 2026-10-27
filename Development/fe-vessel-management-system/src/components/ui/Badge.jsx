import { cn } from '../../utils/cn'

const tones = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  warning: 'bg-amber-50 text-amber-700 ring-amber-100',
  danger: 'bg-rose-50 text-rose-700 ring-rose-100',
  neutral: 'bg-slate-50 text-slate-600 ring-slate-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-100',
}

export function Badge({ children, tone = 'neutral', className }) {
  return (
    <span className={cn('inline-flex max-w-full items-center whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none ring-1', tones[tone], className)}>
      {children}
    </span>
  )
}
