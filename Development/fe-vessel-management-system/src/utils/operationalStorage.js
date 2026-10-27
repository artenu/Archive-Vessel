const OPERATIONAL_STATE_KEY = 'rkbm_operational_state'

export const operationalStatuses = [
  'Draft Operasional',
  'Menunggu Operational',
  'Persiapan Dokumen',
  'RKBM Terbit',
  'Kegiatan Berjalan',
  'Vessel Complete',
  'Dokumen Operasional Belum Lengkap',
  'Dokumen Operasional Lengkap',
  'Siap Ditagihkan',
  'Selesai Administrasi',
  'Diarsipkan',
]

export const uploadCategories = [
  'Barge Nomination',
  'RKBM Muat',
  'RKBM Bongkar',
  'DSR Awal',
  'Final DSR',
  'Laporan Kegiatan',
  'Berita Acara',
]

export const checklistItems = [
  'Barge Nomination lengkap',
  'RKBM Muat/Bongkar terbit',
  'DSR Awal terisi',
  'Final DSR dikonfirmasi',
  'Laporan kegiatan diunggah',
  'Berita acara diunggah',
]

export function getAllOperationalState() {
  try {
    return JSON.parse(window.localStorage.getItem(OPERATIONAL_STATE_KEY)) ?? {}
  } catch {
    return {}
  }
}

export function getOperationalState(job) {
  const stored = getAllOperationalState()[job.id]
  const fallback = createDefaultOperationalState(job)
  return {
    ...fallback,
    ...stored,
    barges: stored?.barges?.length ? stored.barges : fallback.barges,
    checklist: { ...fallback.checklist, ...stored?.checklist },
  }
}

export function saveOperationalState(jobId, state) {
  const allState = getAllOperationalState()
  window.localStorage.setItem(OPERATIONAL_STATE_KEY, JSON.stringify({ ...allState, [jobId]: state }))
}

export function calculateDsrDifference(finalDsr, dsrStart) {
  const finalValue = Number(finalDsr || 0)
  const startValue = Number(dsrStart || 0)
  return finalValue - startValue
}

export function dsrIndicator(diff) {
  if (diff > 0) return { label: 'Positif', tone: 'success' }
  if (diff < 0) return { label: 'Negatif', tone: 'danger' }
  return { label: 'Sesuai', tone: 'brand' }
}

export function createEmptyBarge() {
  return {
    id: crypto.randomUUID(),
    tugBoat: '',
    barge: '',
    nominationDate: '',
    nominatedTonnage: '',
    rkbmNo: '',
    rkbmIssueDate: '',
    rkbmType: 'Muat',
    documentStatus: 'Draft Operasional',
    dsrStart: '',
    finalDsr: '',
    startDate: '',
    finishDate: '',
    issueNotes: '',
    isFinalLocked: false,
    revisionRequested: false,
    uploads: createEmptyUploads(),
  }
}

function createDefaultOperationalState(job) {
  const status = mapOperationalStatus(job.operationalStatus)
  return {
    status,
    vesselCompleteDate: status === 'Vessel Complete' ? job.vesselCompleteDate : '-',
    submittedToFinance: status === 'Siap Ditagihkan',
    checklist: Object.fromEntries(checklistItems.map((item) => [item, job.documentCompleteness >= 90])),
    barges: job.barges.map((barge, index) => ({
      ...createEmptyBarge(),
      id: barge.id,
      tugBoat: barge.tugBoat,
      barge: barge.barge,
      nominationDate: index === 0 ? '2026-07-09' : index === 1 ? '2026-07-09' : '2026-07-10',
      nominatedTonnage: parseTonnage(barge.cargoVolume),
      rkbmNo: barge.rkbmNo,
      rkbmIssueDate: index === 2 ? '2026-07-11' : '2026-07-10',
      rkbmType: index === 1 ? 'Bongkar' : 'Muat',
      documentStatus: barge.status === 'Vessel Complete' ? 'Final DSR Dikonfirmasi' : 'Kegiatan Berjalan',
      dsrStart: parseTonnage(barge.cargoVolume) - (index === 2 ? 180 : 0),
      finalDsr: barge.status === 'Vessel Complete' ? parseTonnage(barge.cargoVolume) : '',
      startDate: '2026-07-12',
      finishDate: barge.status === 'Vessel Complete' ? '2026-07-22' : '',
      issueNotes: index === 2 ? 'Final DSR masih menunggu konfirmasi surveyor.' : '',
      isFinalLocked: barge.status === 'Vessel Complete',
      uploads: createMockUploads(barge.status === 'Vessel Complete'),
    })),
  }
}

function mapOperationalStatus(status) {
  if (status === 'Diajukan ke Operational' || status === 'Menunggu Operational' || status === 'Diserahkan ke Operational') return 'Menunggu Operational'
  if (status === 'Operasional') return 'Kegiatan Berjalan'
  if (status === 'Vessel Complete') return 'Vessel Complete'
  if (status === 'Dokumen Operasional Belum Lengkap' || status === 'Dokumen Belum Lengkap') return 'Dokumen Operasional Belum Lengkap'
  if (status === 'Dokumen Operasional Lengkap') return 'Dokumen Operasional Lengkap'
  if (status === 'Siap Ditagihkan') return 'Siap Ditagihkan'
  if (status === 'Selesai Administrasi' || status === 'Selesai') return 'Selesai Administrasi'
  if (status === 'Diarsipkan') return 'Diarsipkan'
  return 'Persiapan Dokumen'
}

function parseTonnage(value) {
  return Number(String(value ?? '').replace(/[^\d]/g, '')) || 0
}

function createEmptyUploads() {
  return Object.fromEntries(uploadCategories.map((category) => [category, []]))
}

function createMockUploads(complete) {
  const uploads = createEmptyUploads()
  if (!complete) return uploads
  uploadCategories.forEach((category) => {
    uploads[category] = [{
      id: `${category}-mock`,
      name: `${category}.pdf`,
      size: 840000,
      type: 'application/pdf',
    }]
  })
  return uploads
}
