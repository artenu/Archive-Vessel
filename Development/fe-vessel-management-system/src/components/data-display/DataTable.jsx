import { MoreHorizontal } from 'lucide-react'
import { statusTone } from '../../utils/statusTone'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

export function DataTable({ columns, rows, showActions = true, onAction, emptyMessage = 'Belum ada data.' }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200/80 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-3 py-2 text-[10px] font-semibold uppercase text-slate-500">
                  {column.label}
                </th>
              ))}
              {showActions ? <th className="w-10 px-3 py-2 text-right text-[10px] font-semibold uppercase text-slate-500">Aksi</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.length ? rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td key={column.key} className={column.className ?? 'max-w-[220px] whitespace-nowrap px-3 py-2 text-[11px] font-normal text-slate-700'}>
                    {column.render ? column.render(row) : column.key === 'status' ? <Badge tone={statusTone(row[column.key])}>{row[column.key]}</Badge> : row[column.key]}
                  </td>
                ))}
                {showActions ? (
                  <td className="px-3 py-2 text-right">
                    <Button variant="ghost" size="icon-sm" icon={MoreHorizontal} aria-label="Buka aksi" onClick={() => onAction?.(row)} />
                  </td>
                ) : null}
              </tr>
            )) : (
              <tr>
                <td className="px-3 py-4 text-center text-xs font-medium text-slate-500" colSpan={columns.length + (showActions ? 1 : 0)}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
