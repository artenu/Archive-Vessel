import { Check, Edit3, Eye, FileText, Plus, Search, UploadCloud } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { DataTable } from '../components/data-display/DataTable'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { FormField, SelectInput, TextInput } from '../components/ui/FormField'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { useToast } from '../hooks/useToast'
import { api } from '../services/mockApi'
import { createSalesJobDraft, getSalesJobs, saveCreatedJob, toSalesJobRecord } from '../utils/jobStorage'
import { statusTone } from '../utils/statusTone'

const serviceOptions = [
  'Jasa PBM',
  'Pengurusan RKBM',
  'Pengurusan Kepabeanan dan COO',
  'Reimbursement PNBP',
]

const reimbursementOptions = [
  'PNBP Jasa Barang',
  'PNBP Jasa PBM',
  'PNBP Jasa Lainnya',
]

function activeRows(rows = [], currentValue = '') {
  const active = rows.filter((row) => row.status !== 'Nonaktif')
  if (!currentValue || active.some((row) => row.nama === currentValue)) return active
  const current = rows.find((row) => row.nama === currentValue) ?? { id: currentValue, nama: currentValue, status: 'Aktif' }
  return [current, ...active]
}

function createBlankOrder() {
  return {
    id: crypto.randomUUID(),
    customer: '',
    endUser: '',
    vessel: '',
    activityType: 'Domestik',
    dropPoint: '',
    startDate: '',
    estimatedTonnage: '',
    customerPic: '',
    services: ['Jasa PBM'],
    reimbursementTypes: [],
    notes: '',
    documents: {
      appointmentLetter: { title: 'Surat Penunjukan', files: [] },
      shippingInstruction: { title: 'Shipping Instruction', files: [] },
    },
  }
}

function normalizeOrder(order) {
  const blank = createBlankOrder()
  const source = order ?? blank
  return {
    ...blank,
    ...source,
    services: Array.isArray(source.services) && source.services.length ? source.services : blank.services,
    reimbursementTypes: Array.isArray(source.reimbursementTypes) ? source.reimbursementTypes : blank.reimbursementTypes,
    documents: {
      appointmentLetter: source.documents?.appointmentLetter ?? blank.documents.appointmentLetter,
      shippingInstruction: source.documents?.shippingInstruction ?? blank.documents.shippingInstruction,
    },
  }
}

function buildJobFromOrder(order) {
  const draft = createSalesJobDraft()
  return toSalesJobRecord({
    ...draft,
    ...order,
    documents: order.documents ?? draft.documents,
    orders: [order],
  }, 'DRAFT')
}

function createFileMetadata(file) {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    type: file.type || 'unknown',
    uploadedAt: new Date().toISOString(),
  }
}

