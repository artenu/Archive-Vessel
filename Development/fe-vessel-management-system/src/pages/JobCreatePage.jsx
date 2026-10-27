import { ArrowLeft, Edit3, FileText, Plus, Save, Send, Trash2, UploadCloud } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { DataTable } from '../components/data-display/DataTable'
import { EmptyState } from '../components/feedback/EmptyState'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { FormField, SelectInput, TextInput } from '../components/ui/FormField'
import { Modal } from '../components/ui/Modal'
import { useConfirm } from '../hooks/useConfirm'
import { useToast } from '../hooks/useToast'
import { api } from '../services/mockApi'
import {
  createSalesJobDraft,
  findCreatedJobById,
  saveCreatedJob,
  toSalesJobRecord,
} from '../utils/jobStorage'
import { statusTone } from '../utils/statusTone'

function fileSize(size) {
  if (!size) return '0 KB'
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

const requiredForOperational = [
  ['customer', 'Customer'],
  ['endUser', 'End User'],
  ['vessel', 'Vessel'],
  ['activityType', 'Jenis Kegiatan'],
  ['dropPoint', 'Tujuan / Drop Point'],
  ['startDate', 'Tanggal Pekerjaan'],
  ['customerPic', 'PIC Customer'],
]

const requiredLabelByKey = Object.fromEntries(requiredForOperational)

function validateForOperational(form) {
  if (!getOrderRows(form).length) return ['Orderan']

  const missing = requiredForOperational.filter(([key]) => !String(form[key] ?? '').trim()).map(([, label]) => label)

  if (!form.documents.appointmentLetter.files.length) missing.push('Surat Penunjukan')

  return missing
}

function getOrderRows(form) {
  return form.orders?.length ? form.orders : []
}

function createBlankOrder(seed = {}) {
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
    notes: '',
    ...seed,
  }
}

function orderFromJob(job) {
  return createBlankOrder({
    id: job.orderId ?? crypto.randomUUID(),
    customer: job.customer ?? '',
    endUser: job.endUser ?? '',
    vessel: job.vessel ?? '',
    activityType: job.activityType ?? 'Domestik',
    dropPoint: job.dropPoint ?? '',
    startDate: job.startDate ?? '',
    estimatedTonnage: job.estimatedTonnage ?? '',
    customerPic: job.customerPic ?? '',
    notes: job.notes ?? '',
  })
}

function normalizeSalesForm(job) {
  if (job.orders?.length) return job
  if ([job.customer, job.endUser, job.vessel, job.dropPoint, job.startDate, job.customerPic].some(Boolean)) {
    return { ...job, orders: [orderFromJob(job)] }
  }
  return { ...job, orders: [] }
}

function applyOrdersToForm(current, nextOrders) {
  const primary = nextOrders[0] ?? createBlankOrder()
  return {
    ...current,
    orders: nextOrders,
    customer: primary.customer,
    endUser: primary.endUser,
    vessel: primary.vessel,
    activityType: primary.activityType,
    dropPoint: primary.dropPoint,
    startDate: primary.startDate,
    estimatedTonnage: primary.estimatedTonnage,
    customerPic: primary.customerPic,
    notes: primary.notes,
  }
}

function activeRows(rows = [], currentValue = '') {
  const active = rows.filter((row) => row.status !== 'Nonaktif')
  if (!currentValue || active.some((row) => row.nama === currentValue)) return active
  const current = rows.find((row) => row.nama === currentValue) ?? { id: currentValue, nama: currentValue, status: 'Aktif' }
  return [current, ...active]
}

