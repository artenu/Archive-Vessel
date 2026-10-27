import { BriefcaseBusiness, Database, RefreshCcw, ShieldCheck, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { DataTable } from '../components/data-display/DataTable'
import { EmptyState } from '../components/feedback/EmptyState'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Pagination } from '../components/ui/Pagination'
import { jobList } from '../data/jobs'
import { roles } from '../data/mockUsers'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { formatCurrency, getCreatedJobs } from '../utils/jobStorage'
import { statusTone } from '../utils/statusTone'

const unfinishedStatuses = ['DRAFT', 'OPERATIONAL', 'FINANCE']

const jobColumns = [
  {
    key: 'jobNumber',
    label: 'No. Job',
    render: (row) => (
      <Link to={`/pekerjaan/${row.id}`} className="font-semibold text-brand-700 hover:text-brand-800">
        {row.jobNumber}
      </Link>
    ),
  },
  { key: 'customer', label: 'Customer' },
  { key: 'vessel', label: 'Vessel' },
  { key: 'startDate', label: 'Tanggal', render: (row) => formatShortDate(row.startDate) },
  { key: 'invoiceTotal', label: 'Invoice' },
  {
    key: 'operationalStatus',
    label: 'Status',
    render: (row) => <Badge tone={statusTone(row.operationalStatus)}>{row.operationalStatus}</Badge>,
  },
]

function StatCard({ stat }) {
  return (
    <Card>
      <CardContent>
        <div className="flex min-h-10 items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase text-slate-500">{stat.label}</p>
            <p className="mt-1 truncate text-lg font-semibold leading-none text-slate-950">{stat.value}</p>
          </div>
          <Badge tone={stat.tone}>{stat.meta}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const { notify } = useToast()
  const [refreshKey, setRefreshKey] = useState(0)
  const allJobs = useMemo(() => {
    void refreshKey
    return normalizeJobs([...getCreatedJobs(), ...jobList])
  }, [refreshKey])
  const visibleJobs = useMemo(() => filterJobsForRole(allJobs, user?.role), [allJobs, user?.role])
  const stats = useMemo(() => buildStats(allJobs, visibleJobs, user?.role), [allJobs, user?.role, visibleJobs])
  const latestRows = visibleJobs.slice(0, 6)
  const unfinishedRows = visibleJobs.filter((job) => unfinishedStatuses.includes(job.operationalStatus) || !['SELESAI', 'Diarsipkan', 'Selesai', 'Selesai Administrasi'].includes(job.operationalStatus)).slice(0, 6)
  const monthlyRows = useMemo(() => buildMonthlyRows(visibleJobs), [visibleJobs])
  const canManageAdmin = user?.role === 'admin'

  function refreshData() {
    setRefreshKey((value) => value + 1)
    notify({ title: 'Dashboard diperbarui', description: 'Data terbaru dari localStorage dimuat.', type: 'success' })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-700">RKBM Archive & Analytics System</p>
          <h1 className="text-lg font-semibold text-slate-950">Dashboard {roles[user?.role]}</h1>
          <p className="text-xs text-slate-500">Ringkasan kondisi sistem dari data Sales, Operational, dan Finance.</p>
        </div>
        <Button variant="secondary" size="icon" icon={RefreshCcw} aria-label="Muat ulang dashboard" onClick={refreshData} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}
      </div>

      <div className="grid gap-2.5 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader title="Pekerjaan Terbaru" description={`${latestRows.length} job terakhir sesuai akses role.`} />
          <CardContent>
            {latestRows.length ? <DataTable columns={jobColumns} rows={latestRows} showActions={false} /> : <EmptyState title="Belum ada pekerjaan" description="Data akan muncul setelah job dibuat atau diproses." />}
          </CardContent>
          <Pagination page={1} totalPages={1} totalItems={latestRows.length} pageSize={10} />
        </Card>

        <Card>
          <CardHeader title="Jumlah Job per Bulan" description="Grafik sederhana dari tanggal pekerjaan." />
          <CardContent className="space-y-2">
            {monthlyRows.length ? (
              <MiniBarChart rows={monthlyRows} />
            ) : (
              <EmptyState title="Belum ada data grafik" description="Grafik muncul setelah job memiliki tanggal pekerjaan." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-2.5 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader title="Pekerjaan Belum Selesai" description="Job yang masih perlu ditindaklanjuti." />
          <CardContent>
            {unfinishedRows.length ? <DataTable columns={jobColumns} rows={unfinishedRows} showActions={false} /> : <EmptyState title="Tidak ada pekerjaan tertunda" description="Semua pekerjaan pada cakupan role ini sudah selesai." />}
          </CardContent>
          <Pagination page={1} totalPages={1} totalItems={unfinishedRows.length} pageSize={10} />
        </Card>

        <Card>
          <CardHeader title="Akses Cepat" description="Menu utama sesuai role." />
          <CardContent className="space-y-2">
            <QuickLink icon={BriefcaseBusiness} to="/pekerjaan" label="Daftar Pekerjaan" />
            {['admin', 'sales'].includes(user?.role) ? <QuickLink icon={BriefcaseBusiness} to="/sales/jobs" label="Job Sales" /> : null}
            {['admin', 'operational'].includes(user?.role) ? <QuickLink icon={BriefcaseBusiness} to="/operational/jobs" label="Job Operational" /> : null}
            {['admin', 'finance'].includes(user?.role) ? <QuickLink icon={BriefcaseBusiness} to="/finance/jobs" label="Job Finance" /> : null}
            {canManageAdmin ? <QuickLink icon={Database} to="/master-data" label="Master Data" /> : null}
            {canManageAdmin ? <QuickLink icon={Users} to="/pengguna" label="User Management" /> : null}
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <p className="text-xs font-semibold text-slate-800">{roles[user?.role]}</p>
              </div>
              <p className="mt-1 text-xs text-slate-500">Ringkasan disusun dari mock data browser.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function QuickLink({ icon: Icon, to, label }) {
  return (
    <Link to={to} className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50">
      <Icon className="h-3.5 w-3.5 text-brand-700" />
      <span>{label}</span>
    </Link>
  )
}

function MiniBarChart({ rows }) {
  const max = Math.max(...rows.map((row) => row.total), 1)

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.month} className="grid grid-cols-[64px_1fr_28px] items-center gap-2">
          <p className="truncate text-xs font-semibold text-slate-500">{row.month}</p>
          <div className="h-6 overflow-hidden rounded-md bg-slate-100">
            <div className="h-full rounded-md bg-brand-600" style={{ width: `${Math.max(8, (row.total / max) * 100)}%` }} />
          </div>
          <p className="text-right text-xs font-semibold text-slate-800">{row.total}</p>
        </div>
      ))}
    </div>
  )
}

