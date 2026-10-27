import { jobList } from '../data/jobs'
import { getFinanceState } from './financeStorage'
import { getCreatedJobs } from './jobStorage'
import { applyJobWorkflowPatch } from './jobWorkflowState'
import { getOperationalState, uploadCategories } from './operationalStorage'

const ARCHIVE_REVISIONS_KEY = 'rkbm_archive_revisions'

export const archiveCategories = [
  'Dokumen Awal',
  'Barge Nomination',
  'RKBM Muat',
  'RKBM Bongkar',
  'DSR Awal',
  'Final DSR',
  'Laporan Kegiatan',
  'Berita Acara',
  'Invoice',
  'Faktur Pajak',
  'PNBP',
  'Debit Note',
  'Pembayaran',
]

export const archiveStatuses = ['Dokumen Terbaru', 'Dokumen Lama', 'Revisi', 'Tidak Berlaku']
export const uploaderRoles = ['Sales Support', 'Operational', 'Finance', 'Admin']

export function getArchiveDocuments() {
  const generated = [
    ...documentsFromJobs(),
    ...documentsFromFinance(),
  ]
  return [...getArchiveRevisions(), ...generated].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
}

export function addDocumentRevision(document) {
  const revisions = getArchiveRevisions()
  const latestVersion = Math.max(document.version ?? 1, ...document.versions.map((item) => item.version))
  const revision = {
    ...document,
    id: `${document.id}-REV-${Date.now()}`,
    version: latestVersion + 1,
    fileName: document.fileName.replace(/(\.[^.]+)$/u, `_rev${latestVersion + 1}$1`),
    uploadedAt: new Date().toISOString(),
    status: 'Revisi',
    uploadedBy: 'Admin Archive',
    size: document.size + 128000,
    versions: [
      { version: latestVersion + 1, fileName: document.fileName.replace(/(\.[^.]+)$/u, `_rev${latestVersion + 1}$1`), uploadedAt: new Date().toISOString(), status: 'Revisi', uploadedBy: 'Admin Archive' },
      ...document.versions,
    ],
  }
  window.localStorage.setItem(ARCHIVE_REVISIONS_KEY, JSON.stringify([revision, ...revisions]))
  return revision
}

export function getArchiveFilters(documents) {
  return {
    categories: ['Semua Kategori', ...archiveCategories],
    years: ['Semua Tahun', ...unique(documents.map((item) => String(new Date(item.documentDate).getFullYear())).filter(Boolean))],
    customers: ['Semua Customer', ...unique(documents.map((item) => item.customer).filter(Boolean))],
    vessels: ['Semua Vessel', ...unique(documents.map((item) => item.vessel).filter(Boolean))],
    statuses: ['Semua Status', ...archiveStatuses],
    uploaderRoles: ['Semua Role', ...uploaderRoles],
  }
}

function getArchiveRevisions() {
  try {
    return JSON.parse(window.localStorage.getItem(ARCHIVE_REVISIONS_KEY)) ?? []
  } catch {
    return []
  }
}

function documentsFromJobs() {
  const jobs = [...getCreatedJobs(), ...jobList].map(applyJobWorkflowPatch)
  return jobs.flatMap((job) => {
    const operational = getOperationalState(job)
    const initialDocs = (job.initialDocuments ?? []).map((doc, index) => createDocument({
      id: `${job.id}-INITIAL-${index}`,
      category: 'Dokumen Awal',
      fileName: `${doc.name || 'Dokumen Awal'}_${job.jobNumber}.pdf`,
      documentNumber: doc.name === 'Cargo Manifest' ? '-' : `DOC-${job.jobNumber}-${index + 1}`,
      documentDate: normalizeDate(doc.date, job.startDate),
      customer: job.customer,
      vessel: job.vessel,
      jobNumber: job.jobNumber,
      jobId: job.id,
      rkbmNo: '-',
      invoiceNo: '-',
      debitNoteNo: '-',
      version: 1,
      size: 680000 + index * 120000,
      uploadedBy: doc.owner === 'Sales Support' ? 'Maya Lestari' : 'Dimas Wirawan',
      uploaderRole: doc.owner ?? 'Sales Support',
      uploadedAt: normalizeDate(doc.date, job.startDate),
      status: doc.status === 'Menunggu Dokumen' ? 'Tidak Berlaku' : 'Dokumen Terbaru',
      type: 'pdf',
      downloadAllowedForViewer: true,
    }))

    const operationalDocs = operational.barges.flatMap((barge, bargeIndex) =>
      uploadCategories.flatMap((category, categoryIndex) => {
        const files = barge.uploads?.[category] ?? []
        if (!files.length && !['RKBM Muat', 'RKBM Bongkar', 'Final DSR'].includes(category)) return []
        const file = files[0] ?? { name: `${category}_${barge.rkbmNo || barge.barge}.pdf`, size: 740000 }
        return [createDocument({
          id: `${job.id}-${barge.id}-${categoryIndex}`,
          category,
          fileName: file.name,
          documentNumber: category.includes('RKBM') ? barge.rkbmNo : `${category.replaceAll(' ', '-')}-${bargeIndex + 1}`,
          documentDate: barge.rkbmIssueDate || barge.finishDate || job.startDate,
          customer: job.customer,
          vessel: job.vessel,
          jobNumber: job.jobNumber,
          jobId: job.id,
          rkbmNo: barge.rkbmNo || '-',
          invoiceNo: '-',
          debitNoteNo: '-',
          version: barge.isFinalLocked ? 2 : 1,
          size: file.size ?? 740000,
          uploadedBy: 'Dimas Wirawan',
          uploaderRole: 'Operational',
          uploadedAt: barge.finishDate || barge.rkbmIssueDate || job.startDate,
          status: barge.isFinalLocked ? 'Dokumen Terbaru' : 'Revisi',
          type: category === 'Berita Acara' ? 'image' : 'pdf',
          downloadAllowedForViewer: category !== 'Final DSR',
        })]
      }),
    )

    return [...initialDocs, ...operationalDocs]
  })
}

