import { Edit3, Plus, Search, UserMinus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { DataTable } from '../components/data-display/DataTable'
import { EmptyState } from '../components/feedback/EmptyState'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { FormField, SelectInput, TextInput } from '../components/ui/FormField'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { useConfirm } from '../hooks/useConfirm'
import { useToast } from '../hooks/useToast'
import { api } from '../services/mockApi'
import { statusTone } from '../utils/statusTone'

const resources = [
  { key: 'customers', label: 'Customer', prefix: 'CUST' },
  { key: 'vessels', label: 'Vessel', prefix: 'VES' },
  { key: 'tugBoats', label: 'Tug Boat', prefix: 'TUG' },
  { key: 'barges', label: 'Barge', prefix: 'BRG' },
]

const pageSize = 8
const resourceKeys = resources.map((resource) => resource.key)

function normalizeResource(value) {
  return resourceKeys.includes(value) ? value : 'customers'
}

export function MasterDataPage() {
  const { notify } = useToast()
  const { confirm } = useConfirm()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedResource = normalizeResource(searchParams.get('resource'))
  const [data, setData] = useState(() => api.masterData.list())
  const [active, setActive] = useState(requestedResource)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const resource = resources.find((item) => item.key === active) ?? resources[0]

  useEffect(() => {
    setActive(requestedResource)
    setSearch('')
    setPage(1)
  }, [requestedResource])

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (data[active] ?? []).filter((row) => [
      row.kode,
      row.nama,
      row.endUser,
      row.pic,
      row.kontak,
      row.owner,
      row.kapasitas,
      row.status,
    ].join(' ').toLowerCase().includes(query))
  }, [active, data, search])
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const pagedRows = rows.slice((page - 1) * pageSize, page * pageSize)

  function saveItem(item) {
    if (!String(item.nama ?? '').trim()) {
      notify({ title: 'Nama wajib diisi', description: `${resource.label} belum bisa disimpan.`, type: 'error' })
      return
    }

    const next = api.masterData.save(active, {
      ...item,
      kode: item.kode || `${resource.prefix}-${String((data[active] ?? []).length + 1).padStart(3, '0')}`,
      status: item.status || 'Aktif',
    })
    setData(next)
    setEditing(null)
    notify({ title: 'Master data disimpan', description: item.nama || resource.label, type: 'success' })
  }

  function deactivate(item) {
    confirm({
      title: `Nonaktifkan ${resource.label}?`,
      description: `${item.nama} tidak akan muncul sebagai pilihan aktif pada form Job.`,
      onConfirm: () => saveItem({ ...item, status: 'Nonaktif' }),
    })
  }

  function selectResource(value) {
    setSearchParams({ resource: value })
    setActive(value)
    setSearch('')
    setPage(1)
  }

  const columns = createColumns(resource.key, setEditing, deactivate)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-700">Admin</p>
          <h1 className="text-lg font-semibold text-slate-950">Master Data</h1>
          <p className="text-xs text-slate-500">Kelola Customer, Vessel, Tug Boat, dan Barge untuk pilihan data pada form Job.</p>
        </div>
        <Button size="sm" icon={Plus} onClick={() => setEditing(createBlankItem(resource))}>Tambah</Button>
      </div>

      <Card>
        <CardContent className="grid gap-2 lg:grid-cols-[240px_1fr]">
          <FormField label="Jenis Master">
            <SelectInput value={active} onChange={(event) => selectResource(event.target.value)}>
              {resources.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
            </SelectInput>
          </FormField>
          <FormField label="Pencarian">
            <div className="flex h-7 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <TextInput
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1) }}
                className="h-auto border-0 px-0 focus:border-transparent focus:ring-0"
                placeholder="Cari nama, PIC, owner, kapasitas, status..."
              />
            </div>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title={`Data ${resource.label}`} description={`${rows.length} baris tersedia.`} />
        <CardContent>
          {rows.length ? <DataTable columns={columns} rows={pagedRows} showActions={false} /> : <EmptyState title={`Belum ada data ${resource.label}`} description="Tambahkan data referensi atau ubah kata kunci pencarian." />}
        </CardContent>
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={rows.length}
          pageSize={pageSize}
          pageSizeOptions={[pageSize]}
          onPrevious={() => setPage((value) => Math.max(1, value - 1))}
          onNext={() => setPage((value) => Math.min(totalPages, value + 1))}
        />
      </Card>

      <MasterModal
        open={Boolean(editing)}
        item={editing}
        resource={resource}
        onClose={() => setEditing(null)}
        onSave={saveItem}
      />
    </div>
  )
}

