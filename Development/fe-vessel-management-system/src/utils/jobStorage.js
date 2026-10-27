const CREATED_JOBS_KEY = 'rkbm_created_jobs'
const JOB_DRAFT_KEY = 'rkbm_job_draft'

export function getCreatedJobs() {
  try {
    return JSON.parse(window.localStorage.getItem(CREATED_JOBS_KEY)) ?? []
  } catch {
    return []
  }
}

export function saveCreatedJob(job) {
  const existing = getCreatedJobs().filter((item) => item.id !== job.id)
  window.localStorage.setItem(CREATED_JOBS_KEY, JSON.stringify([job, ...existing]))
}

export function getSalesJobs() {
  return getCreatedJobs().filter((job) => job.source === 'sales')
}

export function findCreatedJobById(jobId) {
  return getCreatedJobs().find((job) => job.id === jobId)
}

export function nextSalesJobNumber() {
  const year = new Date().getFullYear()
  const count = getSalesJobs().filter((job) => job.jobNumber?.includes(`/${year}/`)).length + 1
  return `AG/RKBM/${year}/${String(count).padStart(4, '0')}`
}

export function createSalesJobDraft() {
  const now = new Date()
  const id = `JOB-SALES-${now.getTime()}`

  return {
    id,
    source: 'sales',
    salesStatus: 'DRAFT',
    operationalStatus: 'DRAFT',
    jobNumber: nextSalesJobNumber(),
    customer: '',
    endUser: '',
    vessel: '',
    activityType: 'Domestik',
    dropPoint: '',
    startDate: '',
    estimatedTonnage: '',
    customerPic: '',
    services: ['Jasa PBM'],
    reimbursementTypes: [],
    notes: '',
    orders: [],
    documents: {
      appointmentLetter: { title: 'Surat Penunjukan', files: [] },
      shippingInstruction: { title: 'Shipping Instruction', files: [] },
    },
    vesselCompleteDate: '-',
    documentCompleteness: 0,
    invoiceStatus: '-',
    debitNoteStatus: '-',
    volume: '-',
    progress: 0,
    reimbursementTotal: 'Rp 0',
    invoiceTotal: 'Rp 0',
    outstandingTotal: 'Rp 0',
    barges: [],
    initialDocuments: [],
    rkbmDocuments: [],
    dsr: [],
    pnbp: [],
    invoices: [],
    debitNotes: [],
    payments: [],
    timeline: [],
    activities: [],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }
}

export function toSalesJobRecord(form, status = 'DRAFT') {
  const tonnage = Number(form.estimatedTonnage || 0)
  const docs = [
    form.documents?.appointmentLetter ?? { title: 'Surat Penunjukan', files: [] },
  ]
  const completedDocs = docs.filter((doc) => doc.files?.length).length
  const now = new Date()
  const start = form.startDate ? new Date(form.startDate) : now

  return {
    ...form,
    source: 'sales',
    salesStatus: status,
    operationalStatus: status,
    year: String(start.getFullYear()),
    month: new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(start),
    volume: tonnage ? `${tonnage.toLocaleString('id-ID')} MT` : '-',
    documentCompleteness: Math.round((completedDocs / docs.length) * 100),
    initialDocuments: docs.map((doc) => ({
      name: doc.title,
      owner: 'Sales',
      date: doc.files?.[0]?.uploadedAt?.slice(0, 10) ?? '-',
      status: doc.files?.length ? 'Lengkap' : 'Menunggu Dokumen',
    })),
    timeline: [
      { label: 'Draft Sales', date: form.createdAt ?? now.toISOString(), status: status === 'DRAFT' ? 'Aktif' : 'Selesai' },
      { label: 'Kirim ke Operational', date: status === 'OPERATIONAL' ? now.toISOString() : '-', status: status === 'OPERATIONAL' ? 'Selesai' : 'Menunggu' },
    ],
    activities: [
      ...(form.activities ?? []),
      {
        time: new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(now),
        user: 'Sales',
        activity: status === 'OPERATIONAL' ? 'Job dikirim ke Operational' : 'Draft job disimpan',
      },
    ],
    updatedAt: now.toISOString(),
  }
}

