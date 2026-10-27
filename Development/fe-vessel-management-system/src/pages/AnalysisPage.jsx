import { Download, FileSpreadsheet } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DataTable } from '../components/data-display/DataTable'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { FormField, SelectInput } from '../components/ui/FormField'
import { Tabs } from '../components/ui/Tabs'
import { analyticsTabs, applyAnalyticsFilters, getAnalyticsDataset } from '../utils/analyticsData'
import { currency } from '../utils/financeStorage'
import { statusTone } from '../utils/statusTone'
import { useToast } from '../hooks/useToast'

const colors = ['#991b1b', '#0284c7', '#059669', '#d97706', '#7c3aed', '#dc2626']

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-slate-950">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey ?? item.name} className="mt-1 text-slate-600">
          {item.name}: <span className="font-semibold text-slate-900">{typeof item.value === 'number' && item.value > 1000000 ? currency(item.value) : item.value}</span>
        </p>
      ))}
    </div>
  )
}

function StatCard({ label, value, tone = 'brand' }) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
        <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
        <Badge className="mt-2" tone={tone}>Analisis</Badge>
      </CardContent>
    </Card>
  )
}

function BarPanel({ title, description, data, dataKey = 'value', nameKey = 'name', valueName = 'Jumlah' }) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={nameKey} tick={{ fontSize: 11 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey={dataKey} name={valueName} fill="#991b1b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function LinePanel({ data }) {
  return (
    <Card>
      <CardHeader title="Nilai Invoice Bulanan" description="Nilai invoice dan status invoice per bulan." />
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip content={<ChartTooltip />} />
            <Line dataKey="nilai" name="Nilai Invoice" stroke="#991b1b" strokeWidth={2} />
            <Line dataKey="terbit" name="Invoice Terbit" stroke="#0284c7" strokeWidth={2} />
            <Line dataKey="lunas" name="Lunas" stroke="#059669" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function PiePanel({ title, description, data }) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={2}>
              {data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function AnalysisPage({ initialTab = 'operasional' }) {
  const { notify } = useToast()
  const [activeTab, setActiveTab] = useState(initialTab)
  const dataset = useMemo(() => getAnalyticsDataset(), [])
  const [filters, setFilters] = useState({
    period: 'Bulan Ini',
    customer: 'Semua Customer',
    vessel: 'Semua Vessel',
    location: 'Semua Lokasi',
    status: 'Semua Status',
  })
  const filtered = useMemo(() => applyAnalyticsFilters(dataset, filters), [dataset, filters])

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function exportPlaceholder(type) {
    notify({ title: `Export ${type}`, description: 'Export laporan masih placeholder frontend.', type: 'info' })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-brand-700">Analytics</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-950">Analisis dan Laporan</h1>
          <p className="mt-1 text-sm text-slate-500">Analisis operasional, customer, invoice, reimbursement, piutang, dan kelengkapan dokumen dari seluruh modul mock.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={FileSpreadsheet} onClick={() => exportPlaceholder('Excel')}>Export Excel</Button>
          <Button variant="secondary" icon={Download} onClick={() => exportPlaceholder('PDF')}>Export PDF</Button>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <Tabs tabs={analyticsTabs} activeTab={activeTab} onChange={setActiveTab} />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <FilterSelect label="Periode" value={filters.period} options={dataset.filters.periods} onChange={(value) => updateFilter('period', value)} />
            <FilterSelect label="Customer" value={filters.customer} options={dataset.filters.customers} onChange={(value) => updateFilter('customer', value)} />
            <FilterSelect label="Vessel" value={filters.vessel} options={dataset.filters.vessels} onChange={(value) => updateFilter('vessel', value)} />
            <FilterSelect label="Lokasi" value={filters.location} options={dataset.filters.locations} onChange={(value) => updateFilter('location', value)} />
            <FilterSelect label="Status" value={filters.status} options={dataset.filters.statuses} onChange={(value) => updateFilter('status', value)} />
          </div>
        </CardContent>
      </Card>

      {activeTab === 'operasional' ? <OperationalAnalysis data={filtered.operational} /> : null}
      {activeTab === 'customer' ? <CustomerAnalysis data={filtered.customer} /> : null}
      {activeTab === 'invoice' ? <InvoiceAnalysis data={filtered.invoice} /> : null}
      {activeTab === 'reimbursement' ? <ReimbursementAnalysis data={filtered.reimbursement} /> : null}
      {activeTab === 'piutang' ? <ReceivableAnalysis data={filtered.piutang} /> : null}
      {activeTab === 'dokumen' ? <DocumentAnalysis data={filtered.dokumen} /> : null}
    </div>
  )
}

function OperationalAnalysis({ data }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => <StatCard key={stat.label} label={stat.label} value={stat.value} />)}
      </div>
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <BarPanel title="Pekerjaan Berdasarkan Lokasi" description="Distribusi pekerjaan berdasarkan drop point/lokasi." data={data.byLocation} />
        <Card>
          <CardHeader title="Rincian DSR per Barge" description="DSR Awal, Final DSR, dan selisih tonase." />
          <CardContent>
            <DataTable
              rows={data.bargeRows}
              showActions={false}
              columns={[
                { key: 'jobNumber', label: 'Job' },
                { key: 'vessel', label: 'Vessel' },
                { key: 'barge', label: 'Barge' },
                { key: 'rkbmNo', label: 'RKBM' },
                { key: 'dsrStart', label: 'DSR Awal', render: (row) => `${row.dsrStart.toLocaleString('id-ID')} MT` },
                { key: 'finalDsr', label: 'Final DSR', render: (row) => `${row.finalDsr.toLocaleString('id-ID')} MT` },
                { key: 'difference', label: 'Selisih', render: (row) => `${row.difference.toLocaleString('id-ID')} MT` },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function CustomerAnalysis({ data }) {
  const totals = data.reduce((acc, row) => ({
    pekerjaan: acc.pekerjaan + row.pekerjaan,
    invoiceValue: acc.invoiceValue + row.invoiceValue,
    reimbursement: acc.reimbursement + row.reimbursement,
    outstanding: acc.outstanding + row.outstanding,
  }), { pekerjaan: 0, invoiceValue: 0, reimbursement: 0, outstanding: 0 })
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Jumlah Pekerjaan" value={totals.pekerjaan} />
        <StatCard label="Nilai Invoice" value={currency(totals.invoiceValue)} tone="success" />
        <StatCard label="Total Reimbursement" value={currency(totals.reimbursement)} tone="warning" />
        <StatCard label="Outstanding" value={currency(totals.outstanding)} tone="danger" />
      </div>
      <Card>
        <CardHeader title="Analisis per Customer" description="Pekerjaan, invoice, rata-rata bayar, reimbursement, dan outstanding." />
        <CardContent>
          <DataTable
            rows={data}
            showActions={false}
            columns={[
              { key: 'customer', label: 'Customer' },
              { key: 'pekerjaan', label: 'Pekerjaan' },
              { key: 'invoiceValue', label: 'Nilai Invoice', render: (row) => currency(row.invoiceValue) },
              { key: 'avgPayDays', label: 'Rata-rata Bayar', render: (row) => `${row.avgPayDays} hari` },
              { key: 'reimbursement', label: 'Reimbursement', render: (row) => currency(row.reimbursement) },
              { key: 'outstanding', label: 'Outstanding', render: (row) => currency(row.outstanding) },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function InvoiceAnalysis({ data }) {
  const totalValue = data.rows.reduce((sum, item) => sum + Number(item.total || 0), 0)
  const due = data.rows.filter((item) => item.status !== 'Lunas').length
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Nilai Invoice" value={currency(totalValue)} />
        <StatCard label="Invoice Terbit" value={data.rows.length} tone="success" />
        <StatCard label="Jatuh Tempo" value={due} tone="warning" />
        <StatCard label="Lunas" value={data.rows.filter((item) => item.status === 'Lunas').length} tone="success" />
      </div>
      <LinePanel data={data.monthly} />
      <Card>
        <CardHeader title="Status Invoice" description="Terbit, dikirim, diterima, jatuh tempo, dibayar sebagian, dan lunas." />
        <CardContent>
          <DataTable
            rows={data.monthly.map((item) => ({ ...item, id: item.month }))}
            showActions={false}
            columns={[
              { key: 'month', label: 'Bulan' },
              { key: 'nilai', label: 'Nilai', render: (row) => currency(row.nilai) },
              { key: 'terbit', label: 'Terbit' },
              { key: 'dikirim', label: 'Dikirim' },
              { key: 'diterima', label: 'Diterima' },
              { key: 'jatuhTempo', label: 'Jatuh Tempo' },
              { key: 'dibayarSebagian', label: 'Dibayar Sebagian' },
              { key: 'lunas', label: 'Lunas' },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function ReimbursementAnalysis({ data }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {data.stats.map((stat) => <StatCard key={stat.label} label={stat.label} value={stat.value} />)}
      </div>
      <Card>
        <CardHeader title="Analisis Reimbursement PNBP" description="Status PNBP dibayar, debit note, dan pembayaran customer." />
        <CardContent>
          <DataTable
            rows={data.rows}
            showActions={false}
            columns={[
              { key: 'type', label: 'Jenis PNBP' },
              { key: 'billingNo', label: 'Billing' },
              { key: 'ntpn', label: 'NTPN' },
              { key: 'amount', label: 'Nominal', render: (row) => currency(row.amount) },
              { key: 'payer', label: 'Pihak Pembayar' },
              { key: 'debitNoteStatus', label: 'Status Debit Note', render: (row) => <Badge tone={statusTone(row.debitNoteStatus)}>{row.debitNoteStatus}</Badge> },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function ReceivableAnalysis({ data }) {
  const total = data.buckets.reduce((sum, item) => sum + item.value, 0)
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {data.buckets.map((bucket) => <StatCard key={bucket.bucket} label={`Aging ${bucket.bucket}`} value={currency(bucket.value)} tone={bucket.bucket === '>90' ? 'danger' : 'warning'} />)}
      </div>
      <BarPanel title="Aging Piutang" description={`Total piutang ${currency(total)}.`} data={data.buckets.map((item) => ({ name: item.bucket, value: item.value }))} valueName="Piutang" />
    </div>
  )
}

function DocumentAnalysis({ data }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Rata-rata Kelengkapan" value={`${data.averageCompleteness}%`} tone="success" />
        <StatCard label="Kategori Sering Bermasalah" value={data.missingByCategory[0]?.name ?? '-'} tone="warning" />
        <StatCard label="Job Terendah" value={data.lowestJobs[0]?.jobNumber ?? '-'} tone="danger" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <PiePanel title="Dokumen Paling Sering Belum Tersedia" description="Kategori dokumen dengan status revisi/tidak berlaku." data={data.missingByCategory} />
        <Card>
          <CardHeader title="Job Kelengkapan Terendah" description="Prioritas follow-up dokumen." />
          <CardContent>
            <DataTable
              rows={data.lowestJobs}
              showActions={false}
              columns={[
                { key: 'jobNumber', label: 'Job' },
                { key: 'customer', label: 'Customer' },
                { key: 'vessel', label: 'Vessel' },
                { key: 'completeness', label: 'Kelengkapan', render: (row) => <Badge tone={row.completeness < 75 ? 'danger' : 'warning'}>{row.completeness}%</Badge> },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <FormField label={label}>
      <SelectInput value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </SelectInput>
    </FormField>
  )
}
