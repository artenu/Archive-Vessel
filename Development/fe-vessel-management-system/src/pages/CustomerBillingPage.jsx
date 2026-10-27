import { Download, Eye, FileWarning, Send, Search, UserCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DataTable } from '../components/data-display/DataTable'
import { EmptyState } from '../components/feedback/EmptyState'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { FormField, SelectInput } from '../components/ui/FormField'
import { Modal } from '../components/ui/Modal'
import { useToast } from '../hooks/useToast'
import { currency, getFinanceState, updateFinanceState } from '../utils/financeStorage'
import { statusTone } from '../utils/statusTone'

function normalizeRows(state) {
  const invoices = state.invoices.map((item) => ({
    ...item,
    type: 'Invoice',
    number: item.invoiceNo,
    date: item.invoiceDate,
    totalValue: item.total,
    customer: item.lines?.[0]?.customer ?? 'Customer dari RKBM',
  }))
  const debitNotes = state.debitNotes.map((item) => ({
    ...item,
    type: 'Debit Note',
    number: item.debitNoteNo,
    date: item.debitNoteDate,
    totalValue: item.total,
  }))
  return [...invoices, ...debitNotes]
}

export function CustomerBillingPage() {
  const { notify } = useToast()
  const [state, setState] = useState(() => getFinanceState())
  const [search, setSearch] = useState('')
  const [type, setType] = useState('Semua')
  const [selected, setSelected] = useState(null)

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return normalizeRows(state).filter((item) => {
      const searchable = [item.type, item.number, item.customer, item.status].join(' ').toLowerCase()
      return (!query || searchable.includes(query)) && (type === 'Semua' || item.type === type)
    })
  }, [state, search, type])

  function updateStatus(row, status) {
    const key = row.type === 'Invoice' ? 'invoices' : 'debitNotes'
    const next = updateFinanceState((current) => ({
      ...current,
      [key]: current[key].map((item) => item.id === row.id ? {
        ...item,
        status,
        delivery: {
          ...(item.delivery ?? {}),
          sentDate: status === 'Dikirim' ? new Date().toISOString().slice(0, 10) : item.delivery?.sentDate,
          receivedDate: status === 'Diterima Customer' ? new Date().toISOString().slice(0, 10) : item.delivery?.receivedDate,
          pic: item.delivery?.pic ?? 'PIC Customer',
          notes: item.delivery?.notes ?? 'Dicatat oleh Sales Support',
        },
      } : item),
    }))
    setState(next)
    notify({ title: 'Status pengiriman diperbarui', description: `${row.number} menjadi ${status}.`, type: 'success' })
  }

  function requestRevision(row) {
    const key = row.type === 'Invoice' ? 'invoices' : 'debitNotes'
    const next = updateFinanceState((current) => ({
      ...current,
      [key]: current[key].map((item) => item.id === row.id ? {
        ...item,
        status: 'Revisi Diminta',
        revisionReason: 'Customer meminta koreksi dokumen penagihan.',
      } : item),
    }))
    setState(next)
    notify({ title: 'Revisi diajukan ke Finance', description: row.number, type: 'info' })
  }

  const columns = [
    { key: 'type', label: 'Jenis', render: (row) => <Badge tone={row.type === 'Invoice' ? 'info' : 'warning'}>{row.type}</Badge> },
    { key: 'number', label: 'Nomor' },
    { key: 'customer', label: 'Customer' },
    { key: 'date', label: 'Tanggal Terbit' },
    { key: 'totalValue', label: 'Nilai', render: (row) => currency(row.totalValue) },
    { key: 'status', label: 'Status Pengiriman', render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" icon={Eye} aria-label={`Lihat detail ${row.number}`} onClick={() => setSelected(row)} />
          <Button variant="ghost" size="icon-sm" icon={Download} aria-label={`Download ${row.number}`} onClick={() => notify({ title: 'Download placeholder', description: row.number, type: 'info' })} />
          <Button variant="ghost" size="icon-sm" icon={Send} aria-label={`Catat dikirim ${row.number}`} onClick={() => updateStatus(row, 'Dikirim')} />
          <Button variant="ghost" size="icon-sm" icon={UserCheck} aria-label={`Catat diterima ${row.number}`} onClick={() => updateStatus(row, 'Diterima Customer')} />
          <Button variant="ghost" size="icon-sm" icon={FileWarning} aria-label={`Ajukan revisi ${row.number}`} onClick={() => requestRevision(row)} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-brand-700">Sales Support</p>
          <h1 className="text-base font-bold text-slate-950">Penagihan Customer</h1>
          <p className="text-xs text-slate-500">Invoice dan Debit Note yang diterbitkan Finance untuk dikirim, diterima, dan di-follow-up ke customer.</p>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-2 md:grid-cols-[1fr_180px]">
          <FormField label="Pencarian">
            <div className="flex h-7 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full text-xs outline-none placeholder:text-slate-400" placeholder="Cari invoice, debit note, customer..." />
            </div>
          </FormField>
          <FormField label="Jenis">
            <SelectInput value={type} onChange={(event) => setType(event.target.value)}>
              <option>Semua</option>
              <option>Invoice</option>
              <option>Debit Note</option>
            </SelectInput>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Daftar Penagihan Siap Customer" description={`${rows.length} dokumen penagihan tersedia untuk Sales Support.`} />
        <CardContent>
          {rows.length ? <DataTable rows={rows} columns={columns} showActions={false} /> : <EmptyState title="Belum ada penagihan" description="Invoice atau Debit Note muncul setelah Finance menerbitkan dokumen." />}
        </CardContent>
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Detail Penagihan"
        description={selected?.number}
        footer={<Button onClick={() => setSelected(null)}>Tutup</Button>}
      >
        {selected ? <pre className="max-h-80 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">{JSON.stringify(selected, null, 2)}</pre> : null}
      </Modal>
    </div>
  )
}
