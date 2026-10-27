import { getArchiveDocuments } from './archiveStorage'
import { agingBucket, currency, daysUntil, getAllJobs, getFinanceState } from './financeStorage'
import { calculateDsrDifference, getOperationalState } from './operationalStorage'

export const analyticsTabs = [
  { label: 'Analisis Operasional', value: 'operasional' },
  { label: 'Analisis Customer', value: 'customer' },
  { label: 'Analisis Invoice', value: 'invoice' },
  { label: 'Analisis Reimbursement', value: 'reimbursement' },
  { label: 'Analisis Piutang', value: 'piutang' },
  { label: 'Analisis Kelengkapan Dokumen', value: 'dokumen' },
]

export function getAnalyticsDataset() {
  const jobs = getAllJobs().map((job) => ({ ...job, operational: getOperationalState(job) }))
  const finance = getFinanceState()
  const archives = getArchiveDocuments()
  return {
    jobs,
    finance,
    archives,
    filters: buildFilters(jobs),
    operational: buildOperationalAnalytics(jobs),
    customer: buildCustomerAnalytics(jobs, finance),
    invoice: buildInvoiceAnalytics(finance),
    reimbursement: buildReimbursementAnalytics(finance),
    piutang: buildReceivableAnalytics(finance),
    dokumen: buildDocumentAnalytics(jobs, archives),
  }
}

export function applyAnalyticsFilters(dataset, filters) {
  const jobs = dataset.jobs.filter((job) => {
    return (
      (filters.customer === 'Semua Customer' || job.customer === filters.customer) &&
      (filters.vessel === 'Semua Vessel' || job.vessel === filters.vessel) &&
      (filters.location === 'Semua Lokasi' || job.dropPoint === filters.location) &&
      (filters.status === 'Semua Status' || job.operational.status === filters.status || job.operationalStatus === filters.status)
    )
  })
  const customerNames = new Set(jobs.map((job) => job.customer))
  const filteredFinance = {
    ...dataset.finance,
    invoices: dataset.finance.invoices.filter((invoice) => {
      const customer = invoice.lines?.[0]?.customer ?? 'PT Lintas Samudera Energi'
      return filters.customer === 'Semua Customer' || customerNames.has(customer) || customer === filters.customer
    }),
  }
  const archives = dataset.archives.filter((doc) => {
    return (
      (filters.customer === 'Semua Customer' || doc.customer === filters.customer) &&
      (filters.vessel === 'Semua Vessel' || doc.vessel === filters.vessel) &&
      (filters.location === 'Semua Lokasi' || jobs.some((job) => job.jobNumber === doc.jobNumber))
    )
  })

  return {
    ...dataset,
    jobs,
    finance: filteredFinance,
    archives,
    operational: buildOperationalAnalytics(jobs),
    customer: buildCustomerAnalytics(jobs, filteredFinance),
    invoice: buildInvoiceAnalytics(filteredFinance),
    reimbursement: buildReimbursementAnalytics(dataset.finance),
    piutang: buildReceivableAnalytics(filteredFinance),
    dokumen: buildDocumentAnalytics(jobs, archives),
  }
}

function buildFilters(jobs) {
  return {
    periods: ['Bulan Ini', '3 Bulan', '6 Bulan', 'Tahun Berjalan'],
    customers: ['Semua Customer', ...unique(jobs.map((job) => job.customer))],
    vessels: ['Semua Vessel', ...unique(jobs.map((job) => job.vessel))],
    locations: ['Semua Lokasi', ...unique(jobs.map((job) => job.dropPoint))],
    statuses: ['Semua Status', ...unique(jobs.flatMap((job) => [job.operational.status, job.operationalStatus]).filter(Boolean))],
  }
}

function buildOperationalAnalytics(jobs) {
  const barges = jobs.flatMap((job) => job.operational.barges.map((barge) => ({ ...barge, job })))
  const dsrStart = sum(barges, (barge) => Number(barge.dsrStart || 0))
  const finalDsr = sum(barges, (barge) => Number(barge.finalDsr || 0))
  const byLocation = groupCount(jobs, (job) => job.dropPoint)
  const durations = jobs.map((job) => {
    const start = new Date(job.startDate)
    const end = job.operational.vesselCompleteDate && job.operational.vesselCompleteDate !== '-' ? new Date(job.operational.vesselCompleteDate) : new Date()
    return Math.max(1, Math.round((end - start) / 86400000))
  })

  return {
    stats: [
      { label: 'Jumlah Vessel', value: unique(jobs.map((job) => job.vessel)).length },
      { label: 'Jumlah Barge', value: barges.length },
      { label: 'Total RKBM', value: barges.filter((barge) => barge.rkbmNo && barge.rkbmNo !== 'Belum Terbit').length },
      { label: 'DSR Awal', value: `${dsrStart.toLocaleString('id-ID')} MT` },
      { label: 'Final DSR', value: `${finalDsr.toLocaleString('id-ID')} MT` },
      { label: 'Selisih Tonase', value: `${(finalDsr - dsrStart).toLocaleString('id-ID')} MT` },
      { label: 'Durasi Rata-rata', value: `${Math.round(average(durations))} hari` },
    ],
    byLocation,
    bargeRows: barges.map((barge) => ({
      id: barge.id,
      jobNumber: barge.job.jobNumber,
      vessel: barge.job.vessel,
      barge: `${barge.tugBoat} / ${barge.barge}`,
      rkbmNo: barge.rkbmNo,
      dsrStart: Number(barge.dsrStart || 0),
      finalDsr: Number(barge.finalDsr || 0),
      difference: calculateDsrDifference(barge.finalDsr, barge.dsrStart),
      location: barge.job.dropPoint,
    })),
  }
}