function createColumns(resourceKey, onEdit, onDeactivate) {
  const actionColumn = {
    key: 'aksi',
    label: 'Aksi',
    render: (row) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-sm" icon={Edit3} aria-label={`Edit ${row.nama}`} onClick={() => onEdit(row)} />
        <Button variant="ghost" size="icon-sm" icon={UserMinus} aria-label={`Nonaktifkan ${row.nama}`} disabled={row.status === 'Nonaktif'} onClick={() => onDeactivate(row)} />
      </div>
    ),
  }
  const statusColumn = { key: 'status', label: 'Status', render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> }

  if (resourceKey === 'customers') {
    return [
      { key: 'nama', label: 'Customer' },
      { key: 'endUser', label: 'End User' },
      { key: 'pic', label: 'PIC' },
      { key: 'kontak', label: 'Kontak' },
      { key: 'npwp', label: 'NPWP' },
      statusColumn,
      actionColumn,
    ]
  }

  if (resourceKey === 'vessels') {
    return [
      { key: 'nama', label: 'Vessel' },
      { key: 'tipe', label: 'Tipe' },
      { key: 'kapasitas', label: 'Kapasitas' },
      { key: 'owner', label: 'Owner' },
      statusColumn,
      actionColumn,
    ]
  }

  return [
    { key: 'nama', label: resourceKey === 'tugBoats' ? 'Tug Boat' : 'Barge' },
    { key: 'owner', label: 'Owner' },
    { key: 'kapasitas', label: 'Kapasitas' },
    statusColumn,
    actionColumn,
  ]
}

function createBlankItem(resource) {
  return {
    kode: '',
    nama: '',
    endUser: '',
    pic: '',
    kontak: '',
    npwp: '',
    keterangan: '',
    tipe: '',
    owner: '',
    kapasitas: '',
    status: 'Aktif',
    resourceKey: resource.key,
  }
}

function MasterModal({ open, item, resource, onClose, onSave }) {
  const [form, setForm] = useState(item ?? {})
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(item ?? {})
    setError('')
  }, [item])

  if (!open || !item) return null

  function setField(key, value) {
    if (error) setError('')
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSave() {
    if (!String(form.nama ?? '').trim()) {
      setError(`Nama ${resource.label} wajib diisi.`)
      return
    }
    onSave(form)
  }

  return (
    <Modal
      open={open}
      title={`${item.id ? 'Edit' : 'Tambah'} ${resource.label}`}
      description="Data referensi disimpan di localStorage dan dipakai oleh form Job."
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button onClick={handleSave}>Simpan</Button></>}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Kode"><TextInput value={form.kode ?? ''} onChange={(event) => setField('kode', event.target.value)} placeholder={`${resource.prefix}-001`} /></FormField>
        <FormField label={`Nama ${resource.label}`} error={error}><TextInput value={form.nama ?? ''} onChange={(event) => setField('nama', event.target.value)} autoFocus /></FormField>
        {resource.key === 'customers' ? (
          <>
            <FormField label="End User"><TextInput value={form.endUser ?? ''} onChange={(event) => setField('endUser', event.target.value)} /></FormField>
            <FormField label="PIC"><TextInput value={form.pic ?? ''} onChange={(event) => setField('pic', event.target.value)} /></FormField>
            <FormField label="Kontak"><TextInput value={form.kontak ?? ''} onChange={(event) => setField('kontak', event.target.value)} /></FormField>
            <FormField label="NPWP"><TextInput value={form.npwp ?? ''} onChange={(event) => setField('npwp', event.target.value)} /></FormField>
          </>
        ) : null}
        {resource.key === 'vessels' ? (
          <>
            <FormField label="Tipe / Info Dasar"><TextInput value={form.tipe ?? ''} onChange={(event) => setField('tipe', event.target.value)} placeholder="Mother Vessel, kapal cargo..." /></FormField>
            <FormField label="Owner"><TextInput value={form.owner ?? form.operator ?? ''} onChange={(event) => setField('owner', event.target.value)} /></FormField>
            <FormField label="Kapasitas"><TextInput value={form.kapasitas ?? ''} onChange={(event) => setField('kapasitas', event.target.value)} /></FormField>
          </>
        ) : null}
        {['tugBoats', 'barges'].includes(resource.key) ? (
          <>
            <FormField label="Owner"><TextInput value={form.owner ?? ''} onChange={(event) => setField('owner', event.target.value)} /></FormField>
            <FormField label="Kapasitas"><TextInput value={form.kapasitas ?? ''} onChange={(event) => setField('kapasitas', event.target.value)} /></FormField>
          </>
        ) : null}
        <FormField label="Status">
          <SelectInput value={form.status ?? 'Aktif'} onChange={(event) => setField('status', event.target.value)}>
            <option>Aktif</option>
            <option>Nonaktif</option>
          </SelectInput>
        </FormField>
        <FormField label="Keterangan" className="sm:col-span-2"><TextInput value={form.keterangan ?? ''} onChange={(event) => setField('keterangan', event.target.value)} /></FormField>
      </div>
    </Modal>
  )
}
