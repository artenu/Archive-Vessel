import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '../../utils/cn'
import { ToastContext } from './toastContext'

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const value = useMemo(
    () => ({
      notify: ({ title, description, type = 'info' }) => {
        const id = crypto.randomUUID()
        setToasts((items) => [...items, { id, title, description, type }])
        window.setTimeout(() => {
          setToasts((items) => items.filter((item) => item.id !== id))
        }, 2800)
      },
    }),
    [],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-3 top-3 z-[60] w-[calc(100vw-24px)] max-w-72 space-y-1.5 sm:right-4 sm:top-4">
        {toasts.map((toast) => {
          const Icon = icons[toast.type] ?? Info
          return (
            <div key={toast.id} className="rounded-md border border-slate-200 bg-white p-2.5 shadow-sm">
              <div className="flex gap-2.5">
                <Icon className={cn('mt-0.5 h-4 w-4', toast.type === 'success' && 'text-emerald-600', toast.type === 'error' && 'text-red-600', toast.type === 'info' && 'text-sky-600')} />
                <div>
                  <p className="text-xs font-semibold text-slate-950">{toast.title}</p>
                  {toast.description ? <p className="mt-1 text-xs text-slate-500">{toast.description}</p> : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