function fileSize(size) {
  if (!size) return '0 KB'
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function formatServices(row) {
  const services = row.services ?? row.orders?.[0]?.services ?? []
  const reimbursementTypes = row.reimbursementTypes ?? row.orders?.[0]?.reimbursementTypes ?? []
  if (!services.length) return '-'
  if (!services.includes('Reimbursement PNBP') || !reimbursementTypes.length) return services.join(', ')
  return `${services.join(', ')} (${reimbursementTypes.join(', ')})`
}

export function SalesJobsPage() {
  const { notify } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('Semua Status')
  const [refreshKey, setRefreshKey] = useState(0)
  const [creatingOrder, setCreatingOrder] = useState(null)
  const masterData = useMemo(() => api.masterData.list(), [])

  const rows = useMemo(() => {
    void refreshKey
    const query = search.trim().toLowerCase()
    return getSalesJobs().filter((job) => {
      const searchable = [job.jobNumber, job.customer, job.endUser, job.vessel, job.dropPoint, job.customerPic].join(' ').toLowerCase()
      const matchesSearch = !query || searchable.includes(query)
      const matchesStatus = status === 'Semua Status' || job.salesStatus === status || job.operationalStatus === status
      return matchesSearch && matchesStatus
    })
  }, [refreshKey, search, status])

  function saveNewOrder(order) {
    const record = buildJobFromOrder(order)
    saveCreatedJob(record)
    setCreatingOrder(null)
    setRefreshKey((value) => value + 1)
    notify({ title: 'Orderan dibuat', description: record.jobNumber, type: 'success' })
  }

  const columns = [
    {
      key: 'jobNumber',
      label: 'Nomor Job',
      render: (row) => (
        <Link to={`/pekerjaan/${row.id}`} className="font-semibold text-brand-700 hover:text-brand-800">
          {row.jobNumber}
        </Link>
      ),
    },
    { key: 'customer', label: 'Customer' },
    { key: 'endUser', label: 'End User' },
    { key: 'vessel', label: 'Vessel' },
    { key: 'activityType', label: 'Kegiatan' },
    {
      key: 'services',
      label: 'Layanan',
      render: (row) => (
        <span className="block max-w-[260px] truncate text-[11px] font-semibold text-slate-700" title={formatServices(row)}>
          {formatServices(row)}
        </span>
      ),
    },
    { key: 'dropPoint', label: 'Tujuan / Drop Point' },
    {
      key: 'salesStatus',
      label: 'Status',
      render: (row) => <Badge tone={statusTone(row.operationalStatus)}>{row.operationalStatus}</Badge>,
    },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.salesStatus === 'DRAFT' ? (
            <Button asChild variant="ghost" size="icon-sm" icon={Edit3} aria-label={`Edit ${row.jobNumber}`}>
              <Link to={`/sales/jobs/${row.id}/edit`} />
            </Button>
          ) : null}
          <Button asChild variant="ghost" size="icon-sm" icon={Eye} aria-label={`Lihat ${row.jobNumber}`}>
            <Link to={`/pekerjaan/${row.id}`} />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="border-l-4 border-brand-600 pl-3">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-700">Sales</p>
              <Badge tone="brand">Order Intake</Badge>
            </div>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-950">Job Sales</h1>
            <p className="text-xs font-medium text-slate-500">Buat draft order, lengkapi dokumen awal, lalu submit ke Operational.</p>
          </div>
          <Button size="sm" icon={Plus} className="h-9 px-4 text-sm font-bold shadow-sm" onClick={() => setCreatingOrder(createBlankOrder())}>Buat Job</Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="grid items-end gap-2 lg:grid-cols-[1fr_190px]">
          <FormField label="Pencarian">
            <div className="flex h-8 items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-50">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <TextInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-auto border-0 px-0 text-sm focus:border-transparent focus:ring-0"
                placeholder="Cari nomor, customer, vessel..."
              />
            </div>
          </FormField>
          <FormField label="Status">
            <SelectInput value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>Semua Status</option>
              <option>DRAFT</option>
              <option>OPERATIONAL</option>
              <option>FINANCE</option>
              <option>SELESAI</option>
            </SelectInput>
          </FormField>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader
          title="Daftar Job Sales"
          description={`${rows.length} job sales tersimpan di localStorage.`}
          action={<Badge tone={rows.length ? 'brand' : 'neutral'}>{rows.length} Data</Badge>}
        />
        <CardContent>
          {rows.length ? (
            <DataTable columns={columns} rows={rows} showActions={false} />
          ) : (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm font-bold text-slate-950">Belum ada job sales</p>
              <p className="mt-1 text-xs font-medium text-slate-500">Klik Buat Job untuk membuat draft order pertama.</p>
              <Button className="mt-3 h-8 px-3 text-xs font-bold" icon={Plus} onClick={() => setCreatingOrder(createBlankOrder())}>Buat Job</Button>
            </div>
          )}
        </CardContent>
        <Pagination page={1} totalPages={1} totalItems={rows.length} pageSize={10} />
      </Card>

      <CreateOrderModal
        open={Boolean(creatingOrder)}
        order={creatingOrder}
        masterData={masterData}
        onClose={() => setCreatingOrder(null)}
        onSave={saveNewOrder}
      />
    </div>
  )
}

