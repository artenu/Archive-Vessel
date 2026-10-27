import { ArrowRight, Eye, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { DataTable } from '../components/data-display/DataTable'
import { EmptyState } from '../components/feedback/EmptyState'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { FormField, SelectInput } from '../components/ui/FormField'
import { jobList } from '../data/jobs'
import { getCreatedJobs } from '../utils/jobStorage'
import { applyJobWorkflowPatch } from '../utils/jobWorkflowState'
import { buildWorkflowTimeline, getJobActionHints } from '../utils/jobWorkflow'
import { calculateDsrDifference, getOperationalState } from '../utils/operationalStorage'
import { statusTone } from '../utils/statusTone'

const queueProfiles = {
  operationalOverview: {
    stages: ['operationalProgress'],
    statusLabel: 'Status Operational',
    ownerLabel: 'Operational',
  },
  history: {
    doneOnly: true,
    statusLabel: 'Status Akhir',
    ownerLabel: 'All Role',
  },
  initialDocuments: {
    stages: ['salesInputOrder', 'financeVerifyOrder'],
    statusLabel: 'Status Dokumen Awal',
    ownerLabel: 'Sales',
  },
  invoiceStatus: {
    stages: ['financeInvoice', 'salesSendDocuments', 'financePayment'],
    statusLabel: 'Status Invoice',
    ownerLabel: 'Sales',
  },
  bargeNomination: {
    stages: ['operationalProgress'],
    statusLabel: 'Status Nominasi',
    ownerLabel: 'Operational',
  },
  rkbm: {
    stages: ['operationalProgress'],
    statusLabel: 'Status RKBM',
    ownerLabel: 'Operational',
  },
  dsr: {
    stages: ['operationalProgress'],
    statusLabel: 'Status DSR',
    ownerLabel: 'Operational',
  },
  operationalDocuments: {
    stages: ['operationalProgress'],
    statusLabel: 'Status Dokumen',
    ownerLabel: 'Operational',
  },
}

function formatDate(value) {
  if (!value || value === '-') return '-'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function toJobRows(role) {
  return [...getCreatedJobs(), ...jobList].map(applyJobWorkflowPatch).map((job) => {
    const operationalState = getOperationalState(job)
    const timeline = buildWorkflowTimeline(job, operationalState)
    const currentStage = timeline.find((item) => item.status === 'Aktif') ?? timeline.at(-1)
    const initialDocs = job.initialDocuments ?? []
    const completedInitialDocs = initialDocs.filter((item) => item.status === 'Lengkap').length
    const rkbmComplete = operationalState.barges.filter((barge) => barge.rkbmNo).length
    const finalDsrComplete = operationalState.barges.filter((barge) => barge.finalDsr).length
    const dsrDifference = operationalState.barges.reduce((sum, barge) => sum + calculateDsrDifference(barge.finalDsr, barge.dsrStart), 0)
    const checklistComplete = Object.values(operationalState.checklist ?? {}).filter(Boolean).length

    return {
      ...job,
      operationalState,
      currentStage,
      nextAction: getJobActionHints(role, job, operationalState)[0] ?? '-',
      completedInitialDocs,
      initialDocsTotal: initialDocs.length || 4,
      rkbmComplete,
      finalDsrComplete,
      dsrDifference,
      checklistComplete,
      checklistTotal: Object.keys(operationalState.checklist ?? {}).length,
    }
  })
}

function getQueueStatus(job, type) {
  if (type === 'initialDocuments') return job.completedInitialDocs >= job.initialDocsTotal ? 'Dokumen Awal Lengkap' : 'Dokumen Awal Belum Lengkap'
  if (type === 'invoiceStatus') return job.invoiceStatus
  if (type === 'bargeNomination') return job.operationalState.barges.length ? 'Ternominasi' : 'Belum Nominasi'
  if (type === 'rkbm') return job.rkbmComplete >= job.operationalState.barges.length ? 'RKBM Terbit' : 'Menunggu RKBM'
  if (type === 'dsr') return job.finalDsrComplete >= job.operationalState.barges.length ? 'Final DSR Lengkap' : 'Menunggu Final DSR'
  if (type === 'operationalDocuments') return job.documentCompleteness >= 90 ? 'Dokumen Operasional Lengkap' : 'Dokumen Operasional Belum Lengkap'
  if (type === 'history') return job.operationalStatus
  return job.operationalState.status
}

function filterByProfile(job, profile) {
  if (profile.doneOnly) {
    return ['Diarsipkan', 'Selesai Administrasi', 'Selesai'].includes(job.operationalStatus) || job.invoiceStatus === 'Lunas' || job.debitNoteStatus === 'Lunas'
  }
  return !profile.stages?.length || profile.stages.includes(job.currentStage?.key)
}

export function WorkflowQueuePage({ module }) {
  const profile = queueProfiles[module.type] ?? queueProfiles.operationalOverview
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('Semua Status')

  const allRows = useMemo(() => toJobRows(module.role ?? profile.ownerLabel?.toLowerCase()), [module.role, profile.ownerLabel])
  const queueRows = useMemo(() => allRows.filter((job) => filterByProfile(job, profile)), [allRows, profile])
  const statusOptions = useMemo(() => ['Semua Status', ...new Set(queueRows.map((job) => getQueueStatus(job, module.type)))], [module.type, queueRows])
  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return queueRows.filter((job) => {
      const queueStatus = getQueueStatus(job, module.type)
      const searchable = [job.jobNumber, job.customer, job.endUser, job.vessel, job.currentStage?.label, job.nextAction, queueStatus].join(' ').toLowerCase()
      return (!query || searchable.includes(query)) && (status === 'Semua Status' || queueStatus === status)
    })
  }, [module.type, queueRows, search, status])

  const attentionCount = queueRows.filter((job) => ['-', 'Lunas', 'Diarsipkan', 'Selesai Administrasi'].includes(job.nextAction) === false).length
  const averageProgress = queueRows.length ? Math.round(queueRows.reduce((sum, job) => sum + Number(job.progress || 0), 0) / queueRows.length) : 0

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_22px_rgba(15,23,42,0.06)]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">{module.category}</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{module.title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">{module.description}</p>
        </div>
        <Button asChild variant="secondary" icon={ArrowRight}>
          <Link to="/pekerjaan">Lihat Workflow</Link>
        </Button>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <Metric label="Total Queue" value={queueRows.length} />
        <Metric label="Butuh Aksi" value={attentionCount} tone="warning" />
        <Metric label="Rata-rata Progress" value={`${averageProgress}%`} tone="success" />
      </div>

      <Card>
        <CardContent className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <FormField label="Pencarian">
            <div className="flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full text-xs outline-none placeholder:text-slate-400"
                placeholder={`Cari ${module.title.toLowerCase()}, customer, vessel...`}
              />
            </div>
          </FormField>
          <FormField label={profile.statusLabel}>
            <SelectInput value={status} onChange={(event) => setStatus(event.target.value)}>
              {statusOptions.map((item) => <option key={item}>{item}</option>)}
            </SelectInput>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title={`Daftar ${module.title}`} description={`${rows.length} pekerjaan sesuai filter.`} />
        <CardContent>
          {rows.length ? (
            <DataTable rows={rows} columns={getColumns(module.type)} showActions={false} />
          ) : (
            <EmptyState title="Data tidak ditemukan" description="Ubah filter atau kata kunci untuk melihat pekerjaan lain." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({ label, value, tone = 'brand' }) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
        <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
        <Badge className="mt-2" tone={tone}>Workflow Queue</Badge>
      </CardContent>
    </Card>
  )
}

