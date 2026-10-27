import { AlertTriangle, CreditCard, FilePlus2, Plus, UploadCloud } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DataTable } from '../components/data-display/DataTable'
import { EmptyState } from '../components/feedback/EmptyState'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { FormField, SelectInput, TextInput } from '../components/ui/FormField'
import { Modal } from '../components/ui/Modal'
import { useToast } from '../hooks/useToast'
import {
  agingBucket,
  createDebitNote,
  createInvoice,
  createPayment,
  createPnbp,
  currency,
  daysUntil,
  dueBadgeTone,
  financeTariffs,
  getBillableJobs,
  getBillableRkbmOptions,
  getFinanceState,
  roundRupiah,
} from '../utils/financeStorage'
import { statusTone } from '../utils/statusTone'

function fileMeta(file) {
  if (!file) return null
  return {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    type: file.type || 'unknown',
  }
}

function refreshFinance() {
  return getFinanceState()
}

function Stat({ label, value, tone = 'brand' }) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
        <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
        <Badge className="mt-2" tone={tone}>Mock Finance</Badge>
      </CardContent>
    </Card>
  )
}

function UploadInput({ label, file, onChange }) {
  return (
    <label className="block rounded-md border border-dashed border-slate-200 bg-slate-50 p-3">
      <input type="file" className="hidden" onChange={(event) => onChange(fileMeta(event.target.files?.[0]))} />
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <UploadCloud className="h-4 w-4 text-brand-700" />
        {label}
      </div>
      <p className="mt-1 truncate text-xs text-slate-500">{file?.name ?? 'Belum ada file dipilih'}</p>
    </label>
  )
}

export function JobSiapDitagihkanPage() {
  const [open, setOpen] = useState(false)
  const billableJobs = useMemo(() => getBillableJobs(), [])
  const billableRkbm = useMemo(() => getBillableRkbmOptions(), [])

  const rows = billableJobs.map((job) => ({
    ...job,
    rkbmCount: job.billableBarges.length,
    subtotal: job.invoiceCalculation.subtotal,
    ppn: job.invoiceCalculation.ppn,
    total: job.invoiceCalculation.total,
  }))

  return (
    <div className="space-y-4">
      <FinanceHeader title="Job Siap Ditagihkan" description="Pekerjaan Vessel Complete yang memiliki Final DSR dan siap dibuatkan invoice." action={<Button icon={FilePlus2} onClick={() => setOpen(true)}>Buat Invoice</Button>} />
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Job Siap Ditagihkan" value={rows.length} />
        <Stat label="RKBM Final DSR" value={billableRkbm.length} tone="success" />
        <Stat label="Estimasi Invoice" value={currency(rows.reduce((sum, row) => sum + row.total, 0))} tone="warning" />
      </div>
      <Card>
        <CardHeader title="Perhitungan per Job" description={`Tarif RKBM Muat ${currency(financeTariffs.muatPerMt)} / MT, RKBM Bongkar tarif tetap ${currency(financeTariffs.bongkarFixed)}.`} />
        <CardContent>
          {rows.length ? (
            <DataTable
              rows={rows}
              showActions={false}
              columns={[
                { key: 'jobNumber', label: 'Nomor Job' },
                { key: 'customer', label: 'Customer' },
                { key: 'vessel', label: 'Vessel' },
                { key: 'rkbmCount', label: 'RKBM' },
                { key: 'subtotal', label: 'Subtotal Jasa', render: (row) => currency(row.subtotal) },
                { key: 'ppn', label: 'PPN 11%', render: (row) => currency(row.ppn) },
                { key: 'total', label: 'Total Invoice', render: (row) => <span className="font-semibold text-slate-950">{currency(row.total)}</span> },
              ]}
            />
          ) : <EmptyState title="Belum ada job siap ditagihkan" description="Final DSR harus dikonfirmasi dan status job minimal Vessel Complete." />}
        </CardContent>
      </Card>
      <Card>
        <CardHeader title="Rincian per Barge" description="Rincian RKBM Muat/Bongkar berdasarkan Final DSR dan tarif." />
        <CardContent>
          <RkbmLineTable rows={billableRkbm} />
        </CardContent>
      </Card>
      <InvoiceModal open={open} onClose={() => setOpen(false)} rkbmOptions={billableRkbm} />
    </div>
  )
}

