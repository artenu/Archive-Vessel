import { ArrowLeft, Download, Edit3, Eye, FileText, Plus, Save, Send, Trash2, UploadCloud } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { DataTable } from '../components/data-display/DataTable'
import { EmptyState } from '../components/feedback/EmptyState'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { FormField, SelectInput, TextInput } from '../components/ui/FormField'
import { Modal } from '../components/ui/Modal'
import { Tabs } from '../components/ui/Tabs'
import { findJobById } from '../data/jobs'
import { roles } from '../data/mockUsers'
import { useConfirm } from '../hooks/useConfirm'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { api } from '../services/mockApi'
import {
  calculateDsrDiff,
  calculateFinance,
  createFinanceData,
  createOperationalBarge,
  financeUploadCategories,
  formatCurrency,
  isBargeReadyForFinance,
  operationalUploadCategories,
  saveCreatedJob,
  updateFinanceJob,
  updateOperationalJob,
} from '../utils/jobStorage'
import { statusTone } from '../utils/statusTone'

const tabs = [
  { label: 'Ringkasan', value: 'summary' },
  { label: 'Operasional', value: 'operational' },
  { label: 'Keuangan', value: 'finance' },
  { label: 'Dokumen', value: 'documents' },
]

function formatDate(value) {
  if (!value || value === '-') return '-'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function formatDateTime(value) {
  if (!value || value === '-') return '-'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-0.5 truncate text-xs font-semibold text-slate-900">{value || '-'}</p>
    </div>
  )
}

export function JobDetailPage() {
  const { jobId } = useParams()
  const { user } = useAuth()
  const { notify } = useToast()
  const { confirm } = useConfirm()
  const [job, setJob] = useState(() => findJobById(jobId))
  const [activeTab, setActiveTab] = useState('summary')

  useEffect(() => {
    setJob(findJobById(jobId))
  }, [jobId])

  const archiveRows = useMemo(() => (job ? buildDocumentRows(job) : []), [job])

  if (!job) {
    return (
      <EmptyState
        title="Pekerjaan tidak ditemukan"
        description="Data mock tidak memiliki pekerjaan dengan ID tersebut."
        action={<Button asChild variant="secondary" icon={ArrowLeft}><Link to="/pekerjaan">Kembali</Link></Button>}
      />
    )
  }

  const backPath = user?.role === 'operational' ? '/operational/jobs' : user?.role === 'finance' ? '/finance/jobs' : '/pekerjaan'
  const canEditSalesDraft = job.source === 'sales' && job.salesStatus === 'DRAFT' && ['admin', 'sales'].includes(user?.role)
  const showOperational = job.source === 'sales' && ['OPERATIONAL', 'FINANCE', 'SELESAI'].includes(job.operationalStatus)
  const showFinance = job.source === 'sales' && ['FINANCE', 'SELESAI'].includes(job.operationalStatus)

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <Button asChild variant="ghost" size="sm" icon={ArrowLeft} className="-ml-2 mb-1">
                <Link to={backPath}>Kembali</Link>
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-semibold text-slate-950">{job.jobNumber}</h1>
                <Badge tone={statusTone(job.operationalStatus)}>{job.operationalStatus}</Badge>
              </div>
            </div>
            {canEditSalesDraft ? (
              <Button asChild size="sm" icon={Edit3}>
                <Link to={`/sales/jobs/${job.id}/edit`}>Edit Draft</Link>
              </Button>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            <Info label="Vessel" value={job.vessel} />
            <Info label="Customer" value={job.customer} />
            <Info label="End User" value={job.endUser} />
            <Info label="Jenis Kegiatan" value={job.activityType} />
            <Info label="Tujuan" value={job.dropPoint} />
            <Info label="Tanggal" value={formatDate(job.startDate)} />
            <Info label="Role Aktif" value={roles[user?.role]} />
          </div>
        </CardContent>
      </Card>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'summary' ? <SummaryTab job={job} /> : null}
      {activeTab === 'operational' ? (
        <OperationalTab
          job={job}
          userRole={user?.role}
          onChange={setJob}
          notify={notify}
          confirm={confirm}
          enabled={showOperational}
        />
      ) : null}
      {activeTab === 'finance' ? (
        <FinanceTab
          job={job}
          userRole={user?.role}
          onChange={setJob}
          notify={notify}
          confirm={confirm}
          enabled={showFinance}
        />
      ) : null}
      {activeTab === 'documents' ? <DocumentsTab rows={archiveRows} /> : null}
    </div>
  )
}