function CreateOrderModal({ open, order, masterData, onClose, onSave }) {
  const [form, setForm] = useState(() => normalizeOrder(order))
  const [errors, setErrors] = useState({})
  const customers = useMemo(() => activeRows(masterData.customers, form.customer), [form.customer, masterData.customers])
  const endUsers = useMemo(() => {
    const values = customers.map((customer) => customer.endUser).filter(Boolean)
    return [...new Set([form.endUser, ...values].filter(Boolean))]
  }, [customers, form.endUser])
  const vessels = useMemo(() => activeRows(masterData.vessels, form.vessel), [form.vessel, masterData.vessels])

  useEffect(() => {
    setForm(normalizeOrder(order))
    setErrors({})
  }, [order])

  if (!open || !order) return null

  function updateField(key, value) {
    setErrors((current) => ({ ...current, [key]: '' }))
    setForm((current) => ({ ...current, [key]: value }))
  }

  function toggleService(service) {
    setErrors((current) => ({ ...current, services: '' }))
    setForm((current) => {
      const currentServices = current.services ?? []
      const enabled = currentServices.includes(service)
      const nextServices = enabled ? currentServices.filter((item) => item !== service) : [...currentServices, service]
      return {
        ...current,
        services: nextServices,
        reimbursementTypes: nextServices.includes('Reimbursement PNBP') ? current.reimbursementTypes ?? [] : [],
      }
    })
  }

  function toggleReimbursement(type) {
    setForm((current) => {
      const currentTypes = current.reimbursementTypes ?? []
      const enabled = currentTypes.includes(type)
      return {
        ...current,
        reimbursementTypes: enabled ? currentTypes.filter((item) => item !== type) : [...currentTypes, type],
      }
    })
  }

  function addFiles(docKey, fileList) {
    const files = Array.from(fileList ?? []).map((file) => createFileMetadata(file))
    setForm((current) => ({
      ...current,
      documents: {
        ...current.documents,
        [docKey]: {
          ...current.documents[docKey],
          files: [...(current.documents[docKey]?.files ?? []), ...files],
        },
      },
    }))
  }

  function removeFile(docKey, fileId) {
    setForm((current) => ({
      ...current,
      documents: {
        ...current.documents,
        [docKey]: {
          ...current.documents[docKey],
          files: (current.documents[docKey]?.files ?? []).filter((file) => file.id !== fileId),
        },
      },
    }))
  }

  function selectCustomer(value) {
    const customer = customers.find((item) => item.nama === value)
    setErrors((current) => ({ ...current, customer: '' }))
    setForm((current) => ({
      ...current,
      customer: value,
      endUser: customer?.endUser ?? current.endUser,
      customerPic: customer?.pic ?? current.customerPic,
    }))
  }

  function handleSave() {
    const nextErrors = {
      customer: form.customer ? '' : 'Customer wajib dipilih.',
      endUser: form.endUser ? '' : 'End User wajib dipilih.',
      vessel: form.vessel ? '' : 'Vessel wajib dipilih.',
      dropPoint: form.dropPoint ? '' : 'Tujuan wajib diisi.',
      startDate: form.startDate ? '' : 'Tanggal wajib diisi.',
      customerPic: form.customerPic ? '' : 'PIC wajib diisi.',
      services: form.services?.length ? '' : 'Pilih minimal satu layanan.',
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    onSave(form)
  }

  return (
    <Modal
      open={open}
      title="Buat Orderan Baru"
      description="Orderan disimpan sebagai draft Job Sales dan langsung tampil di tabel halaman ini."
      onClose={onClose}
      maxWidth="max-w-4xl"
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button icon={Plus} onClick={handleSave}>Simpan Order</Button></>}
    >
      <div className="space-y-3">
        <section className="rounded-md border border-slate-200 bg-white">
          <div className="border-l-4 border-brand-600 px-3 py-2">
            <h3 className="text-sm font-bold text-slate-950">Data Order</h3>
            <p className="text-xs text-slate-500">Isi data utama orderan sebelum disimpan sebagai draft Job Sales.</p>
          </div>
          <div className="grid gap-3 border-t border-slate-100 p-3 md:grid-cols-3">
            <FormField label="Customer" error={errors.customer}>
              <SelectInput value={form.customer} onChange={(event) => selectCustomer(event.target.value)}>
                <option value="">Pilih Customer</option>
                {customers.map((customer) => <option key={customer.id ?? customer.nama} value={customer.nama}>{customer.nama}</option>)}
              </SelectInput>
            </FormField>
            <FormField label="End User" error={errors.endUser}>
              <SelectInput value={form.endUser} onChange={(event) => updateField('endUser', event.target.value)}>
                <option value="">Pilih End User</option>
                {endUsers.map((endUser) => <option key={endUser} value={endUser}>{endUser}</option>)}
              </SelectInput>
            </FormField>
            <FormField label="Vessel" error={errors.vessel}>
              <SelectInput value={form.vessel} onChange={(event) => updateField('vessel', event.target.value)}>
                <option value="">Pilih Vessel</option>
                {vessels.map((vessel) => <option key={vessel.id ?? vessel.nama} value={vessel.nama}>{vessel.nama}</option>)}
              </SelectInput>
            </FormField>
            <FormField label="Jenis Kegiatan">
              <SelectInput value={form.activityType} onChange={(event) => updateField('activityType', event.target.value)}>
                <option>Ekspor</option>
                <option>Impor</option>
                <option>Domestik</option>
              </SelectInput>
            </FormField>
            <FormField label="Layanan Order" error={errors.services} className="md:col-span-2">
              <div className="grid gap-2 sm:grid-cols-2">
                {serviceOptions.map((service) => (
                  <CheckboxChip
                    key={service}
                    checked={(form.services ?? []).includes(service)}
                    label={service}
                    onChange={() => toggleService(service)}
                  />
                ))}
              </div>
            </FormField>
            {(form.services ?? []).includes('Reimbursement PNBP') ? (
              <FormField label="Rincian Reimbursement" hint="Opsional, pilih sesuai kebutuhan penagihan." className="md:col-span-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  {reimbursementOptions.map((type) => (
                    <CheckboxChip
                      key={type}
                      checked={(form.reimbursementTypes ?? []).includes(type)}
                      label={type}
                      tone="subtle"
                      onChange={() => toggleReimbursement(type)}
                    />
                  ))}
                </div>
              </FormField>
            ) : null}
            <FormField label="Tujuan / Drop Point" error={errors.dropPoint}>
              <TextInput value={form.dropPoint} onChange={(event) => updateField('dropPoint', event.target.value)} placeholder="Jetty / anchorage / tujuan" />
            </FormField>
            <FormField label="Tanggal Pekerjaan" error={errors.startDate}>
              <TextInput type="date" value={form.startDate} onChange={(event) => updateField('startDate', event.target.value)} />
            </FormField>
            <FormField label="Estimasi Tonase" hint="Opsional">
              <TextInput type="number" value={form.estimatedTonnage} onChange={(event) => updateField('estimatedTonnage', event.target.value)} placeholder="0" />
            </FormField>
            <FormField label="PIC Customer" error={errors.customerPic}>
              <TextInput value={form.customerPic} onChange={(event) => updateField('customerPic', event.target.value)} placeholder="Nama PIC" />
            </FormField>
            <FormField label="Keterangan" className="md:col-span-3">
              <TextInput value={form.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Catatan singkat orderan" />
            </FormField>
          </div>
        </section>

        <section className="rounded-md border border-slate-200 bg-white">
          <div className="border-l-4 border-brand-600 px-3 py-2">
              <h3 className="text-sm font-bold text-slate-950">Dokumen Awal</h3>
              <p className="text-xs text-slate-500">Upload mock metadata untuk Surat Penunjukan.</p>
            </div>
          <div className="grid gap-3 border-t border-slate-100 p-3">
            <ModalUploadBox
              title="Surat Penunjukan"
              files={form.documents?.appointmentLetter?.files ?? []}
              onAdd={(files) => addFiles('appointmentLetter', files)}
              onRemove={(fileId) => removeFile('appointmentLetter', fileId)}
            />
          </div>
        </section>
      </div>
    </Modal>
  )
}

