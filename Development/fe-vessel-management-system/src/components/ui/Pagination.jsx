import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

export function Pagination({
  page = 1,
  totalPages = 8,
  totalItems,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50],
  onPageSizeChange,
  onPrevious,
  onNext,
  previousDisabled = page <= 1,
  nextDisabled = page >= totalPages,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-white px-3 py-2">
      <p className="text-xs font-medium text-slate-500">
        {typeof totalItems === 'number' ? `${totalItems} data - ` : null}
        Halaman {page} dari {totalPages}
      </p>
      <div className="flex items-center gap-1.5">
        <label className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
          Baris
          <select
            className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs font-normal text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-50"
            value={pageSize}
            onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
          >
            {pageSizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <Button variant="secondary" size="icon-sm" icon={ChevronLeft} aria-label="Halaman sebelumnya" disabled={previousDisabled} onClick={onPrevious} />
        <Button variant="secondary" size="icon-sm" icon={ChevronRight} aria-label="Halaman berikutnya" disabled={nextDisabled} onClick={onNext} />
      </div>
    </div>
  )
}
