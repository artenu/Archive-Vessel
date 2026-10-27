import { Edit3, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { statusTone } from '../../utils/statusTone'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import { api } from '../../services/mockApi'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ConfiguredMasterModal } from './ConfiguredMasterModal'
import { MasterPageHeader } from './MasterPageHeader'
import { MasterResourceTable } from './MasterResourceTable'
import { MasterSearchPanel } from './MasterSearchPanel'

const fallback = '-'
const headerActionClassName = 'h-8 rounded-md bg-brand-600 px-3 text-xs font-semibold text-white shadow-sm ring-1 ring-brand-700/20 hover:bg-brand-700 focus-visible:ring-brand-600'

export function ConfiguredMasterPage({
  resourceKey,
  title,
  description,
  addLabel,
  tableTitle,
  valueLabel,
  searchPlaceholder,
  fields,
  columns,
  createItem,
  validate,
}) {
  const { notify } = useToast()
  const { confirm } = useConfirm()
  const [data, setData] = useState(() => api.masterData.list())
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const rows = useMemo(() => data[resourceKey] ?? [], [data, resourceKey])
  const filteredRows = useMemo(() => {
    const query = search.toLowerCase()
    return rows.filter((item) => [...columns.map((column) => column.key), 'status'].some((key) => String(item[key] ?? '').toLowerCase().includes(query)))
  }, [columns, rows, search])
  const resource = { label: tableTitle ?? title, valueLabel }
  const tableColumns = [
    ...columns.map((column) => ({
      ...column,
      render: column.render ?? ((row) => row[column.key] || fallback),
    })),
    { key: 'status', label: 'Status', render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" icon={Edit3} aria-label={`Edit ${row.nama}`} onClick={() => setEditing(row)} />
          <Button variant="ghost" size="sm" disabled={row.status === 'Nonaktif'} onClick={() => deactivate(row)}>Nonaktifkan</Button>
        </div>
      ),
    },
  ]

  function saveItem(item) {
    const message = validate?.(item)
    if (message) {
      setError(message)
      return
    }

    const next = api.masterData.save(resourceKey, item)
    setData(next)
    setEditing(null)
    setError('')
    notify({ title: `${title} tersimpan`, description: item.nama, type: 'success' })
  }

  function deactivate(item) {
    confirm({
      title: `Nonaktifkan ${title}?`,
      description: `${item.nama} akan berubah menjadi Nonaktif.`,
      onConfirm: () => saveItem({ ...item, status: 'Nonaktif' }),
    })
  }

  return (
    <div className="space-y-4">
      <MasterPageHeader
        title={title}
        description={description}
        action={<Button icon={Plus} className={headerActionClassName} aria-label={addLabel} onClick={() => setEditing(createItem())}>Tambah Data</Button>}
      />

      <MasterSearchPanel search={search} onSearchChange={setSearch} placeholder={searchPlaceholder} />

      <MasterResourceTable resource={resource} rows={filteredRows} columns={tableColumns} />

      <ConfiguredMasterModal
        open={Boolean(editing)}
        item={editing}
        title={title}
        fields={fields}
        error={error}
        data={data}
        onClose={() => { setEditing(null); setError('') }}
        onSave={saveItem}
      />
    </div>
  )
}
