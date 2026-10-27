import { cn } from '../../utils/cn'

export function Card({ children, className }) {
  return <section className={cn('rounded-md border border-slate-200/80 bg-white', className)}>{children}</section>
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-2 border-b border-slate-100 px-3 py-2', className)}>
      <div>
        <h2 className="text-xs font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

const contentPadding = {
  compact: 'p-3',
  sm: 'p-3',
  md: 'p-3.5',
}

export function CardContent({ children, className, size = 'compact' }) {
  return <div className={cn(contentPadding[size], className)}>{children}</div>
}
