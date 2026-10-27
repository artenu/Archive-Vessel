import { Eye, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DataTable } from '../components/data-display/DataTable'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { FormField, SelectInput } from '../components/ui/FormField'
import { Modal } from '../components/ui/Modal'
import { api } from '../services/mockApi'

function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function JsonBlock({ title, value }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase text-slate-500">{title}</p>
      <pre className="max-h-64 overflow-auto rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-100">
        {JSON.stringify(value ?? {}, null, 2)}
      </pre>
    </div>
  )
}

export function ActivityLogPage() {
  const [logs] = useState(() => api.activityLog.list())
  const [search, setSearch] = useState('')
  const [module, setModule] = useState('Semua Modul')
  const [selected, setSelected] = useState(null)
  const modules = ['Semua Modul', ...new Set(logs.map((log) => log.module))]

  const rows = useMemo(() => {
    const query = search.toLowerCase()
    return logs.filter((log) => {
      const text = [log.user, log.action, log.module, log.reason, log.ipAddress].join(' ').toLowerCase()
      return (!query || text.includes(query)) && (module === 'Semua Modul' || log.module === module)
    })
  }, [logs, search, module])

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase text-brand-700">Admin</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-950">Activity Log</h1>
        <p className="mt-1 text-sm text-slate-500">Jejak aktivitas pengguna, modul, perubahan data sebelum/sesudah, IP dummy, dan alasan revisi.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <LogStat label="Total Aktivitas" value={logs.length} />
        <LogStat label="Modul Aktif" value={modules.length - 1} />
        <LogStat label="Revisi/Update" value={logs.filter((log) => /revisi|update|ubah/i.test(`${log.action} ${log.reason}`)).length} />
      </div>

      <Card>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_240px]">
          <FormField label="Pencarian">
            <div className="flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full text-xs outline-none placeholder:text-slate-400" placeholder="Cari user, aktivitas, modul, IP, alasan..." />
            </div>
          </FormField>
          <FormField label="Modul">
            <SelectInput value={module} onChange={(event) => setModule(event.target.value)}>
              {modules.map((item) => <option key={item}>{item}</option>)}
            </SelectInput>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Log Aktivitas" description={`${rows.length} aktivitas sesuai filter.`} />
        <CardContent>
          <DataTable
            rows={rows}
            showActions={false}
            columns={[
              { key: 'date', label: 'Tanggal', render: (row) => formatDate(row.date) },
              { key: 'user', label: 'Pengguna' },
              { key: 'action', label: 'Aktivitas' },
              { key: 'module', label: 'Modul', render: (row) => <Badge tone="brand">{row.module}</Badge> },
              { key: 'ipAddress', label: 'IP Dummy' },
              { key: 'reason', label: 'Alasan Revisi/Perubahan' },
              { key: 'detail', label: 'Detail', render: (row) => <Button variant="ghost" size="icon-sm" icon={Eye} aria-label={`Lihat detail ${row.id}`} onClick={() => setSelected(row)} /> },
            ]}
          />
        </CardContent>
      </Card>

      <Modal
        open={Boolean(selected)}
        title="Detail Activity Log"
        description={selected ? `${selected.action} - ${selected.module}` : ''}
        maxWidth="max-w-4xl"
        onClose={() => setSelected(null)}
        footer={<Button onClick={() => setSelected(null)}>Tutup</Button>}
      >
        {selected ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <JsonBlock title="Data Sebelum" value={selected.before} />
            <JsonBlock title="Data Sesudah" value={selected.after} />
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

function LogStat({ label, value }) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
        <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
      </CardContent>
    </Card>
  )
}