export function JobCreatePage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()
  const { confirm } = useConfirm()
  const existingJob = jobId ? findCreatedJobById(jobId) : null
  const initialForm = useMemo(() => normalizeSalesForm(existingJob ?? createSalesJobDraft()), [existingJob])
  const [form, setForm] = useState(() => initialForm)
  const [missingFields, setMissingFields] = useState([])
  const [editingOrder, setEditingOrder] = useState(() => {
    if (jobId) return null
    return !getOrderRows(initialForm).length ? createBlankOrder() : null
  })
  const isEditing = Boolean(jobId)
  const readOnly = form.salesStatus === 'OPERATIONAL'
  const masterData = useMemo(() => api.masterData.list(), [])
  const orderRows = getOrderRows(form)

  if (jobId && !existingJob) {
    return (
      <EmptyState
        title="Draft tidak ditemukan"
        description="Job Sales yang akan diedit tidak tersedia di localStorage."
        action={<Button asChild variant="secondary" icon={ArrowLeft}><Link to="/sales/jobs">Kembali</Link></Button>}
      />
    )
  }

  function saveOrder(order) {
    const exists = orderRows.some((item) => item.id === order.id)
    const nextOrders = exists ? orderRows.map((item) => (item.id === order.id ? order : item)) : [...orderRows, order]
    setMissingFields([])
    setForm((current) => applyOrdersToForm(current, nextOrders))
    setEditingOrder(null)
  }

  function deleteOrder(order) {
    confirm({
      title: 'Hapus orderan?',
      description: `${order.customer || '-'} / ${order.vessel || '-'} akan dihapus dari draft ini.`,
      onConfirm: () => {
        const nextOrders = orderRows.filter((item) => item.id !== order.id)
        setForm((current) => applyOrdersToForm(current, nextOrders))
        notify({ title: 'Orderan dihapus', description: form.jobNumber, type: 'info' })
      },
    })
  }

  function addFiles(docKey, fileList) {
    const files = Array.from(fileList ?? []).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
      uploadedAt: new Date().toISOString(),
    }))
    setForm((current) => ({
      ...current,
      documents: {
        ...current.documents,
        [docKey]: {
          ...current.documents[docKey],
          files: [...current.documents[docKey].files, ...files],
        },
      },
    }))
    setMissingFields([])
  }

  function removeFile(docKey, fileId) {
    setForm((current) => ({
      ...current,
      documents: {
        ...current.documents,
        [docKey]: {
          ...current.documents[docKey],
          files: current.documents[docKey].files.filter((file) => file.id !== fileId),
        },
      },
    }))
  }

  function saveDraft() {
    setMissingFields([])
    const record = toSalesJobRecord(form, 'DRAFT')
    saveCreatedJob(record)
    setForm(record)
    notify({ title: 'Draft tersimpan', description: record.jobNumber, type: 'success' })
  }

  function sendToOperational() {
    const missing = validateForOperational(form)
    setMissingFields(missing)
    if (missing.length) {
      notify({
        title: 'Data belum lengkap',
        description: missing.slice(0, 4).join(', '),
        type: 'error',
      })
      return
    }

    confirm({
      title: 'Kirim job ke Operational?',
      description: `${form.jobNumber} akan menjadi read-only dari sisi Sales.`,
      onConfirm: () => {
        const record = toSalesJobRecord(form, 'OPERATIONAL')
        saveCreatedJob(record)
        notify({ title: 'Job dikirim ke Operational', description: record.jobNumber, type: 'success' })
        navigate(`/pekerjaan/${record.id}`)
      },
    })
  }

  function fieldError(key) {
    return missingFields.includes(requiredLabelByKey[key]) ? 'Wajib diisi sebelum dikirim.' : ''
  }

  const orderColumns = [
    { key: 'customer', label: 'Customer' },
    { key: 'endUser', label: 'End User' },
    { key: 'vessel', label: 'Vessel' },
    { key: 'activityType', label: 'Kegiatan' },
    { key: 'dropPoint', label: 'Tujuan / Drop Point' },
    { key: 'startDate', label: 'Tanggal', render: (row) => row.startDate || '-' },
    { key: 'estimatedTonnage', label: 'Estimasi Tonase', render: (row) => row.estimatedTonnage ? `${Number(row.estimatedTonnage).toLocaleString('id-ID')} MT` : '-' },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (row) => readOnly ? null : (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" icon={Edit3} aria-label={`Edit order ${row.customer}`} onClick={() => setEditingOrder(row)} />
          <Button variant="ghost" size="icon-sm" icon={Trash2} aria-label={`Hapus order ${row.customer}`} onClick={() => deleteOrder(row)} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-slate-200 bg-white px-3 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <Button asChild variant="ghost" size="sm" icon={ArrowLeft} className="-ml-2 mb-1">
              <Link to="/sales/jobs">Kembali</Link>
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-700">Sales</p>
              <Badge tone={statusTone(form.salesStatus)}>{form.salesStatus}</Badge>
            </div>
            <h1 className="mt-0.5 text-lg font-semibold text-slate-950">{isEditing ? 'Edit Job Sales' : 'Buat Job Sales'}</h1>
            <p className="text-xs text-slate-500">Tambahkan orderan, lengkapi dokumen awal, lalu kirim ke Operational.</p>
          </div>
          <div className="flex items-center gap-1.5">
            {!readOnly ? <Button variant="secondary" size="sm" icon={Save} onClick={saveDraft}>Simpan Draft</Button> : null}
            {!readOnly ? <Button size="sm" icon={Send} onClick={sendToOperational}>Kirim ke Operational</Button> : null}
          </div>
        </div>
      </div>

      {readOnly ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
          Job sudah dikirim ke Operational. Data utama terkunci untuk Sales.
        </div>
      ) : null}

      {missingFields.length ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          Lengkapi data wajib: {missingFields.join(', ')}.
        </div>
      ) : null}

      <Card>
        <CardHeader
          title="Daftar Orderan"
          description={`${orderRows.length} orderan dimasukkan. Order pertama menjadi data utama job.`}
          action={!readOnly ? <Button size="sm" icon={Plus} onClick={() => setEditingOrder(createBlankOrder())}>Tambah Order</Button> : null}
        />
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Nomor Job</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-950">{form.jobNumber}</p>
            </div>
            {missingFields.includes('Orderan') ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                Minimal satu orderan wajib dimasukkan sebelum dikirim ke Operational.
              </div>
            ) : null}
          </div>
          {orderRows.length ? (
            <DataTable columns={orderColumns} rows={orderRows} showActions={false} />
          ) : (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-5 text-center">
              <p className="text-sm font-semibold text-slate-950">Belum ada orderan</p>
              <p className="mt-1 text-xs text-slate-500">Klik Tambah Order untuk memasukkan customer, vessel, tujuan, tanggal, dan PIC.</p>
              {!readOnly ? <Button className="mt-3" size="sm" icon={Plus} onClick={() => setEditingOrder(createBlankOrder())}>Tambah Order</Button> : null}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-2.5 xl:grid-cols-2">
        <DocumentBox
          title="Surat Penunjukan"
          document={form.documents.appointmentLetter}
          disabled={readOnly}
          error={missingFields.includes('Surat Penunjukan') ? 'Surat Penunjukan wajib diunggah sebelum dikirim.' : ''}
          onAdd={(files) => addFiles('appointmentLetter', files)}
          onRemove={(fileId) => removeFile('appointmentLetter', fileId)}
        />
      </div>

      <OrderModal
        open={Boolean(editingOrder)}
        order={editingOrder}
        masterData={masterData}
        errors={{
          customer: fieldError('customer'),
          endUser: fieldError('endUser'),
          vessel: fieldError('vessel'),
          activityType: fieldError('activityType'),
          dropPoint: fieldError('dropPoint'),
          startDate: fieldError('startDate'),
          customerPic: fieldError('customerPic'),
        }}
        onClose={() => setEditingOrder(null)}
        onSave={saveOrder}
      />
    </div>
  )
}

