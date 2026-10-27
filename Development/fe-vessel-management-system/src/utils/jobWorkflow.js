export const workflowStages = [
  {
    key: 'salesInputOrder',
    label: 'Sales Input Order',
    shortLabel: 'Input Order',
    owner: 'sales',
    ownerLabel: 'Sales',
    description: 'Input data customer, order, dan dokumen awal.',
    statuses: ['Draft Sales', 'Dokumen Awal Belum Lengkap', 'Dokumen Awal Lengkap'],
  },
  {
    key: 'financeVerifyOrder',
    label: 'Finance Verifikasi Order',
    shortLabel: 'Verifikasi Order',
    owner: 'finance',
    ownerLabel: 'Finance',
    description: 'Validasi order sebelum pekerjaan masuk operasional.',
    statuses: ['Diajukan ke Operational', 'Diserahkan ke Operational', 'Menunggu Operational'],
  },
  {
    key: 'operationalProgress',
    label: 'Operational Update Progress',
    shortLabel: 'Update Progress',
    owner: 'operational',
    ownerLabel: 'Operational',
    description: 'Update progress pekerjaan, RKBM, DSR, dan vessel complete.',
    statuses: ['Persiapan Dokumen', 'RKBM Terbit', 'Kegiatan Berjalan', 'Vessel Complete', 'Dokumen Operasional Belum Lengkap', 'Dokumen Operasional Lengkap', 'Siap Ditagihkan'],
  },
  {
    key: 'financeInvoice',
    label: 'Finance Upload Invoice/Faktur Pajak',
    shortLabel: 'Invoice & Faktur',
    owner: 'finance',
    ownerLabel: 'Finance',
    description: 'Upload invoice, faktur pajak, dan dokumen penagihan.',
    statuses: ['Belum Invoice', 'Draft Invoice', 'Invoice Terbit', 'Siap Dikirim', 'Debit Note Terbit'],
  },
  {
    key: 'salesSendDocuments',
    label: 'Sales Kirim Dokumen ke Customer',
    shortLabel: 'Kirim Dokumen',
    owner: 'sales',
    ownerLabel: 'Sales',
    description: 'Kirim invoice/faktur dan dokumen tagihan ke customer.',
    statuses: ['Dikirim', 'Diterima Customer', 'Menunggu Pembayaran'],
  },
  {
    key: 'financePayment',
    label: 'Finance Update Pelunasan',
    shortLabel: 'Update Pelunasan',
    owner: 'finance',
    ownerLabel: 'Finance',
    description: 'Update pembayaran, rekonsiliasi, dan status pelunasan.',
    statuses: ['Belum Dibayar', 'Dibayar Sebagian', 'Sebagian Lunas', 'Lunas', 'Selesai Administrasi', 'Diarsipkan', 'Selesai'],
  },
]

export const defaultWorkflowTimeline = workflowStages.map((stage) => ({
  key: stage.key,
  label: stage.label,
  shortLabel: stage.shortLabel,
  owner: stage.owner,
  ownerLabel: stage.ownerLabel,
  description: stage.description,
  status: stage.key === 'salesInputOrder' ? 'Selesai' : 'Menunggu',
  date: '-',
}))

export function inferWorkflowStage(job, operationalState) {
  const operationalStatus = operationalState?.status ?? job.operationalStatus
  const invoiceStatus = job.invoiceStatus
  const debitNoteStatus = job.debitNoteStatus

  if (['Selesai', 'Diarsipkan', 'Selesai Administrasi'].includes(operationalStatus) || ['Lunas', 'Dibayar Sebagian', 'Sebagian Lunas'].includes(invoiceStatus) || ['Lunas', 'Dibayar Sebagian'].includes(debitNoteStatus)) return 'financePayment'
  if (['Siap Dikirim', 'Dikirim', 'Diterima Customer', 'Menunggu Pembayaran', 'Terkirim'].includes(invoiceStatus) || ['Siap Dikirim', 'Dikirim', 'Diterima Customer', 'Menunggu Pembayaran'].includes(debitNoteStatus) || operationalStatus === 'Menunggu Pembayaran') return 'salesSendDocuments'
  if (['Siap Ditagihkan'].includes(operationalStatus) || ['Draft', 'Draft Invoice', 'Invoice Terbit'].includes(invoiceStatus) || ['Draft Debit Note', 'Debit Note Terbit'].includes(debitNoteStatus)) return 'financeInvoice'
  if (['Pekerjaan Baru', 'Operasional', 'Persiapan Dokumen', 'RKBM Terbit', 'Kegiatan Berjalan', 'Vessel Complete', 'Dokumen Belum Lengkap', 'Dokumen Operasional Belum Lengkap', 'Dokumen Operasional Lengkap'].includes(operationalStatus)) return 'operationalProgress'
  if (['Diserahkan ke Operational', 'Diajukan ke Operational', 'Menunggu Operational'].includes(operationalStatus)) return 'financeVerifyOrder'
  return 'salesInputOrder'
}

export function buildWorkflowTimeline(job, operationalState) {
  const activeKey = inferWorkflowStage(job, operationalState)
  const activeIndex = workflowStages.findIndex((stage) => stage.key === activeKey)
  return workflowStages.map((stage, index) => ({
    key: stage.key,
    label: stage.label,
    shortLabel: stage.shortLabel,
    owner: stage.owner,
    ownerLabel: stage.ownerLabel,
    description: stage.description,
    date: index === 0 ? job.startDate : index === 1 ? (operationalState?.vesselCompleteDate ?? job.vesselCompleteDate) : '-',
    status: index < activeIndex ? 'Selesai' : index === activeIndex ? 'Aktif' : 'Menunggu',
  }))
}

export function getWorkflowStage(key) {
  return workflowStages.find((stage) => stage.key === key)
}

export function getJobActionHints(role, job, operationalState) {
  const activeStage = inferWorkflowStage(job, operationalState)
  if (role === 'viewer') return []

  const actions = {
    sales: {
      salesInputOrder: ['Simpan Draft', 'Upload Dokumen', 'Ajukan Verifikasi Finance', 'Batalkan Job'],
      salesSendDocuments: ['Kirim Dokumen ke Customer', 'Catat Diterima Customer', 'Ajukan Revisi ke Finance'],
    },
    operational: {
      operationalProgress: ['Update Progress', 'Tambah Barge/RKBM', 'Tandai Vessel Complete', 'Submit ke Finance'],
    },
    finance: {
      financeVerifyOrder: ['Verifikasi Order', 'Setujui ke Operational', 'Minta Revisi Sales'],
      financeInvoice: ['Upload Invoice', 'Upload Faktur Pajak', 'Terbitkan Penagihan'],
      financePayment: ['Update Pelunasan', 'Rekonsiliasi', 'Tandai Lunas'],
    },
    admin: {
      salesInputOrder: ['Koreksi Draft', 'Ajukan Verifikasi Finance'],
      financeVerifyOrder: ['Verifikasi Order', 'Setujui ke Operational'],
      operationalProgress: ['Buka Koreksi Operational', 'Submit ke Finance'],
      financeInvoice: ['Upload Invoice', 'Upload Faktur Pajak'],
      salesSendDocuments: ['Pantau Pengiriman Customer'],
      financePayment: ['Update Pelunasan', 'Arsipkan Job'],
    },
  }

  return actions[role]?.[activeStage] ?? []
}