function normalizeJobs(jobs) {
  return jobs
    .map((job) => ({
      ...job,
      operationalStatus: job.operationalStatus ?? job.salesStatus ?? 'DRAFT',
      paymentStatus: job.paymentStatus ?? (job.invoiceStatus === 'LUNAS' || job.invoiceStatus === 'Lunas' ? 'LUNAS' : 'BELUM DITAGIH'),
      invoiceTotal: job.invoiceTotal ?? 'Rp 0',
      reimbursementTotal: job.reimbursementTotal ?? 'Rp 0',
      updatedAt: job.updatedAt ?? job.createdAt ?? job.startDate ?? '1970-01-01',
      barges: job.barges ?? [],
    }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

function filterJobsForRole(jobs, role) {
  if (role === 'sales') return jobs.filter((job) => job.source === 'sales')
  if (role === 'operational') return jobs.filter((job) => ['OPERATIONAL', 'FINANCE', 'SELESAI'].includes(job.operationalStatus))
  if (role === 'finance') return jobs.filter((job) => ['FINANCE', 'SELESAI'].includes(job.operationalStatus))
  return jobs
}

function buildStats(allJobs, visibleJobs, role) {
  const source = role === 'admin' || role === 'viewer' ? allJobs : visibleJobs
  const totalInvoice = sumMoney(source.map((job) => job.invoiceTotal))
  const totalReimbursement = sumMoney(source.map((job) => job.reimbursementTotal))
  const base = {
    total: source.length,
    draft: source.filter((job) => job.operationalStatus === 'DRAFT').length,
    operational: source.filter((job) => job.operationalStatus === 'OPERATIONAL').length,
    finance: source.filter((job) => job.operationalStatus === 'FINANCE').length,
    done: source.filter((job) => ['SELESAI', 'Selesai', 'Selesai Administrasi', 'Diarsipkan'].includes(job.operationalStatus)).length,
    barges: source.reduce((total, job) => total + (job.barges?.length ?? 0), 0),
    notVesselComplete: source.filter((job) => (job.barges ?? []).some((barge) => !barge.vesselComplete && barge.status !== 'Vessel Complete')).length,
    missingInvoice: source.filter((job) => job.operationalStatus === 'FINANCE' && !job.finance?.invoiceNo).length,
    paid: source.filter((job) => job.paymentStatus === 'LUNAS').length,
  }

  if (role === 'sales') {
    return [
      { label: 'Job Draft', value: base.draft, meta: 'DRAFT', tone: 'warning' },
      { label: 'Sedang Diproses', value: base.operational + base.finance, meta: 'Ops/Finance', tone: 'info' },
      { label: 'Job Selesai', value: base.done, meta: 'Arsip', tone: 'success' },
      { label: 'Total Job Sales', value: base.total, meta: 'Sales', tone: 'brand' },
    ]
  }

  if (role === 'operational') {
    return [
      { label: 'Menunggu Diproses', value: base.operational, meta: 'OPERATIONAL', tone: 'info' },
      { label: 'Jumlah Barge', value: base.barges, meta: 'Pasangan', tone: 'brand' },
      { label: 'Belum Vessel Complete', value: base.notVesselComplete, meta: 'Cek barge', tone: 'warning' },
      { label: 'Dikirim Finance', value: base.finance, meta: 'FINANCE', tone: 'success' },
    ]
  }

  if (role === 'finance') {
    return [
      { label: 'Siap Diproses', value: base.finance, meta: 'FINANCE', tone: 'info' },
      { label: 'Invoice Belum Diisi', value: base.missingInvoice, meta: 'Perlu input', tone: 'warning' },
      { label: 'Reimbursement', value: formatCurrency(totalReimbursement), meta: 'Total', tone: 'success' },
      { label: 'Pembayaran', value: base.paid, meta: 'LUNAS', tone: 'brand' },
    ]
  }

  const stats = [
    { label: 'Total Job', value: base.total, meta: 'Sistem', tone: 'brand' },
    { label: 'Job Draft', value: base.draft, meta: 'DRAFT', tone: 'warning' },
    { label: 'Job Operational', value: base.operational, meta: 'OPERATIONAL', tone: 'info' },
    { label: 'Job Finance', value: base.finance, meta: 'FINANCE', tone: 'info' },
    { label: 'Job Selesai', value: base.done, meta: 'SELESAI', tone: 'success' },
    { label: 'Total Invoice', value: formatCurrency(totalInvoice), meta: 'Invoice', tone: 'brand' },
    { label: 'Total Reimbursement', value: formatCurrency(totalReimbursement), meta: 'PNBP', tone: 'success' },
  ]

  return role === 'viewer' ? stats.filter((stat) => ['Total Job', 'Job Operational', 'Job Finance', 'Job Selesai', 'Total Invoice'].includes(stat.label)) : stats
}

function buildMonthlyRows(jobs) {
  const formatter = new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' })
  const counts = jobs.reduce((map, job) => {
    if (!job.startDate || job.startDate === '-') return map
    const key = formatter.format(new Date(job.startDate))
    map.set(key, (map.get(key) ?? 0) + 1)
    return map
  }, new Map())

  return [...counts.entries()].map(([month, total]) => ({ month, total })).slice(-6)
}

function sumMoney(values) {
  return values.reduce((total, value) => total + parseMoney(value), 0)
}

function parseMoney(value) {
  if (typeof value === 'number') return value
  return Number(String(value ?? '0').replace(/[^\d-]/g, '')) || 0
}

function formatShortDate(value) {
  if (!value || value === '-') return '-'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}
