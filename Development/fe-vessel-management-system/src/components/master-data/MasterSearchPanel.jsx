import { Search } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { FormField } from '../ui/FormField'

export function MasterSearchPanel({ search, onSearchChange, placeholder = 'Cari kode, nama, status...' }) {
  return (
    <Card>
      <CardContent>
        <FormField label="Pencarian">
          <div className="flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full text-xs outline-none placeholder:text-slate-400"
              placeholder={placeholder}
            />
          </div>
        </FormField>
      </CardContent>
    </Card>
  )
}
