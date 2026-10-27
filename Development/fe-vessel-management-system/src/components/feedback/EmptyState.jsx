import { Inbox } from 'lucide-react'
import { Button } from '../ui/Button'

export function EmptyState({ title = 'Belum ada data', description = 'Data akan muncul setelah aktivitas tersedia.', action, actionLabel, onAction }) {
  return (
    <div className="grid place-items-center rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-center">
      <div className="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200">
        <Inbox className="h-4 w-4" />
      </div>
      <h3 className="mt-2 text-xs font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>
      {action ?? (actionLabel ? <Button className="mt-3" size="sm" onClick={onAction}>{actionLabel}</Button> : null)}
    </div>
  )
}