function SummaryTab({ job }) {
  const timeline = buildTimeline(job)

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader title="Informasi Dasar" description="Data pekerjaan dari Sales sampai status terakhir." />
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Nomor Job" value={job.jobNumber} />
          <Info label="Customer" value={job.customer} />
          <Info label="End User" value={job.endUser} />
          <Info label="PIC Customer" value={job.customerPic} />
          <Info label="Vessel" value={job.vessel} />
          <Info label="Jenis Kegiatan" value={job.activityType} />
          <Info label="Tujuan / Drop Point" value={job.dropPoint} />
          <Info label="Tanggal Pekerjaan" value={formatDate(job.startDate)} />
          <Info label="Estimasi / Volume" value={job.volume} />
          <Info label="Status Invoice" value={job.invoiceStatus} />
          <Info label="Status Bayar" value={job.paymentStatus} />
          <Info label="Outstanding" value={job.outstandingTotal} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Timeline" description="Alur sederhana tanpa workflow tambahan." />
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4">
            {timeline.map((item) => (
              <div key={item.label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-950">{item.label}</p>
                  <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{item.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function OperationalTab({ job, userRole, onChange, notify, confirm, enabled }) {
  const [editing, setEditing] = useState(null)
  const canManage = enabled && ['admin', 'operational'].includes(userRole) && job.operationalStatus === 'OPERATIONAL'
  const barges = job.barges ?? []
  const readyForFinance = barges.length > 0 && barges.every(isBargeReadyForFinance)

  function persist(nextBarges, status = job.operationalStatus) {
    const nextJob = updateOperationalJob(job, nextBarges, status)
    saveCreatedJob(nextJob)
    onChange(nextJob)
    return nextJob
  }

  function saveBarge(barge) {
    const exists = barges.some((item) => item.id === barge.id)
    const nextBarges = exists ? barges.map((item) => (item.id === barge.id ? barge : item)) : [barge, ...barges]
    persist(nextBarges)
    setEditing(null)
    notify({ title: 'Data barge tersimpan', description: `${barge.tugBoat || '-'} / ${barge.barge || '-'}`, type: 'success' })
  }

  function deleteBarge(barge) {
    confirm({
      title: 'Hapus data barge?',
      description: `${barge.tugBoat || '-'} / ${barge.barge || '-'} akan dihapus dari job ini.`,
      onConfirm: () => {
        persist(barges.filter((item) => item.id !== barge.id))
        notify({ title: 'Barge dihapus', description: job.jobNumber, type: 'info' })
      },
    })
  }

  function sendToFinance() {
    if (!readyForFinance) {
      notify({ title: 'Data operasional belum lengkap', description: 'Isi RKBM, Final DSR, dan Vessel Complete untuk setiap barge.', type: 'error' })
      return
    }

    confirm({
      title: 'Kirim job ke Finance?',
      description: `${job.jobNumber} akan berubah status menjadi FINANCE.`,
      onConfirm: () => {
        const nextJob = persist(barges, 'FINANCE')
        notify({ title: 'Job dikirim ke Finance', description: nextJob.jobNumber, type: 'success' })
      },
    })
  }

  const columns = [
    { key: 'pair', label: 'Tug Boat / Barge', render: (row) => `${row.tugBoat || '-'} / ${row.barge || '-'}` },
    { key: 'rkbmNo', label: 'No. RKBM' },
    { key: 'dsrStart', label: 'DSR Awal', render: (row) => Number(row.dsrStart || 0).toLocaleString('id-ID') },
    { key: 'finalDsr', label: 'Final DSR', render: (row) => Number(row.finalDsr || 0).toLocaleString('id-ID') },
    { key: 'dsrDiff', label: 'Selisih', render: (row) => <DsrDiff value={calculateDsrDiff(row)} /> },
    { key: 'vesselComplete', label: 'Vessel Complete', render: (row) => <Badge tone={row.vesselComplete ? 'success' : 'warning'}>{row.vesselComplete ? 'Ya' : 'Belum'}</Badge> },
    {
      key: 'docs',
      label: 'Dokumen',
      render: (row) => `${Object.values(row.uploads ?? {}).flat().length} file`,
    },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (row) => canManage ? (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" icon={Edit3} aria-label={`Edit ${row.barge}`} onClick={() => setEditing(row)} />
          <Button variant="ghost" size="icon-sm" icon={Trash2} aria-label={`Hapus ${row.barge}`} onClick={() => deleteBarge(row)} />
        </div>
      ) : null,
    },
  ]

  if (!enabled) {
    return <EmptyState title="Operasional belum tersedia" description="Job perlu dikirim Sales ke Operational terlebih dahulu." />
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader
          title="Operasional"
          description="Daftar barge, RKBM, DSR, Vessel Complete, dan dokumen operasional."
          action={
            <div className="flex gap-1.5">
              {canManage ? <Button size="sm" icon={Plus} onClick={() => setEditing(createOperationalBarge())}>Tambah Barge</Button> : null}
              {canManage ? <Button size="sm" icon={Send} disabled={!readyForFinance} onClick={sendToFinance}>Kirim ke Finance</Button> : null}
            </div>
          }
        />
        <CardContent>
          {barges.length ? <DataTable columns={columns} rows={barges} showActions={false} /> : <EmptyState title="Belum ada barge" description="Tambahkan pasangan Tug Boat dan Barge untuk memproses job ini." />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Dokumen Operasional" description="Ringkasan file operasional per barge." />
        <CardContent>
          <DataTable
            columns={[
              { key: 'bargeName', label: 'Barge' },
              { key: 'category', label: 'Kategori' },
              { key: 'files', label: 'File' },
            ]}
            rows={buildOperationalDocSummary(barges)}
            showActions={false}
          />
        </CardContent>
      </Card>

      <BargeModal open={Boolean(editing)} barge={editing} onClose={() => setEditing(null)} onSave={saveBarge} />
    </div>
  )
}

function FinanceTab({ job, userRole, onChange, notify, confirm, enabled }) {
  const [form, setForm] = useState(() => createFinanceData(job.finance))
  const [missingFields, setMissingFields] = useState([])
  const canManage = enabled && ['admin', 'finance'].includes(userRole) && job.operationalStatus === 'FINANCE'
  const totals = calculateFinance(job, form)

  useEffect(() => {
    setForm(createFinanceData(job.finance))
  }, [job.finance])

  function updateField(key, value) {
    setMissingFields([])
    setForm((current) => ({ ...current, [key]: value }))
  }

  function addFiles(category, fileList) {
    const files = Array.from(fileList ?? []).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
      uploadedAt: new Date().toISOString(),
    }))
    setForm((current) => ({
      ...current,
      uploads: {
        ...current.uploads,
        [category]: [...(current.uploads?.[category] ?? []), ...files],
      },
    }))
  }

  function removeFile(category, fileId) {
    setForm((current) => ({
      ...current,
      uploads: {
        ...current.uploads,
        [category]: (current.uploads?.[category] ?? []).filter((file) => file.id !== fileId),
      },
    }))
  }

  function saveFinance() {
    setMissingFields([])
    const nextJob = updateFinanceJob(job, form, 'FINANCE')
    saveCreatedJob(nextJob)
    onChange(nextJob)
    notify({ title: 'Data finance tersimpan', description: nextJob.jobNumber, type: 'success' })
  }

  function completeJob() {
    const missing = []
    if (!form.invoiceNo) missing.push('Nomor Invoice')
    if (!form.invoiceDate) missing.push('Tanggal Invoice')
    if (!form.paymentDate) missing.push('Tanggal Bayar')
    if (form.paymentStatus !== 'LUNAS') missing.push('Status LUNAS')

    setMissingFields(missing)
    if (missing.length) {
      notify({ title: 'Data belum lengkap', description: missing.slice(0, 4).join(', '), type: 'error' })
      return
    }

    confirm({
      title: 'Selesaikan job?',
      description: `${job.jobNumber} akan berubah status menjadi SELESAI.`,
      onConfirm: () => {
        const nextJob = updateFinanceJob(job, form, 'SELESAI')
        saveCreatedJob(nextJob)
        onChange(nextJob)
        notify({ title: 'Job selesai', description: nextJob.jobNumber, type: 'success' })
      },
    })
  }

  if (!enabled) {
    return <EmptyState title="Keuangan belum tersedia" description="Job perlu dikirim Operational ke Finance terlebih dahulu." />
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader
          title="Keuangan"
          description="RKBM, PPN, invoice, PNBP, debit note, pembayaran, dan total job."
          action={
            <div className="flex gap-1.5">
              {canManage ? <Button variant="secondary" size="sm" icon={Save} onClick={saveFinance}>Simpan Finance</Button> : null}
              {canManage ? <Button size="sm" icon={Send} onClick={completeJob}>Selesaikan Job</Button> : null}
            </div>
          }
        />
        <CardContent className="space-y-3">
          {missingFields.length ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              Lengkapi data Finance: {missingFields.join(', ')}.
            </div>
          ) : null}
          <div className="grid gap-3 lg:grid-cols-4">
            <MoneyField label="Tarif RKBM Muat / MT" value={form.tariffRkbmMuatPerMt} disabled={!canManage} onChange={(value) => updateField('tariffRkbmMuatPerMt', value)} />
            <MoneyField label="RKBM Bongkar" value={form.rkbmBongkar} disabled={!canManage} onChange={(value) => updateField('rkbmBongkar', value)} />
            <MoneyField label="PPN (%)" value={form.ppn} disabled={!canManage} onChange={(value) => updateField('ppn', value)} />
            <MoneyField label="PNBP Jasa Barang" value={form.pnbpJasaBarang} disabled={!canManage} onChange={(value) => updateField('pnbpJasaBarang', value)} />
            <MoneyField label="PNBP Jasa PBM" value={form.pnbpJasaPbm} disabled={!canManage} onChange={(value) => updateField('pnbpJasaPbm', value)} />
            <FormField label="Nomor Invoice" error={missingFields.includes('Nomor Invoice') ? 'Wajib diisi sebelum job selesai.' : ''}><TextInput value={form.invoiceNo} disabled={!canManage} onChange={(event) => updateField('invoiceNo', event.target.value)} /></FormField>
            <FormField label="Tanggal Invoice" error={missingFields.includes('Tanggal Invoice') ? 'Wajib diisi sebelum job selesai.' : ''}><TextInput type="date" value={form.invoiceDate} disabled={!canManage} onChange={(event) => updateField('invoiceDate', event.target.value)} /></FormField>
            <FormField label="Nomor Debit Note"><TextInput value={form.debitNoteNo} disabled={!canManage} onChange={(event) => updateField('debitNoteNo', event.target.value)} /></FormField>
            <FormField label="Tanggal Debit Note"><TextInput type="date" value={form.debitNoteDate} disabled={!canManage} onChange={(event) => updateField('debitNoteDate', event.target.value)} /></FormField>
            <FormField label="Tanggal Bayar" error={missingFields.includes('Tanggal Bayar') ? 'Wajib diisi sebelum job selesai.' : ''}><TextInput type="date" value={form.paymentDate} disabled={!canManage} onChange={(event) => updateField('paymentDate', event.target.value)} /></FormField>
            <FormField label="Status Pembayaran" error={missingFields.includes('Status LUNAS') ? 'Pilih LUNAS sebelum job selesai.' : ''}>
              <SelectInput value={form.paymentStatus} disabled={!canManage} onChange={(event) => updateField('paymentStatus', event.target.value)}>
                <option>BELUM DITAGIH</option>
                <option>SUDAH DITAGIH</option>
                <option>LUNAS</option>
              </SelectInput>
            </FormField>
            <FormField label="Catatan" className="lg:col-span-2"><TextInput value={form.notes} disabled={!canManage} onChange={(event) => updateField('notes', event.target.value)} /></FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Rincian Per Barge" description="RKBM Muat dihitung dari Final DSR dikali tarif." />
        <CardContent>
          <DataTable
            columns={[
              { key: 'pair', label: 'Tug Boat / Barge', render: (row) => `${row.tugBoat || '-'} / ${row.barge || '-'}` },
              { key: 'finalDsr', label: 'Final DSR', render: (row) => Number(row.finalDsr || 0).toLocaleString('id-ID') },
              { key: 'tariff', label: 'Tarif / MT', render: (row) => formatCurrency(row.tariff) },
              { key: 'rkbmMuat', label: 'RKBM Muat', render: (row) => formatCurrency(row.rkbmMuat) },
            ]}
            rows={totals.perBarge}
            showActions={false}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Total Job" description="Total RKBM, invoice, reimbursement, debit note, dan pembayaran." />
        <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <TotalBox label="Total RKBM Muat" value={formatCurrency(totals.totalRkbmMuat)} />
          <TotalBox label="RKBM Bongkar" value={formatCurrency(totals.rkbmBongkar)} />
          <TotalBox label="Total RKBM" value={formatCurrency(totals.totalRkbm)} />
          <TotalBox label={`PPN ${totals.ppnRate}%`} value={formatCurrency(totals.ppnAmount)} />
          <TotalBox label="Total Invoice" value={formatCurrency(totals.totalInvoice)} tone="brand" />
          <TotalBox label="PNBP Barang" value={formatCurrency(totals.pnbpJasaBarang)} />
          <TotalBox label="PNBP PBM" value={formatCurrency(totals.pnbpJasaPbm)} />
          <TotalBox label="Total Reimbursement" value={formatCurrency(totals.totalReimbursement)} tone="success" />
          <TotalBox label="Debit Note" value={form.debitNoteNo || '-'} />
          <TotalBox label="Pembayaran" value={form.paymentStatus} tone={statusTone(form.paymentStatus)} />
        </CardContent>
      </Card>

      {canManage ? (
        <Card>
          <CardHeader title="Upload Finance" description="Upload mock untuk invoice, debit note, PNBP, dan pembayaran." />
          <CardContent className="grid gap-2 xl:grid-cols-4">
            {financeUploadCategories.map((category) => (
              <UploadRow
                key={category}
                category={category}
                files={form.uploads?.[category] ?? []}
                onAdd={(files) => addFiles(category, files)}
                onRemove={(fileId) => removeFile(category, fileId)}
              />
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function DocumentsTab({ rows }) {
  const columns = [
    { key: 'category', label: 'Kategori' },
    { key: 'name', label: 'Nama File' },
    { key: 'date', label: 'Tanggal' },
    { key: 'uploader', label: 'Uploader' },
    { key: 'source', label: 'Sumber' },
    {
      key: 'action',
      label: 'Aksi',
      render: () => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" icon={Eye} aria-label="Lihat file placeholder" />
          <Button variant="ghost" size="icon-sm" icon={Download} aria-label="Download placeholder" />
        </div>
      ),
    },
  ]

  return (
    <Card>
      <CardHeader title="Arsip Dokumen" description="Seluruh file yang pernah diupload dalam job ini." />
      <CardContent>
        {rows.length ? <DataTable columns={columns} rows={rows} showActions={false} /> : <EmptyState title="Belum ada file" description="File Sales, Operational, dan Finance akan muncul di arsip ini." />}
      </CardContent>
    </Card>
  )
}

function DsrDiff({ value }) {
  const tone = value > 0 ? 'success' : value < 0 ? 'danger' : 'brand'
  const label = `${value > 0 ? '+' : ''}${Number(value || 0).toLocaleString('id-ID')}`
  return <Badge tone={tone}>{label}</Badge>
}

function MoneyField({ label, value, disabled, onChange }) {
  return (
    <FormField label={label}>
      <TextInput type="number" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} placeholder="0" />
    </FormField>
  )
}

function TotalBox({ label, value, tone = 'neutral' }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 truncate text-xs font-semibold text-slate-950">{value}</p>
      {tone !== 'neutral' ? <Badge className="mt-2" tone={tone}>{value}</Badge> : null}
    </div>
  )
}

function BargeModal({ open, barge, onClose, onSave }) {
  const [form, setForm] = useState(barge ?? createOperationalBarge())
  const [errors, setErrors] = useState({})
  const masterData = useMemo(() => api.masterData.list(), [])
  const tugBoats = useMemo(() => activeMasterRows(masterData.tugBoats, form.tugBoat), [form.tugBoat, masterData.tugBoats])
  const barges = useMemo(() => activeMasterRows(masterData.barges, form.barge), [form.barge, masterData.barges])

  useEffect(() => {
    setForm(barge ?? createOperationalBarge())
    setErrors({})
  }, [barge])

  if (!open || !barge) return null

  function updateField(key, value) {
    setErrors((current) => ({ ...current, [key]: '' }))
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSave() {
    const nextErrors = {
      tugBoat: String(form.tugBoat ?? '').trim() ? '' : 'Tug Boat wajib dipilih.',
      barge: String(form.barge ?? '').trim() ? '' : 'Barge wajib dipilih.',
    }
    setErrors(nextErrors)
    if (nextErrors.tugBoat || nextErrors.barge) return
    onSave(form)
  }

  function addFiles(category, fileList) {
    const files = Array.from(fileList ?? []).map((file) => createFileMetadata(file))
    setForm((current) => ({
      ...current,
      uploads: {
        ...current.uploads,
        [category]: [...(current.uploads?.[category] ?? []), ...files],
      },
    }))
  }

  function removeFile(category, fileId) {
    setForm((current) => ({
      ...current,
      uploads: {
        ...current.uploads,
        [category]: (current.uploads?.[category] ?? []).filter((file) => file.id !== fileId),
      },
    }))
  }

  return (
    <Modal
      open={open}
      title="Data Tug Boat & Barge"
      description="Input operasional sederhana dan upload metadata dokumen."
      onClose={onClose}
      maxWidth="max-w-5xl"
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button icon={Save} onClick={handleSave}>Simpan</Button></>}
    >
      <div className="grid gap-3 xl:grid-cols-[1fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Tug Boat" error={errors.tugBoat}>
            <SelectInput value={form.tugBoat} onChange={(event) => updateField('tugBoat', event.target.value)}>
              <option value="">Pilih Tug Boat</option>
              {tugBoats.map((item) => <option key={item.id ?? item.nama} value={item.nama}>{item.nama}</option>)}
            </SelectInput>
          </FormField>
          <FormField label="Barge" error={errors.barge}>
            <SelectInput value={form.barge} onChange={(event) => updateField('barge', event.target.value)}>
              <option value="">Pilih Barge</option>
              {barges.map((item) => <option key={item.id ?? item.nama} value={item.nama}>{item.nama}</option>)}
            </SelectInput>
          </FormField>
          <FormField label="Tanggal Nominasi"><TextInput type="date" value={form.nominationDate} onChange={(event) => updateField('nominationDate', event.target.value)} /></FormField>
          <FormField label="Nomor RKBM"><TextInput value={form.rkbmNo} onChange={(event) => updateField('rkbmNo', event.target.value)} /></FormField>
          <FormField label="Tanggal Terbit RKBM"><TextInput type="date" value={form.rkbmIssueDate} onChange={(event) => updateField('rkbmIssueDate', event.target.value)} /></FormField>
          <FormField label="Tanggal Mulai"><TextInput type="date" value={form.startDate} onChange={(event) => updateField('startDate', event.target.value)} /></FormField>
          <FormField label="Tanggal Selesai"><TextInput type="date" value={form.finishDate} onChange={(event) => updateField('finishDate', event.target.value)} /></FormField>
          <FormField label="DSR Awal"><TextInput type="number" value={form.dsrStart} onChange={(event) => updateField('dsrStart', event.target.value)} /></FormField>
          <FormField label="Final DSR"><TextInput type="number" value={form.finalDsr} onChange={(event) => updateField('finalDsr', event.target.value)} /></FormField>
          <div className="flex items-end justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-500">Selisih DSR</p>
              <div className="mt-1"><DsrDiff value={calculateDsrDiff(form)} /></div>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input type="checkbox" className="h-3.5 w-3.5 accent-brand-700" checked={Boolean(form.vesselComplete)} onChange={(event) => updateField('vesselComplete', event.target.checked)} />
              Vessel Complete
            </label>
          </div>
        </div>

        <div className="space-y-2">
          {operationalUploadCategories.map((category) => (
            <UploadRow
              key={category}
              category={category}
              files={form.uploads?.[category] ?? []}
              onAdd={(files) => addFiles(category, files)}
              onRemove={(fileId) => removeFile(category, fileId)}
            />
          ))}
        </div>
      </div>
    </Modal>
  )
}

function UploadRow({ category, files, onAdd, onRemove }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-slate-900">{category}</p>
          <p className="text-[11px] text-slate-500">{files.length} file metadata</p>
        </div>
        <label className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          <UploadCloud className="h-3.5 w-3.5" />
          Upload
          <input type="file" multiple className="hidden" onChange={(event) => onAdd(event.target.files)} />
        </label>
      </div>
      {files.length ? (
        <div className="mt-2 space-y-1">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between gap-2 rounded bg-slate-50 px-2 py-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <p className="truncate text-[11px] font-medium text-slate-700">{file.name}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onRemove(file.id)}>Hapus</Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function buildTimeline(job) {
  const status = job.operationalStatus
  const created = formatDateTime(job.createdAt)
  const updated = formatDateTime(job.updatedAt)

  return [
    { label: 'Sales', status: ['DRAFT'].includes(status) ? 'Aktif' : 'Selesai', date: created },
    { label: 'Operational', status: status === 'OPERATIONAL' ? 'Aktif' : ['FINANCE', 'SELESAI'].includes(status) ? 'Selesai' : 'Menunggu', date: ['OPERATIONAL', 'FINANCE', 'SELESAI'].includes(status) ? updated : '-' },
    { label: 'Finance', status: status === 'FINANCE' ? 'Aktif' : status === 'SELESAI' ? 'Selesai' : 'Menunggu', date: ['FINANCE', 'SELESAI'].includes(status) ? updated : '-' },
    { label: 'Selesai', status: status === 'SELESAI' ? 'Selesai' : 'Menunggu', date: status === 'SELESAI' ? updated : '-' },
  ]
}

function buildOperationalDocSummary(barges) {
  return barges.flatMap((barge) =>
    Object.entries(barge.uploads ?? {}).map(([category, files]) => ({
      id: `${barge.id}-${category}`,
      bargeName: `${barge.tugBoat || '-'} / ${barge.barge || '-'}`,
      category,
      files: `${files.length} file`,
    })),
  )
}

function buildDocumentRows(job) {
  const rows = []

  Object.values(job.documents ?? {}).forEach((doc) => {
    ;(doc.files ?? []).forEach((file) => {
      rows.push(toDocumentRow(file, doc.title, 'Sales', 'Sales'))
    })
  })

  ;(job.barges ?? []).forEach((barge) => {
    Object.entries(barge.uploads ?? {}).forEach(([category, files]) => {
      files.forEach((file) => {
        rows.push(toDocumentRow(file, category, 'Operational', `${barge.tugBoat || '-'} / ${barge.barge || '-'}`))
      })
    })
  })

  Object.entries(job.finance?.uploads ?? {}).forEach(([category, files]) => {
    files.forEach((file) => {
      rows.push(toDocumentRow(file, category, 'Finance', 'Finance'))
    })
  })

  return rows
}

function toDocumentRow(file, category, uploader, source) {
  return {
    id: file.id ?? `${category}-${file.name}`,
    category,
    name: file.name ?? '-',
    date: file.uploadedAt ? formatDateTime(file.uploadedAt) : '-',
    uploader,
    source,
  }
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

function activeMasterRows(rows = [], currentValue = '') {
  const active = rows.filter((row) => row.status !== 'Nonaktif')
  if (!currentValue || active.some((row) => row.nama === currentValue)) return active
  const current = rows.find((row) => row.nama === currentValue) ?? { id: currentValue, nama: currentValue, status: 'Aktif' }
  return [current, ...active]
}