function documentsFromFinance() {
  const state = getFinanceState()
  const invoices = state.invoices.flatMap((invoice) => [
    createDocument({
      id: `${invoice.id}-PDF`,
      category: 'Invoice',
      fileName: invoice.files?.[0]?.name ?? `${invoice.invoiceNo}.pdf`,
      documentNumber: invoice.invoiceNo,
      documentDate: invoice.invoiceDate,
      customer: invoice.lines?.[0]?.customer ?? 'PT Lintas Samudera Energi',
      vessel: invoice.lines?.[0]?.vessel ?? 'MV LARUS',
      jobNumber: invoice.lines?.[0]?.jobNumber ?? 'AG/PBM/2026/0001',
      jobId: invoice.lines?.[0]?.jobId ?? 'JOB-2026-0001',
      rkbmNo: invoice.lines?.[0]?.rkbmNo ?? '-',
      invoiceNo: invoice.invoiceNo,
      debitNoteNo: '-',
      version: 1,
      size: invoice.files?.[0]?.size ?? 920000,
      uploadedBy: 'Nadia Puspita',
      uploaderRole: 'Finance',
      uploadedAt: invoice.invoiceDate,
      status: invoice.status === 'Lunas' ? 'Dokumen Lama' : 'Dokumen Terbaru',
      type: 'pdf',
      downloadAllowedForViewer: false,
    }),
    createDocument({
      id: `${invoice.id}-TAX`,
      category: 'Faktur Pajak',
      fileName: `Faktur_Pajak_${invoice.invoiceNo}.pdf`,
      documentNumber: invoice.taxInvoiceNo || '-',
      documentDate: invoice.invoiceDate,
      customer: invoice.lines?.[0]?.customer ?? 'PT Lintas Samudera Energi',
      vessel: invoice.lines?.[0]?.vessel ?? 'MV LARUS',
      jobNumber: invoice.lines?.[0]?.jobNumber ?? 'AG/PBM/2026/0001',
      jobId: invoice.lines?.[0]?.jobId ?? 'JOB-2026-0001',
      rkbmNo: invoice.lines?.[0]?.rkbmNo ?? '-',
      invoiceNo: invoice.invoiceNo,
      debitNoteNo: '-',
      version: 1,
      size: 510000,
      uploadedBy: 'Nadia Puspita',
      uploaderRole: 'Finance',
      uploadedAt: invoice.invoiceDate,
      status: 'Dokumen Terbaru',
      type: 'pdf',
      downloadAllowedForViewer: false,
    }),
  ])

  const pnbp = state.pnbp.map((item) => createDocument({
    id: `${item.id}-PROOF`,
    category: 'PNBP',
    fileName: item.proofFile?.name ?? `Bukti_${item.billingNo}.pdf`,
    documentNumber: item.billingNo,
    documentDate: item.paidDate,
    customer: item.payer,
    vessel: 'MV LARUS',
    jobNumber: 'AG/PBM/2026/0001',
    jobId: 'JOB-2026-0001',
    rkbmNo: '-',
    invoiceNo: '-',
    debitNoteNo: '-',
    version: 1,
    size: item.proofFile?.size ?? 460000,
    uploadedBy: 'Nadia Puspita',
    uploaderRole: 'Finance',
    uploadedAt: item.paidDate,
    status: 'Dokumen Terbaru',
    type: 'pdf',
    downloadAllowedForViewer: false,
  }))

  const debitNotes = state.debitNotes.map((item) => createDocument({
    id: `${item.id}-PDF`,
    category: 'Debit Note',
    fileName: `${item.debitNoteNo}.pdf`,
    documentNumber: item.debitNoteNo,
    documentDate: item.debitNoteDate,
    customer: item.customer,
    vessel: 'MV LARUS',
    jobNumber: 'AG/PBM/2026/0001',
    jobId: 'JOB-2026-0001',
    rkbmNo: '-',
    invoiceNo: '-',
    debitNoteNo: item.debitNoteNo,
    version: 1,
    size: 610000,
    uploadedBy: 'Nadia Puspita',
    uploaderRole: 'Finance',
    uploadedAt: item.debitNoteDate,
    status: item.status === 'Lunas' ? 'Dokumen Lama' : 'Dokumen Terbaru',
    type: 'pdf',
    downloadAllowedForViewer: false,
  }))

  return [...invoices, ...pnbp, ...debitNotes]
}

function createDocument(input) {
  return {
    ...input,
    versions: [
      { version: input.version, fileName: input.fileName, uploadedAt: input.uploadedAt, status: input.status, uploadedBy: input.uploadedBy },
      ...(input.version > 1 ? [{ version: input.version - 1, fileName: input.fileName.replace(/(\.[^.]+)$/u, '_old$1'), uploadedAt: input.documentDate, status: 'Dokumen Lama', uploadedBy: input.uploadedBy }] : []),
    ],
  }
}

function normalizeDate(value, fallback) {
  if (!value || value === '-') return fallback || '2026-07-30'
  return value
}

function unique(values) {
  return [...new Set(values)]
}
