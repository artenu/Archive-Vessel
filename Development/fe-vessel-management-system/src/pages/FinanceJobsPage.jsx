import { Eye, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { DataTable } from '../components/data-display/DataTable'
import { EmptyState } from '../components/feedback/EmptyState'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { FormField, SelectInput, TextInput } from '../components/ui/FormField'
import { Pagination } from '../components/ui/Pagination'
import { getCreatedJobs } from '../utils/jobStorage'
import { statusTone } from '../utils/statusTone'

export function FinanceJobsPage() {
  const [search, setSearch] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('Semua Status')

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return getCreatedJobs().filter((job) => {
      if (job.operationalStatus !== 'FINANCE') return false
      const searchable = [job.jobNumber, job.customer, job.endUser, job.vessel, job.invoiceStatus].join(' ').toLowerCase()
      const matchesSearch = !query || searchable.includes(query)
      const matchesPayment = paymentStatus === 'Semua Status' || (job.paymentStatus ?? 'BELUM DITAGIH') === paymentStatus
      return matchesSearch && matchesPayment
    })
  }, [paymentStatus, search])

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
    { key: 'vessel', label: 'Vessel' },
    { key: 'barges', label: 'Barge', render: (row) => `${row.barges?.length ?? 0} pasangan` },
    { key: 'invoiceTotal', label: 'Total Invoice' },
    { key: 'reimbursementTotal', label: 'Reimbursement' },
    {
      key: 'paymentStatus',
      label: 'Status Bayar',
      render: (row) => <Badge tone={statusTone(row.paymentStatus ?? 'BELUM DITAGIH')}>{row.paymentStatus ?? 'BELUM DITAGIH'}</Badge>,
    },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (row) => (
        <Button asChild variant="ghost" size="icon-sm" icon={Eye} aria-label={`Proses Finance ${row.jobNumber}`}>
          <Link to={`/pekerjaan/${row.id}`} />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-700">Finance</p>
        <h1 className="text-lg font-semibold text-slate-950">Pekerjaan Finance</h1>
        <p className="text-xs text-slate-500">Job berstatus FINANCE otomatis masuk ke daftar pencatatan keuangan dasar.</p>
      </div>

      <Card>
        <CardContent className="grid gap-2 lg:grid-cols-[1fr_190px]">
          <FormField label="Pencarian">
            <div className="flex h-7 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <TextInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-auto border-0 px-0 focus:border-transparent focus:ring-0"
                placeholder="Cari job, customer, vessel..."
              />
            </div>
          </FormField>
          <FormField label="Status Bayar">
            <SelectInput value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
              <option>Semua Status</option>
              <option>BELUM DITAGIH</option>
              <option>SUDAH DITAGIH</option>
              <option>LUNAS</option>
            </SelectInput>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Daftar Job Finance" description={`${rows.length} job menunggu pencatatan Finance.`} />
        <CardContent>
          {rows.length ? <DataTable columns={columns} rows={rows} showActions={false} /> : <EmptyState title="Tidak ada job FINANCE" description="Job yang dikirim dari Operational akan muncul di sini." />}
        </CardContent>
        <Pagination page={1} totalPages={1} totalItems={rows.length} pageSize={10} />
      </Card>
    </div>
  )
}