export const operationalUploadCategories = [
  'Barge Nomination',
  'RKBM',
  'DSR Awal',
  'Final DSR',
  'Dokumen Operasional Lainnya',
]

export function createOperationalBarge() {
  return {
    id: crypto.randomUUID(),
    tugBoat: '',
    barge: '',
    nominationDate: '',
    rkbmNo: '',
    rkbmIssueDate: '',
    dsrStart: '',
    finalDsr: '',
    startDate: '',
    finishDate: '',
    vesselComplete: false,
    uploads: Object.fromEntries(operationalUploadCategories.map((category) => [category, []])),
  }
}

export function calculateDsrDiff(barge) {
  return Number(barge.finalDsr || 0) - Number(barge.dsrStart || 0)
}

export function isBargeReadyForFinance(barge) {
  return Boolean(barge.rkbmNo && barge.rkbmIssueDate && barge.finalDsr && barge.vesselComplete)
}

export function updateOperationalJob(job, barges, status = job.operationalStatus) {
  const now = new Date()
  const readyBarges = barges.filter(isBargeReadyForFinance).length
  const uploadedFiles = barges.flatMap((barge) => Object.values(barge.uploads ?? {}).flat()).length
  const firstVesselComplete = barges.find((barge) => barge.vesselComplete)
  const documentCompleteness = barges.length ? Math.round(((readyBarges / barges.length) * 80) + Math.min(uploadedFiles, barges.length * 5) * 4) : job.documentCompleteness

  return {
    ...job,
    barges: barges.map((barge) => ({
      ...barge,
      cargoVolume: job.volume,
      status: barge.vesselComplete ? 'Vessel Complete' : 'OPERATIONAL',
      dsrDifference: calculateDsrDiff(barge),
    })),
    operationalStatus: status,
    salesStatus: job.salesStatus === 'DRAFT' ? 'OPERATIONAL' : job.salesStatus,
    vesselCompleteDate: firstVesselComplete?.finishDate || job.vesselCompleteDate || '-',
    documentCompleteness: Math.max(0, Math.min(100, Number(documentCompleteness || 0))),
    progress: status === 'FINANCE' ? 70 : Math.max(job.progress ?? 0, barges.length ? 45 : 20),
    paymentStatus: status === 'FINANCE' ? (job.paymentStatus ?? 'BELUM DITAGIH') : job.paymentStatus,
    activities: [
      ...(job.activities ?? []),
      {
        time: new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(now),
        user: 'Operational',
        activity: status === 'FINANCE' ? 'Job dikirim ke Finance' : 'Data barge operasional diperbarui',
      },
    ],
    updatedAt: now.toISOString(),
  }
}

export const financeUploadCategories = [
  'Invoice',
  'Debit Note',
  'Bukti PNBP',
  'Bukti Pembayaran',
]

export function createFinanceData(seed = {}) {
  return {
    tariffRkbmMuatPerMt: '',
    rkbmBongkar: '',
    ppn: '11',
    pnbpJasaBarang: '',
    pnbpJasaPbm: '',
    invoiceNo: '',
    invoiceDate: '',
    debitNoteNo: '',
    debitNoteDate: '',
    paymentDate: '',
    paymentStatus: 'BELUM DITAGIH',
    notes: '',
    ...seed,
    uploads: {
      ...Object.fromEntries(financeUploadCategories.map((category) => [category, []])),
      ...seed.uploads,
    },
  }
}