function JobLink({ job }) {
  return (
    <Link className="font-semibold text-brand-700 hover:underline" to={`/pekerjaan/${job.id}`}>
      {job.jobNumber}
    </Link>
  )
}

function DetailButton({ job }) {
  return (
    <Button asChild variant="ghost" size="icon-sm" icon={Eye} aria-label={`Detail ${job.jobNumber}`}>
      <Link to={`/pekerjaan/${job.id}`}><span className="sr-only">Detail {job.jobNumber}</span></Link>
    </Button>
  )
}

function getColumns(type) {
  const base = [
    { key: 'jobNumber', label: 'Nomor Job', render: (job) => <JobLink job={job} /> },
    { key: 'customer', label: 'Customer' },
    { key: 'vessel', label: 'Vessel' },
  ]

  const actionColumn = {
    key: 'aksi',
    label: 'Aksi',
    className: 'w-10 whitespace-nowrap px-3 py-2 text-right',
    render: (job) => <DetailButton job={job} />,
  }

  if (type === 'initialDocuments') {
    return [
      ...base,
      { key: 'documents', label: 'Dokumen Awal', render: (job) => `${job.completedInitialDocs}/${job.initialDocsTotal}` },
      { key: 'status', label: 'Status', render: (job) => <Badge tone={statusTone(getQueueStatus(job, type))}>{getQueueStatus(job, type)}</Badge> },
      { key: 'nextAction', label: 'Next Action' },
      actionColumn,
    ]
  }

  if (type === 'invoiceStatus') {
    return [
      ...base,
      { key: 'invoiceStatus', label: 'Invoice', render: (job) => <Badge tone={statusTone(job.invoiceStatus)}>{job.invoiceStatus}</Badge> },
      { key: 'debitNoteStatus', label: 'Debit Note', render: (job) => <Badge tone={statusTone(job.debitNoteStatus)}>{job.debitNoteStatus}</Badge> },
      { key: 'outstandingTotal', label: 'Outstanding' },
      actionColumn,
    ]
  }

  if (type === 'bargeNomination') {
    return [
      ...base,
      { key: 'barge', label: 'Barge', render: (job) => `${job.operationalState.barges.length} pasangan` },
      { key: 'nominated', label: 'Tonase Nominasi', render: (job) => `${job.operationalState.barges.reduce((sum, barge) => sum + Number(barge.nominatedTonnage || 0), 0).toLocaleString('id-ID')} MT` },
      { key: 'status', label: 'Status', render: (job) => <Badge tone={statusTone(getQueueStatus(job, type))}>{getQueueStatus(job, type)}</Badge> },
      actionColumn,
    ]
  }

  if (type === 'rkbm') {
    return [
      ...base,
      { key: 'rkbm', label: 'RKBM Terbit', render: (job) => `${job.rkbmComplete}/${job.operationalState.barges.length}` },
      { key: 'latestRkbm', label: 'RKBM Terakhir', render: (job) => job.operationalState.barges.find((barge) => barge.rkbmNo)?.rkbmNo ?? '-' },
      { key: 'status', label: 'Status', render: (job) => <Badge tone={statusTone(getQueueStatus(job, type))}>{getQueueStatus(job, type)}</Badge> },
      actionColumn,
    ]
  }

  if (type === 'dsr') {
    return [
      ...base,
      { key: 'finalDsr', label: 'Final DSR', render: (job) => `${job.finalDsrComplete}/${job.operationalState.barges.length}` },
      { key: 'selisih', label: 'Selisih DSR', render: (job) => `${job.dsrDifference > 0 ? '+' : ''}${job.dsrDifference.toLocaleString('id-ID')} MT` },
      { key: 'status', label: 'Status', render: (job) => <Badge tone={statusTone(getQueueStatus(job, type))}>{getQueueStatus(job, type)}</Badge> },
      actionColumn,
    ]
  }

  if (type === 'operationalDocuments') {
    return [
      ...base,
      { key: 'checklist', label: 'Checklist', render: (job) => `${job.checklistComplete}/${job.checklistTotal}` },
      { key: 'documentCompleteness', label: 'Kelengkapan', render: (job) => `${job.documentCompleteness}%` },
      { key: 'status', label: 'Status', render: (job) => <Badge tone={statusTone(getQueueStatus(job, type))}>{getQueueStatus(job, type)}</Badge> },
      actionColumn,
    ]
  }

  if (type === 'history') {
    return [
      ...base,
      { key: 'vesselCompleteDate', label: 'Vessel Complete', render: (job) => formatDate(job.vesselCompleteDate) },
      { key: 'invoiceStatus', label: 'Invoice', render: (job) => <Badge tone={statusTone(job.invoiceStatus)}>{job.invoiceStatus}</Badge> },
      { key: 'operationalStatus', label: 'Status Akhir', render: (job) => <Badge tone={statusTone(job.operationalStatus)}>{job.operationalStatus}</Badge> },
      actionColumn,
    ]
  }

  return [
    ...base,
    { key: 'stage', label: 'Stage', render: (job) => job.currentStage?.shortLabel ?? '-' },
    { key: 'progress', label: 'Progress', render: (job) => `${job.progress}%` },
    { key: 'status', label: 'Status', render: (job) => <Badge tone={statusTone(job.operationalState.status)}>{job.operationalState.status}</Badge> },
    { key: 'nextAction', label: 'Next Action' },
    actionColumn,
  ]
}
