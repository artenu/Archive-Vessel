import { X } from 'lucide-react'
import { Button } from './Button'

export function Modal({
  open,
  eyebrow,
  title,
  description,
  children,
  onClose,
  footer,
  maxWidth = 'max-w-lg',
  panelClassName = '',
  bodyClassName = '',
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-2 sm:p-3">
      <div
        className={`flex max-h-[calc(100vh-16px)] w-[calc(100vw-16px)] ${maxWidth} flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.32)] ring-1 ring-slate-950/10 sm:max-h-[calc(100vh-24px)] sm:w-[calc(100vw-24px)] ${panelClassName}`}
      >
        <div className="relative z-10 flex shrink-0 items-start justify-between gap-2 border-b border-slate-100 bg-white px-3 py-2.5 shadow-sm">
          <div>
            {eyebrow ? <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{eyebrow}</p> : null}
            <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
            {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
          </div>
          <Button variant="ghost" size="icon" icon={X} onClick={onClose} aria-label="Tutup modal" />
        </div>
        <div className={`min-h-0 flex-1 overflow-y-auto px-3 py-2.5 ${bodyClassName}`}>{children}</div>
        {footer ? <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 bg-white px-3 py-2.5">{footer}</div> : null}
      </div>
    </div>
  )
}
