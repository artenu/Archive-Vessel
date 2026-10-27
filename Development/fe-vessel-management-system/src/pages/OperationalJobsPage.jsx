import { Eye, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { DataTable } from '../components/data-display/DataTable'
import { EmptyState } from '../components/feedback/EmptyState'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { FormField, TextInput } from '../components/ui/FormField'
import { Pagination } from '../components/ui/Pagination'
import { getCreatedJobs } from '../utils/jobStorage'
import { statusTone } from '../utils/statusTone'

function formatDate(value) {
  if (!value || value === '-') return '-'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

export function OperationalJobsPage() {
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return getCreatedJobs().filter((job) => {
      if (job.operationalStatus !== 'OPERATIONAL') return false
      const searchable = [job.jobNumber, job.customer, job.endUser, job.vessel, job.dropPoint].join(' ').toLowerCase()
      return !query || searchable.includes(query)
    })
  }, [search])

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
    { key: 'dropPoint', label: 'Tujuan / Drop Point' },
    { key: 'startDate', label: 'Tanggal', render: (row) => formatDate(row.startDate) },
    { key: 'barges', label: 'Barge', render: (row) => `${row.barges?.length ?? 0} pasangan` },
    {
      key: 'operationalStatus',
      label: 'Status',
      render: (row) => <Badge tone={statusTone(row.operationalStatus)}>{row.operationalStatus}</Badge>,
    },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (row) => (
        <Button asChild variant="ghost" size="icon-sm" icon={Eye} aria-label={`Proses ${row.jobNumber}`}>
          <Link to={`/pekerjaan/${row.id}`} />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-700">Operational</p>
        <h1 className="text-lg font-semibold text-slate-950">Pekerjaan Operational</h1>
        <p className="text-xs text-slate-500">Job dari Sales dengan status OPERATIONAL otomatis muncul di daftar ini.</p>
      </div>

      <Card>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Daftar Job Operational" description={`${rows.length} job menunggu proses Operational.`} />
        <CardContent>
          {rows.length ? <DataTable columns={columns} rows={rows} showActions={false} /> : <EmptyState title="Tidak ada job OPERATIONAL" description="Job yang dikirim dari Sales akan muncul di sini." />}
        </CardContent>
        <Pagination page={1} totalPages={1} totalItems={rows.length} pageSize={10} />
      </Card>
    </div>
  )
}