function CheckboxChip({ checked, label, onChange, tone = 'default' }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={[
        'flex h-8 items-center justify-between gap-2 rounded-md border px-2.5 text-left text-xs font-semibold transition',
        checked
          ? 'border-brand-600 bg-brand-50 text-brand-800 shadow-[inset_3px_0_0_#e1020a]'
          : tone === 'subtle'
            ? 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
            : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50/50',
      ].join(' ')}
    >
      <span className="truncate">{label}</span>
      <span className={checked ? 'grid h-4 w-4 shrink-0 place-items-center rounded-sm bg-brand-600 text-[10px] text-white' : 'h-4 w-4 shrink-0 rounded-sm border border-slate-300 bg-white'}>
        {checked ? <Check className="h-3 w-3" /> : null}
      </span>
    </button>
  )
}

function ModalUploadBox({ title, files, onAdd, onRemove }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-slate-950">{title}</p>
          <p className="text-[11px] text-slate-500">{files.length} file metadata</p>
        </div>
        <label className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md bg-brand-600 px-2 text-xs font-bold text-white hover:bg-brand-700">
          <UploadCloud className="h-3.5 w-3.5" />
          Upload
          <input type="file" multiple className="hidden" onChange={(event) => onAdd(event.target.files)} />
        </label>
      </div>
      {files.length ? (
        <div className="space-y-1">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5">
              <div className="flex min-w-0 items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <p className="truncate text-[11px] font-semibold text-slate-700">{file.name}</p>
                <span className="shrink-0 text-[10px] text-slate-400">{fileSize(file.size)}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onRemove(file.id)}>Hapus</Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-slate-300 bg-white px-3 py-3 text-center text-xs font-medium text-slate-500">
          Belum ada file.
        </div>
      )}
    </div>
  )
}