export function calculateFinance(job, financeData = createFinanceData()) {
  const tariff = Number(financeData.tariffRkbmMuatPerMt || 0)
  const rkbmBongkar = Number(financeData.rkbmBongkar || 0)
  const ppnRate = Number(financeData.ppn || 0)
  const pnbpJasaBarang = Number(financeData.pnbpJasaBarang || 0)
  const pnbpJasaPbm = Number(financeData.pnbpJasaPbm || 0)
  const barges = job.barges ?? []
  const perBarge = barges.map((barge) => {
    const finalDsr = Number(barge.finalDsr || 0)
    const rkbmMuat = finalDsr * tariff

    return {
      id: barge.id,
      tugBoat: barge.tugBoat,
      barge: barge.barge,
      finalDsr,
      tariff,
      rkbmMuat,
    }
  })
  const totalRkbmMuat = perBarge.reduce((total, row) => total + row.rkbmMuat, 0)
  const totalRkbm = totalRkbmMuat + rkbmBongkar
  const ppnAmount = totalRkbm * (ppnRate / 100)
  const totalInvoice = totalRkbm + ppnAmount
  const totalReimbursement = pnbpJasaBarang + pnbpJasaPbm

  return {
    perBarge,
    totalRkbmMuat,
    rkbmBongkar,
    ppnRate,
    ppnAmount,
    totalRkbm,
    totalInvoice,
    pnbpJasaBarang,
    pnbpJasaPbm,
    totalReimbursement,
  }
}

export function updateFinanceJob(job, financeData, status = job.operationalStatus) {
  const now = new Date()
  const calculated = calculateFinance(job, financeData)
  const nextPaymentStatus = status === 'SELESAI' ? 'LUNAS' : financeData.paymentStatus

  return {
    ...job,
    finance: createFinanceData({ ...financeData, paymentStatus: nextPaymentStatus }),
    operationalStatus: status,
    paymentStatus: nextPaymentStatus,
    invoiceStatus: nextPaymentStatus === 'BELUM DITAGIH' ? 'BELUM DITAGIH' : nextPaymentStatus === 'LUNAS' ? 'LUNAS' : 'SUDAH DITAGIH',
    debitNoteStatus: financeData.debitNoteNo ? 'SUDAH DITAGIH' : job.debitNoteStatus,
    invoiceTotal: formatCurrency(calculated.totalInvoice),
    reimbursementTotal: formatCurrency(calculated.totalReimbursement),
    outstandingTotal: nextPaymentStatus === 'LUNAS' ? 'Rp 0' : formatCurrency(calculated.totalInvoice),
    invoices: financeData.invoiceNo ? [{
      id: financeData.invoiceNo,
      amount: formatCurrency(calculated.totalInvoice),
      issueDate: financeData.invoiceDate || '-',
      dueDate: '-',
      status: nextPaymentStatus,
    }] : job.invoices ?? [],
    debitNotes: financeData.debitNoteNo ? [{
      id: financeData.debitNoteNo,
      amount: formatCurrency(calculated.totalReimbursement),
      reason: 'Reimbursement PNBP',
      status: nextPaymentStatus,
    }] : job.debitNotes ?? [],
    payments: financeData.paymentDate ? [{
      id: `PAY-${job.id}`,
      date: financeData.paymentDate,
      amount: formatCurrency(calculated.totalInvoice),
      method: 'Transfer Bank',
      status: nextPaymentStatus,
    }] : job.payments ?? [],
    progress: status === 'SELESAI' ? 100 : 85,
    activities: [
      ...(job.activities ?? []),
      {
        time: new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(now),
        user: 'Finance',
        activity: status === 'SELESAI' ? 'Job diselesaikan oleh Finance' : 'Data keuangan diperbarui',
      },
    ],
    updatedAt: now.toISOString(),
  }
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

export function getJobDraft() {
  try {
    return JSON.parse(window.localStorage.getItem(JOB_DRAFT_KEY))
  } catch {
    return null
  }
}

export function saveJobDraft(draft) {
  window.localStorage.setItem(JOB_DRAFT_KEY, JSON.stringify(draft))
}

export function clearJobDraft() {
  window.localStorage.removeItem(JOB_DRAFT_KEY)
}

export function draftKey() {
  return JOB_DRAFT_KEY
}
