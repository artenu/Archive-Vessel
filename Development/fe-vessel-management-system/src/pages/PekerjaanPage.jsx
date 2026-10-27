import { Eye, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { DataTable } from '../components/data-display/DataTable'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { FormField, SelectInput, TextInput } from '../components/ui/FormField'
import { Pagination } from '../components/ui/Pagination'
import { jobFilters, jobList } from '../data/jobs'
import { roles } from '../data/mockUsers'
import { useAuth } from '../hooks/useAuth'
import { getCreatedJobs } from '../utils/jobStorage'
import { statusTone } from '../utils/statusTone'

function compactJobs() {
  return [...getCreatedJobs(), ...jobList].map((job) => ({
    id: job.id,
    source: job.source,
    salesStatus: job.salesStatus,
    jobNumber: job.jobNumber,
    customer: job.customer,
    vessel: job.vessel,
    activityType: job.activityType,
    startDate: job.startDate,
    volume: job.volume,
    operationalStatus: job.operationalStatus,
    invoiceStatus: job.invoiceStatus,
    documentCompleteness: job.documentCompleteness,
  }))
}

export function PekerjaanPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('Semua Status')
  const [customer, setCustomer] = useState('Semua Customer')

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return compactJobs().filter((job) => {
      if (job.source === 'sales' && job.salesStatus === 'DRAFT' && !['admin', 'sales'].includes(user?.role)) return false
      const searchable = [job.jobNumber, job.customer, job.vessel, job.activityType, job.operationalStatus].join(' ').toLowerCase()
      const matchesSearch = !query || searchable.includes(query)
      const matchesStatus = status === 'Semua Status' || job.operationalStatus === status
      const matchesCustomer = customer === 'Semua Customer' || job.customer === customer
      return matchesSearch && matchesStatus && matchesCustomer
    })
  }, [customer, search, status, user?.role])

  const readOnly = user?.role === 'viewer'
  const columns = [
    {
      key: 'jobNumber',
      label: 'No. Pekerjaan',
      render: (row) => (
        <Link to={`/pekerjaan/${row.id}`} className="font-semibold text-brand-700 hover:text-brand-800">
          {row.jobNumber}
        </Link>
      ),
    },
    { key: 'customer', label: 'Customer' },
    { key: 'vessel', label: 'Vessel' },
    { key: 'volume', label: 'Volume' },
    {
      key: 'documentCompleteness',
      label: 'Dokumen',
      render: (row) => <Badge tone={row.documentCompleteness >= 90 ? 'success' : 'warning'}>{row.documentCompleteness}%</Badge>,
    },
    {
      key: 'operationalStatus',
      label: 'Status',
      render: (row) => <Badge tone={statusTone(row.operationalStatus)}>{row.operationalStatus}</Badge>,
    },
    { key: 'invoiceStatus', label: 'Invoice' },
    {
      key: 'detail',
      label: 'Detail',
      render: (row) => (
        <Button asChild variant="ghost" size="icon-sm" icon={Eye} aria-label={`Buka ${row.jobNumber}`}>
          <Link to={`/pekerjaan/${row.id}`} />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-700">{roles[user?.role]}</p>
          <h1 className="text-lg font-semibold text-slate-950">Daftar Pekerjaan</h1>
          <p className="text-xs text-slate-500">Tabel compact untuk memantau pekerjaan RKBM dan membuka detail.</p>
        </div>
        {readOnly ? <Badge>Read only</Badge> : <Badge tone="brand">Mock data</Badge>}
      </div>

      <Card>
        <CardContent className="grid gap-2 lg:grid-cols-[1fr_220px_220px]">
          <FormField label="Pencarian">
            <div className="flex h-7 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <TextInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-auto border-0 px-0 focus:border-transparent focus:ring-0"
                placeholder="Cari nomor, customer, vessel..."
              />
            </div>
          </FormField>
          <FormField label="Customer">
            <SelectInput value={customer} onChange={(event) => setCustomer(event.target.value)}>
              {jobFilters.customers.map((item) => <option key={item}>{item}</option>)}
            </SelectInput>
          </FormField>
          <FormField label="Status">
            <SelectInput value={status} onChange={(event) => setStatus(event.target.value)}>
              {['Semua Status', 'DRAFT', 'OPERATIONAL', 'FINANCE', 'SELESAI', ...jobFilters.jobStatuses.filter((item) => item !== 'Semua Status')].map((item) => <option key={item}>{item}</option>)}
            </SelectInput>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Pekerjaan RKBM" description={`${rows.length} pekerjaan sesuai filter.`} />
        <CardContent>
          <DataTable columns={columns} rows={rows} showActions={false} />
        </CardContent>
        <Pagination page={1} totalPages={1} totalItems={rows.length} pageSize={10} />
      </Card>
    </div>
  )
}
