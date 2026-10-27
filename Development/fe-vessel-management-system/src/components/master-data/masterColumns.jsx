import { Edit3 } from 'lucide-react'
import { statusTone } from '../../utils/statusTone'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

export function createMasterColumns({ resource, showValue, onEdit, onDeactivate }) {
  return [
    { key: 'kode', label: 'Kode' },
    { key: 'nama', label: resource.valueLabel },
    ...(showValue ? [{ key: 'nilai', label: resource.key === 'taxConfig' ? 'Nilai (%)' : 'Nilai Tarif' }] : []),
    { key: 'status', label: 'Status', render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" icon={Edit3} aria-label={`Edit ${row.nama}`} onClick={() => onEdit(row)} />
          <Button variant="ghost" size="sm" disabled={row.status === 'Nonaktif'} onClick={() => onDeactivate(row)}>Nonaktifkan</Button>
        </div>
      ),
    },
  ]
}
