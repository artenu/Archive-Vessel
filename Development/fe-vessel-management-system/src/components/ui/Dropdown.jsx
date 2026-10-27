import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '../../utils/cn'

export function Dropdown({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(event) {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        onClick={() => setOpen((value) => !value)}
      >
        {trigger}
        <ChevronDown className={cn('h-3.5 w-3.5 transition', open && 'rotate-180')} />
      </button>
      {open ? (
        <div
          className={cn(
            'absolute z-50 mt-1.5 w-52 rounded-md border border-slate-200 bg-white p-1 shadow-sm',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

export function DropdownItem({ children, icon: Icon, className, ...props }) {
  return (
    <button
      type="button"
      className={cn('flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50', className)}
      {...props}
    >
      {Icon ? <Icon className="h-3.5 w-3.5 text-slate-500" /> : null}
      {children}
    </button>
  )
}