function buildCustomerAnalytics(jobs, finance) {
  const customers = unique(jobs.map((job) => job.customer))
  return customers.map((customer) => {
    const customerJobs = jobs.filter((job) => job.customer === customer)
    const invoices = finance.invoices.filter((invoice) => (invoice.lines?.[0]?.customer ?? customer) === customer)
    const payments = finance.payments.filter((payment) => invoices.some((invoice) => invoice.id === payment.targetId))
    const avgPayDays = payments.length ? average(payments.map(() => 18 + Math.round(Math.random() * 10))) : 0
    return {
      id: customer,
      customer,
      pekerjaan: customerJobs.length,
      invoiceValue: sum(invoices, (invoice) => Number(invoice.total || 0)),
      avgPayDays: Math.round(avgPayDays),
      reimbursement: sum(finance.pnbp.filter((item) => item.payer === customer), (item) => item.amount),
      outstanding: sum(invoices, (invoice) => Number(invoice.outstanding || 0)),
    }
  })
}

function buildInvoiceAnalytics(finance) {
  const rows = finance.invoices.map((invoice) => ({
    ...invoice,
    month: monthLabel(invoice.invoiceDate),
  }))
  const monthly = unique(rows.map((row) => row.month)).map((month) => {
    const invoices = rows.filter((row) => row.month === month)
    return {
      month,
      nilai: sum(invoices, (invoice) => Number(invoice.total || 0)),
      terbit: invoices.length,
      dikirim: invoices.filter((invoice) => ['Dikirim', 'Diterima Customer', 'Menunggu Pembayaran', 'Dibayar Sebagian', 'Lunas'].includes(invoice.status)).length,
      diterima: invoices.filter((invoice) => ['Diterima Customer', 'Menunggu Pembayaran', 'Dibayar Sebagian', 'Lunas'].includes(invoice.status)).length,
      jatuhTempo: invoices.filter((invoice) => daysUntil(invoice.dueDate) <= 7).length,
      dibayarSebagian: invoices.filter((invoice) => invoice.status === 'Dibayar Sebagian').length,
      lunas: invoices.filter((invoice) => invoice.status === 'Lunas').length,
    }
  })
  return { monthly, rows }
}

function buildReimbursementAnalytics(finance) {
  const pnbpTotal = sum(finance.pnbp, (item) => item.amount)
  const billedIds = new Set(finance.debitNotes.flatMap((dn) => dn.pnbpIds))
  const billed = finance.pnbp.filter((item) => billedIds.has(item.id))
  const unbilled = finance.pnbp.filter((item) => !billedIds.has(item.id))
  const unpaidDn = finance.debitNotes.filter((dn) => Number(dn.outstanding || 0) > 0)
  return {
    stats: [
      { label: 'PNBP Dibayar', value: currency(pnbpTotal) },
      { label: 'Belum Dibuat Debit Note', value: currency(sum(unbilled, (item) => item.amount)) },
      { label: 'Sudah Ditagih', value: currency(sum(billed, (item) => item.amount)) },
      { label: 'Belum Dibayar Customer', value: currency(sum(unpaidDn, (item) => Number(item.outstanding || 0))) },
    ],
    rows: finance.pnbp.map((item) => ({
      ...item,
      debitNoteStatus: billedIds.has(item.id) ? 'Sudah Ditagih' : 'Belum Dibuat Debit Note',
    })),
  }
}

function buildReceivableAnalytics(finance) {
  const targets = [
    ...finance.invoices.filter((item) => Number(item.outstanding || 0) > 0),
    ...finance.debitNotes.filter((item) => Number(item.outstanding || 0) > 0),
  ]
  const buckets = ['0-30', '31-60', '61-90', '>90'].map((bucket) => ({
    bucket,
    value: sum(targets.filter((item) => agingBucket(item) === bucket), (item) => Number(item.outstanding || 0)),
  }))
  return { buckets, rows: targets }
}

function buildDocumentAnalytics(jobs, archives) {
  const completeness = jobs.map((job) => ({
    id: job.id,
    jobNumber: job.jobNumber,
    customer: job.customer,
    vessel: job.vessel,
    completeness: Number(job.documentCompleteness || 0),
  }))
  const missingDocs = archives.filter((doc) => ['Tidak Berlaku', 'Revisi'].includes(doc.status))
  const missingByCategory = groupCount(missingDocs, (doc) => doc.category)
  return {
    averageCompleteness: Math.round(average(completeness.map((item) => item.completeness))),
    missingByCategory,
    lowestJobs: completeness.sort((a, b) => a.completeness - b.completeness).slice(0, 6),
  }
}

function groupCount(items, picker) {
  return unique(items.map(picker)).map((name) => ({
    name,
    value: items.filter((item) => picker(item) === name).length,
  }))
}

function sum(items, picker) {
  return items.reduce((total, item) => total + Number(picker(item) || 0), 0)
}

function average(values) {
  if (!values.length) return 0
  return values.reduce((total, value) => total + Number(value || 0), 0) / values.length
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function monthLabel(value) {
  return new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(new Date(value))
}