function OrderModal({ open, order, masterData, errors, onClose, onSave }) {
  const [form, setForm] = useState(order ?? createBlankOrder())
  const customers = useMemo(() => activeRows(masterData.customers, form.customer), [form.customer, masterData.customers])
  const endUsers = useMemo(() => {
    const values = customers.map((customer) => customer.endUser).filter(Boolean)
    return [...new Set([form.endUser, ...values].filter(Boolean))]
  }, [customers, form.endUser])
  const vessels = useMemo(() => activeRows(masterData.vessels, form.vessel), [form.vessel, masterData.vessels])

  useEffect(() => {
    setForm(order ?? createBlankOrder())
  }, [order])

  if (!open || !order) return null

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function selectCustomer(value) {
    const customer = customers.find((item) => item.nama === value)
    setForm((current) => ({
      ...current,
      customer: value,
      endUser: customer?.endUser ?? current.endUser,
      customerPic: customer?.pic ?? current.customerPic,
    }))
  }

  return (
    <Modal
      open={open}
      title={`${order.customer ? 'Edit' : 'Tambah'} Orderan`}
      description="Input data orderan Sales secara compact. Data disimpan sebagai bagian dari draft Job."
      onClose={onClose}
      maxWidth="max-w-4xl"
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button icon={Save} onClick={() => onSave(form)}>Simpan Order</Button></>}
    >
      <div className="grid gap-3 md:grid-cols-3">
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
        <FormField label="Jenis Kegiatan" error={errors.activityType}>
          <SelectInput value={form.activityType} onChange={(event) => updateField('activityType', event.target.value)}>
            <option>Ekspor</option>
            <option>Impor</option>
            <option>Domestik</option>
          </SelectInput>
        </FormField>
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
    </Modal>
  )
}

function DocumentBox({ title, document, disabled, error, onAdd, onRemove }) {
  return (
    <Card>
      <CardHeader title={title} description="Simulasi upload: hanya metadata file yang disimpan." />
      <CardContent className="space-y-2">
        <label className={`grid min-h-[72px] place-items-center rounded-md border border-dashed px-3 py-3 text-center transition ${error ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'} ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-slate-100'}`}>
          <input disabled={disabled} type="file" multiple className="hidden" onChange={(event) => onAdd(event.target.files)} />
          <div className="flex items-center justify-center gap-2">
            <UploadCloud className="h-4 w-4 text-brand-700" />
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-800">{disabled ? 'Dokumen terkunci' : 'Klik untuk pilih file'}</p>
              <p className="text-[11px] text-slate-500">PDF, image, atau dokumen lain.</p>
            </div>
          </div>
        </label>
        {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}

        <div className="space-y-1.5">
          {document.files.length ? document.files.map((file) => (
            <div key={file.id} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800">{file.name}</p>
                  <p className="text-[11px] text-slate-500">{fileSize(file.size)} - {file.type}</p>
                </div>
              </div>
              {!disabled ? <Button variant="ghost" size="sm" onClick={() => onRemove(file.id)}>Hapus</Button> : null}
            </div>
          )) : (
            <p className="rounded-md bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">Belum ada file.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