function RkbmLineTable({ rows }) {
  if (!rows.length) return <EmptyState title="RKBM belum tersedia" description="Tidak ada barge dengan Final DSR." />
  return (
    <DataTable
      rows={rows}
      showActions={false}
      columns={[
        { key: 'rkbmNo', label: 'Nomor RKBM' },
        { key: 'jobNumber', label: 'Job' },
        { key: 'barge', label: 'Barge', render: (row) => `${row.tugBoat} / ${row.barge}` },
        { key: 'rkbmType', label: 'Jenis' },
        { key: 'finalDsr', label: 'Final DSR', render: (row) => `${Number(row.finalDsr).toLocaleString('id-ID')} MT` },
        { key: 'muat', label: 'RKBM Muat', render: (row) => currency(row.muat) },
        { key: 'bongkar', label: 'RKBM Bongkar', render: (row) => currency(row.bongkar) },
        { key: 'subtotal', label: 'Subtotal', render: (row) => currency(row.subtotal) },
      ]}
    />
  )
}

function InvoiceModal({ open, onClose, rkbmOptions }) {
  const { notify } = useToast()
  const [selectedIds, setSelectedIds] = useState(rkbmOptions.slice(0, 2).map((item) => item.id))
  const [manualBongkarRates, setManualBongkarRates] = useState({})
  const [form, setForm] = useState({
    invoiceNo: `INV/AG/2026/${String(Date.now()).slice(-4)}`,
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    taxInvoiceNo: '',
    notes: '',
    files: [],
  })

  const selected = rkbmOptions
    .filter((item) => selectedIds.includes(item.id))
    .map((item) => {
      const manual = Number(manualBongkarRates[item.id] || 0)
      if (item.rkbmType !== 'Bongkar' || !manual) return item
      const bongkar = roundRupiah(manual)
      return { ...item, bongkar, subtotal: roundRupiah(item.muat + bongkar) }
    })
  const subtotal = roundRupiah(selected.reduce((sum, item) => sum + item.subtotal, 0))
  const ppn = roundRupiah(subtotal * 0.11)
  const total = roundRupiah(subtotal + ppn)

  function submit() {
    if (!selectedIds.length || !form.invoiceNo || !form.invoiceDate || !form.dueDate) {
      notify({ title: 'Data invoice belum lengkap', description: 'Pilih RKBM dan lengkapi nomor, tanggal invoice, serta jatuh tempo.', type: 'error' })
      return
    }
    const invoice = createInvoice({ ...form, rkbmIds: selectedIds, manualBongkarRates })
    notify({ title: 'Invoice dibuat', description: `${invoice.invoiceNo} senilai ${currency(invoice.total)}.`, type: 'success' })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="max-w-5xl"
      title="Buat Invoice"
      description="Pilih beberapa RKBM dalam satu invoice dan lengkapi metadata invoice."
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button onClick={submit}>Simpan Invoice</Button></>}
    >
      <div className="grid max-h-[72vh] gap-4 overflow-y-auto pr-1 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-3">
          {rkbmOptions.map((item) => (
            <label key={item.id} className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-brand-700"
                checked={selectedIds.includes(item.id)}
                onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950">{item.rkbmNo}</p>
                <p className="mt-1 text-xs text-slate-500">{item.jobNumber} - {item.tugBoat} / {item.barge}</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">{currency(item.subtotal)}</p>
                {item.rkbmType === 'Bongkar' ? (
                  <div className="mt-2">
                    <label className="text-xs font-semibold text-slate-500">Tarif Bongkar Manual</label>
                    <input
                      type="number"
                      className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                      placeholder={String(financeTariffs.bongkarFixed)}
                      value={manualBongkarRates[item.id] ?? ''}
                      onChange={(event) => setManualBongkarRates((current) => ({ ...current, [item.id]: event.target.value }))}
                    />
                  </div>
                ) : null}
              </div>
            </label>
          ))}
        </div>
        <div className="space-y-4">
          <FormField label="Nomor Invoice"><TextInput value={form.invoiceNo} onChange={(event) => setForm({ ...form, invoiceNo: event.target.value })} /></FormField>
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Tanggal Invoice"><TextInput type="date" value={form.invoiceDate} onChange={(event) => setForm({ ...form, invoiceDate: event.target.value })} /></FormField>
            <FormField label="Jatuh Tempo"><TextInput type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></FormField>
          </div>
          <FormField label="Faktur Pajak"><TextInput value={form.taxInvoiceNo} onChange={(event) => setForm({ ...form, taxInvoiceNo: event.target.value })} placeholder="Nomor faktur pajak" /></FormField>
          <FormField label="Catatan"><TextInput value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Catatan invoice" /></FormField>
          <UploadInput label="Upload Dokumen Invoice" file={form.files[0]} onChange={(file) => setForm({ ...form, files: file ? [file] : [] })} />
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <SummaryAmount label="Subtotal Jasa" value={subtotal} />
            <SummaryAmount label="PPN 11%" value={ppn} />
            <SummaryAmount label="Total Invoice" value={total} strong />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function InvoicePage() {
  const [state, setState] = useState(() => refreshFinance())
  const invoices = state.invoices
  const totalOutstanding = invoices.reduce((sum, item) => sum + Number(item.outstanding || 0), 0)

  function reload() {
    setState(refreshFinance())
  }

  return (
    <div className="space-y-4">
      <FinanceHeader title="Invoice" description="Status invoice dipisahkan dari debit note dan pembayaran." action={<Button variant="secondary" onClick={reload}>Muat Ulang</Button>} />
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Total Invoice" value={invoices.length} />
        <Stat label="Outstanding Invoice" value={currency(totalOutstanding)} tone="danger" />
        <Stat label="Invoice Jatuh Tempo" value={invoices.filter((item) => daysUntil(item.dueDate) <= 7).length} tone="warning" />
      </div>
      <Card>
        <CardHeader title="Daftar Invoice" description="Badge jatuh tempo mengikuti tanggal due date." />
        <CardContent>
          <DataTable
            rows={invoices}
            showActions={false}
            columns={[
              { key: 'invoiceNo', label: 'Nomor Invoice' },
              { key: 'invoiceDate', label: 'Tanggal' },
              { key: 'dueDate', label: 'Jatuh Tempo', render: (row) => <Badge tone={dueBadgeTone(row.dueDate)}>{row.dueDate} ({daysUntil(row.dueDate)} hari)</Badge> },
              { key: 'taxInvoiceNo', label: 'Faktur Pajak' },
              { key: 'total', label: 'Total', render: (row) => currency(row.total) },
              { key: 'paid', label: 'Dibayar', render: (row) => currency(row.paid) },
              { key: 'outstanding', label: 'Outstanding', render: (row) => <span className="font-semibold text-slate-950">{currency(row.outstanding)}</span> },
              { key: 'status', label: 'Status', render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryAmount({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-b-0">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className={strong ? 'text-lg font-semibold text-slate-950' : 'text-sm font-bold text-slate-800'}>{currency(value)}</span>
    </div>
  )
}

function FinanceHeader({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase text-brand-700">Finance</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function PnbpPage() {
  const [state, setState] = useState(() => refreshFinance())
  const [open, setOpen] = useState(false)

  function reload() {
    setState(refreshFinance())
  }

  return (
    <div className="space-y-4">
      <FinanceHeader title="PNBP" description="Catat PNBP Jasa Barang dan PNBP Jasa PBM beserta bukti bayar." action={<Button icon={Plus} onClick={() => setOpen(true)}>Tambah PNBP</Button>} />
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Transaksi PNBP" value={state.pnbp.length} />
        <Stat label="PNBP Jasa Barang" value={currency(state.pnbp.filter((item) => item.type === 'PNBP Jasa Barang').reduce((sum, item) => sum + item.amount, 0))} tone="success" />
        <Stat label="PNBP Jasa PBM" value={currency(state.pnbp.filter((item) => item.type === 'PNBP Jasa PBM').reduce((sum, item) => sum + item.amount, 0))} tone="warning" />
      </div>
      <Card>
        <CardHeader title="Daftar PNBP" description="Data PNBP dapat dipilih dalam flow Debit Note." />
        <CardContent>
          <DataTable
            rows={state.pnbp}
            showActions={false}
            columns={[
              { key: 'type', label: 'Jenis PNBP' },
              { key: 'billingNo', label: 'Nomor Billing' },
              { key: 'ntpn', label: 'NTPN' },
              { key: 'paidDate', label: 'Tanggal Bayar' },
              { key: 'amount', label: 'Nominal', render: (row) => currency(row.amount) },
              { key: 'payer', label: 'Pihak Pembayar' },
              { key: 'status', label: 'Status', render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
            ]}
          />
        </CardContent>
      </Card>
      <PnbpModal open={open} onClose={() => setOpen(false)} onSaved={reload} />
    </div>
  )
}

function PnbpModal({ open, onClose, onSaved }) {
  const { notify } = useToast()
  const [form, setForm] = useState({
    type: 'PNBP Jasa Barang',
    billingNo: '',
    ntpn: '',
    paidDate: new Date().toISOString().slice(0, 10),
    amount: '',
    payer: '',
    proofFile: null,
  })

  function submit() {
    if (!form.billingNo || !form.ntpn || !form.amount || !form.payer) {
      notify({ title: 'PNBP belum lengkap', description: 'Nomor billing, NTPN, nominal, dan pihak pembayar wajib diisi.', type: 'error' })
      return
    }
    const pnbp = createPnbp(form)
    notify({ title: 'PNBP tercatat', description: `${pnbp.billingNo} senilai ${currency(pnbp.amount)}.`, type: 'success' })
    onSaved()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Tambah PNBP" description="PNBP disimpan sebagai mock data localStorage." footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button onClick={submit}>Simpan PNBP</Button></>}>
      <div className="grid gap-4">
        <FormField label="Jenis PNBP">
          <SelectInput value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            <option>PNBP Jasa Barang</option>
            <option>PNBP Jasa PBM</option>
          </SelectInput>
        </FormField>
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Nomor Billing"><TextInput value={form.billingNo} onChange={(event) => setForm({ ...form, billingNo: event.target.value })} /></FormField>
          <FormField label="NTPN"><TextInput value={form.ntpn} onChange={(event) => setForm({ ...form, ntpn: event.target.value })} /></FormField>
          <FormField label="Tanggal Bayar"><TextInput type="date" value={form.paidDate} onChange={(event) => setForm({ ...form, paidDate: event.target.value })} /></FormField>
          <FormField label="Nominal"><TextInput type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></FormField>
        </div>
        <FormField label="Pihak Pembayar"><TextInput value={form.payer} onChange={(event) => setForm({ ...form, payer: event.target.value })} /></FormField>
        <UploadInput label="Upload Bukti Bayar" file={form.proofFile} onChange={(file) => setForm({ ...form, proofFile: file })} />
      </div>
    </Modal>
  )
}

export function DebitNotePage() {
  const [state, setState] = useState(() => refreshFinance())
  const [open, setOpen] = useState(false)
  const totalOutstanding = state.debitNotes.reduce((sum, item) => sum + Number(item.outstanding || 0), 0)

  function reload() {
    setState(refreshFinance())
  }

  return (
    <div className="space-y-4">
      <FinanceHeader title="Debit Note" description="Debit Note memiliki status terpisah dari invoice dan dapat berisi beberapa transaksi PNBP." action={<Button icon={Plus} onClick={() => setOpen(true)}>Buat Debit Note</Button>} />
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Debit Note" value={state.debitNotes.length} />
        <Stat label="Outstanding Debit Note" value={currency(totalOutstanding)} tone="danger" />
        <Stat label="PNBP Belum Ditagihkan" value={state.pnbp.length} tone="warning" />
      </div>
      <Card>
        <CardHeader title="Daftar Debit Note" description="Status debit note dipisahkan dari status invoice." />
        <CardContent>
          <DataTable
            rows={state.debitNotes}
            showActions={false}
            columns={[
              { key: 'debitNoteNo', label: 'Nomor Debit Note' },
              { key: 'debitNoteDate', label: 'Tanggal' },
              { key: 'customer', label: 'Customer' },
              { key: 'transactions', label: 'Transaksi PNBP', render: (row) => `${row.pnbpIds.length} transaksi` },
              { key: 'total', label: 'Total', render: (row) => currency(row.total) },
              { key: 'paid', label: 'Dibayar', render: (row) => currency(row.paid) },
              { key: 'outstanding', label: 'Outstanding', render: (row) => currency(row.outstanding) },
              { key: 'status', label: 'Status Debit Note', render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
            ]}
          />
        </CardContent>
      </Card>
      <DebitNoteModal open={open} onClose={() => setOpen(false)} pnbp={state.pnbp} onSaved={reload} />
    </div>
  )
}

function DebitNoteModal({ open, onClose, pnbp, onSaved }) {
  const { notify } = useToast()
  const [selectedIds, setSelectedIds] = useState(pnbp.slice(0, 1).map((item) => item.id))
  const [form, setForm] = useState({
    debitNoteNo: `DN/AG/2026/${String(Date.now()).slice(-4)}`,
    debitNoteDate: new Date().toISOString().slice(0, 10),
    customer: 'PT Lintas Samudera Energi',
    notes: '',
  })
  const selected = pnbp.filter((item) => selectedIds.includes(item.id))
  const total = selected.reduce((sum, item) => sum + Number(item.amount || 0), 0)

  function submit() {
    if (!selectedIds.length || !form.debitNoteNo || !form.customer) {
      notify({ title: 'Debit note belum lengkap', description: 'Pilih transaksi PNBP dan lengkapi nomor debit note/customer.', type: 'error' })
      return
    }
    const debitNote = createDebitNote({ ...form, pnbpIds: selectedIds })
    notify({ title: 'Debit Note dibuat', description: `${debitNote.debitNoteNo} senilai ${currency(debitNote.total)}.`, type: 'success' })
    onSaved()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-4xl" title="Buat Debit Note" description="Pilih beberapa transaksi PNBP dalam satu debit note." footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button onClick={submit}>Simpan Debit Note</Button></>}>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-2">
          {pnbp.map((item) => (
            <label key={item.id} className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-brand-700"
                checked={selectedIds.includes(item.id)}
                onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))}
              />
              <div>
                <p className="text-sm font-semibold text-slate-950">{item.billingNo}</p>
                <p className="mt-1 text-xs text-slate-500">{item.type} - {item.ntpn}</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">{currency(item.amount)}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="space-y-4">
          <FormField label="Nomor Debit Note"><TextInput value={form.debitNoteNo} onChange={(event) => setForm({ ...form, debitNoteNo: event.target.value })} /></FormField>
          <FormField label="Tanggal Debit Note"><TextInput type="date" value={form.debitNoteDate} onChange={(event) => setForm({ ...form, debitNoteDate: event.target.value })} /></FormField>
          <FormField label="Customer"><TextInput value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} /></FormField>
          <FormField label="Catatan"><TextInput value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></FormField>
          <div className="rounded-lg bg-slate-50 p-4">
            <SummaryAmount label="Total Debit Note" value={total} strong />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function PembayaranPage() {
  const [state, setState] = useState(() => refreshFinance())
  const [open, setOpen] = useState(false)
  const targets = getPaymentTargets(state)
  const totalOutstanding = targets.reduce((sum, item) => sum + Number(item.outstanding || 0), 0)
  const aging = ['0-30', '31-60', '61-90', '>90'].map((bucket) => ({
    bucket,
    value: targets.filter((item) => agingBucket(item) === bucket).reduce((sum, item) => sum + Number(item.outstanding || 0), 0),
  }))

  function reload() {
    setState(refreshFinance())
  }

  return (
    <div className="space-y-4">
      <FinanceHeader title="Pembayaran" description="Catat pembayaran penuh atau sebagian dan hitung sisa outstanding otomatis." action={<Button icon={CreditCard} onClick={() => setOpen(true)}>Catat Pembayaran</Button>} />
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Target Tagihan" value={targets.length} />
        <Stat label="Outstanding" value={currency(totalOutstanding)} tone="danger" />
        <Stat label="Pembayaran Tercatat" value={state.payments.length} tone="success" />
        <Stat label="Lewat Tempo" value={targets.filter((item) => daysUntil(item.dueDate ?? item.debitNoteDate) < 0).length} tone="warning" />
      </div>

      <Card>
        <CardHeader title="Aging Piutang" description="Bucket aging dihitung dari jatuh tempo invoice atau tanggal debit note." />
        <CardContent className="grid gap-3 md:grid-cols-4">
          {aging.map((item) => (
            <div key={item.bucket} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">{item.bucket} hari</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{currency(item.value)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Outstanding Invoice dan Debit Note" description="Badge jatuh tempo dan status pembayaran otomatis berubah setelah pembayaran dicatat." />
        <CardContent>
          {targets.length ? (
            <DataTable
              rows={targets}
              showActions={false}
              columns={[
                { key: 'type', label: 'Jenis' },
                { key: 'number', label: 'Nomor' },
                { key: 'date', label: 'Tanggal' },
                { key: 'dueDate', label: 'Jatuh Tempo', render: (row) => <DueBadge row={row} /> },
                { key: 'total', label: 'Total', render: (row) => currency(row.total) },
                { key: 'paid', label: 'Dibayar', render: (row) => currency(row.paid) },
                { key: 'outstanding', label: 'Sisa Outstanding', render: (row) => <span className="font-semibold text-slate-950">{currency(row.outstanding)}</span> },
                { key: 'status', label: 'Status', render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
              ]}
            />
          ) : <EmptyState title="Tidak ada outstanding" description="Semua invoice dan debit note sudah lunas." />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Riwayat Pembayaran" description="Pembayaran penuh maupun sebagian tersimpan sebagai mock data." />
        <CardContent>
          {state.payments.length ? (
            <DataTable
              rows={state.payments}
              showActions={false}
              columns={[
                { key: 'targetType', label: 'Jenis Target' },
                { key: 'paidDate', label: 'Tanggal Bayar' },
                { key: 'amount', label: 'Nominal', render: (row) => currency(row.amount) },
                { key: 'method', label: 'Metode' },
                { key: 'referenceNo', label: 'No. Referensi' },
                { key: 'warning', label: 'Warning', render: (row) => row.warning ? <Badge tone="warning">{row.warning}</Badge> : <Badge tone="success">Sesuai</Badge> },
              ]}
            />
          ) : <EmptyState title="Belum ada pembayaran" description="Catat pembayaran untuk melihat riwayat." />}
        </CardContent>
      </Card>

      <PaymentModal open={open} onClose={() => setOpen(false)} targets={targets} onSaved={reload} />
    </div>
  )
}

function DueBadge({ row }) {
  const date = row.dueDate ?? row.debitNoteDate
  const days = daysUntil(date)
  const text = days < 0 ? `Lewat ${Math.abs(days)} hari` : `${days} hari`
  return <Badge tone={dueBadgeTone(date)}>{date} - {text}</Badge>
}

function getPaymentTargets(state) {
  const invoices = state.invoices
    .filter((item) => Number(item.outstanding || 0) > 0)
    .map((item) => ({
      ...item,
      type: 'Invoice',
      number: item.invoiceNo,
      date: item.invoiceDate,
    }))
  const debitNotes = state.debitNotes
    .filter((item) => Number(item.outstanding || 0) > 0)
    .map((item) => ({
      ...item,
      type: 'Debit Note',
      number: item.debitNoteNo,
      date: item.debitNoteDate,
      dueDate: item.debitNoteDate,
    }))
  return [...invoices, ...debitNotes]
}

function PaymentModal({ open, onClose, targets, onSaved }) {
  const { notify } = useToast()
  const [targetId, setTargetId] = useState(targets[0]?.id ?? '')
  const selected = targets.find((item) => item.id === targetId)
  const [form, setForm] = useState({
    mode: 'Sebagian',
    paidDate: new Date().toISOString().slice(0, 10),
    amount: '',
    method: 'Transfer Bank',
    referenceNo: '',
    proofFile: null,
  })

  const expected = Number(selected?.outstanding || 0)
  const amount = form.mode === 'Penuh' ? expected : Number(form.amount || 0)
  const warning = amount > expected ? 'Nominal melebihi outstanding' : amount <= 0 ? 'Nominal belum valid' : amount < expected && form.mode === 'Penuh' ? 'Nominal tidak sesuai mode penuh' : ''

  function submit() {
    if (!selected || !form.paidDate || !amount || warning === 'Nominal melebihi outstanding') {
      notify({ title: 'Pembayaran belum valid', description: warning || 'Lengkapi target dan nominal pembayaran.', type: 'error' })
      return
    }
    createPayment({
      targetType: selected.type,
      targetId: selected.id,
      paidDate: form.paidDate,
      amount,
      method: form.method,
      referenceNo: form.referenceNo,
      proofFile: form.proofFile,
      warning,
    })
    notify({ title: 'Pembayaran tercatat', description: `${currency(amount)} untuk ${selected.number}.`, type: 'success' })
    onSaved()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Catat Pembayaran" description="Pembayaran dapat penuh atau sebagian dengan outstanding otomatis." footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button onClick={submit}>Simpan Pembayaran</Button></>}>
      <div className="grid gap-4">
        <FormField label="Target Pembayaran">
          <SelectInput value={targetId} onChange={(event) => setTargetId(event.target.value)}>
            {targets.map((item) => <option key={item.id} value={item.id}>{item.type} - {item.number} - {currency(item.outstanding)}</option>)}
          </SelectInput>
        </FormField>
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Mode Pembayaran">
            <SelectInput value={form.mode} onChange={(event) => setForm({ ...form, mode: event.target.value, amount: event.target.value === 'Penuh' ? String(expected) : form.amount })}>
              <option>Penuh</option>
              <option>Sebagian</option>
            </SelectInput>
          </FormField>
          <FormField label="Tanggal Bayar"><TextInput type="date" value={form.paidDate} onChange={(event) => setForm({ ...form, paidDate: event.target.value })} /></FormField>
          <FormField label="Nominal">
            <TextInput type="number" value={form.mode === 'Penuh' ? expected : form.amount} disabled={form.mode === 'Penuh'} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
          </FormField>
          <FormField label="Metode Pembayaran">
            <SelectInput value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}>
              <option>Transfer Bank</option>
              <option>Giro</option>
              <option>Setoran Tunai</option>
              <option>Virtual Account</option>
            </SelectInput>
          </FormField>
        </div>
        <FormField label="Nomor Referensi"><TextInput value={form.referenceNo} onChange={(event) => setForm({ ...form, referenceNo: event.target.value })} placeholder="Nomor referensi pembayaran" /></FormField>
        <UploadInput label="Upload Bukti Pembayaran" file={form.proofFile} onChange={(file) => setForm({ ...form, proofFile: file })} />
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <SummaryAmount label="Outstanding Saat Ini" value={expected} />
          <SummaryAmount label="Nominal Bayar" value={amount} />
          <SummaryAmount label="Sisa Outstanding" value={Math.max(0, expected - amount)} strong />
          {warning ? (
            <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              {warning}
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}

export function OutstandingPage() {
  const state = refreshFinance()
  const targets = getPaymentTargets(state)
  return (
    <div className="space-y-4">
      <FinanceHeader title="Outstanding" description="Ringkasan aging piutang invoice dan debit note." />
      <Card>
        <CardHeader title="Daftar Outstanding" description="Data digabung dari status Invoice dan Debit Note." />
        <CardContent>
          {targets.length ? (
            <DataTable
              rows={targets}
              showActions={false}
              columns={[
                { key: 'type', label: 'Jenis' },
                { key: 'number', label: 'Nomor' },
                { key: 'date', label: 'Tanggal' },
                { key: 'dueDate', label: 'Aging', render: (row) => <Badge tone={dueBadgeTone(row.dueDate ?? row.debitNoteDate)}>{agingBucket(row)}</Badge> },
                { key: 'outstanding', label: 'Outstanding', render: (row) => currency(row.outstanding) },
                { key: 'status', label: 'Status', render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
              ]}
            />
          ) : <EmptyState title="Tidak ada outstanding" description="Semua tagihan sudah lunas." />}
        </CardContent>
      </Card>
    </div>
  )
}
