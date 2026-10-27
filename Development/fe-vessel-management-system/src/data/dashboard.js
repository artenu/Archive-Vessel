export const filterOptions = {
  periods: ['Bulan Ini', '3 Bulan', '6 Bulan', 'Tahun Berjalan'],
  customers: ['Semua Customer', 'PT Nusantara Mineral Logistik', 'PT Borneo Energy Terminal', 'PT Armada Prima Coal', 'PT Lautan Bara Mandiri'],
  vessels: ['Semua Vessel', 'MV Armada Samudera', 'TB Laut Jaya 08', 'BG Nusantara 12', 'MV Segara Abadi', 'MV Meratus Linea'],
  statuses: ['Semua Status', 'Draft Sales', 'Menunggu Operational', 'Kegiatan Berjalan', 'Vessel Complete', 'Siap Ditagihkan', 'Menunggu Pembayaran', 'Diarsipkan'],
}

export const jobs = [
  {
    id: 'RKBM-2026-0718',
    tanggal: '30 Jul 2026',
    customer: 'PT Nusantara Mineral Logistik',
    vessel: 'MV Armada Samudera',
    kapal: 'MV Armada Samudera',
    barge: 'BG Armada 301',
    dermaga: 'Jetty 3',
    komoditas: 'Coal',
    volume: '42.500 MT',
    status: 'Kegiatan Berjalan',
    nilai: 'Rp 742.000.000',
    invoiceStatus: 'Belum Invoice',
    documentHealth: 'Kurang 2',
  },
  {
    id: 'RKBM-2026-0717',
    tanggal: '29 Jul 2026',
    customer: 'PT Borneo Energy Terminal',
    vessel: 'TB Laut Jaya 08',
    kapal: 'TB Laut Jaya 08',
    barge: 'BG Borneo 17',
    dermaga: 'Area Muat B',
    komoditas: 'Nickel Ore',
    volume: '18.250 MT',
    status: 'Siap Ditagihkan',
    nilai: 'Rp 516.500.000',
    invoiceStatus: 'Draft Invoice',
    documentHealth: 'Lengkap',
  },
  {
    id: 'RKBM-2026-0716',
    tanggal: '28 Jul 2026',
    customer: 'PT Armada Prima Coal',
    vessel: 'BG Nusantara 12',
    kapal: 'BG Nusantara 12',
    barge: 'BG Nusantara 12',
    dermaga: 'Anchorage',
    komoditas: 'Coal',
    volume: '31.100 MT',
    status: 'Menunggu Dokumen',
    nilai: 'Rp 328.750.000',
    invoiceStatus: 'Tertahan',
    documentHealth: 'Kurang 4',
  },
  {
    id: 'RKBM-2026-0715',
    tanggal: '27 Jul 2026',
    customer: 'PT Lautan Bara Mandiri',
    vessel: 'MV Segara Abadi',
    kapal: 'MV Segara Abadi',
    barge: 'BG Mandiri 09',
    dermaga: 'Jetty 1',
    komoditas: 'Coal',
    volume: '55.300 MT',
    status: 'Vessel Complete',
    nilai: 'Rp 889.200.000',
    invoiceStatus: 'Diterima Customer',
    documentHealth: 'Kurang 1',
  },
  {
    id: 'RKBM-2026-0714',
    tanggal: '26 Jul 2026',
    customer: 'PT Nusantara Mineral Logistik',
    vessel: 'MV Meratus Linea',
    kapal: 'MV Meratus Linea',
    barge: 'BG Armada 210',
    dermaga: 'Jetty 4',
    komoditas: 'Bauxite',
    volume: '24.600 MT',
    status: 'Selesai',
    nilai: 'Rp 471.000.000',
    invoiceStatus: 'Lunas',
    documentHealth: 'Lengkap',
  },
]

export const monthlyTrend = [
  { month: 'Feb', pekerjaan: 31, invoice: 4.2, reimbursement: 0.8 },
  { month: 'Mar', pekerjaan: 36, invoice: 5.1, reimbursement: 1.0 },
  { month: 'Apr', pekerjaan: 42, invoice: 5.8, reimbursement: 1.2 },
  { month: 'Mei', pekerjaan: 39, invoice: 5.5, reimbursement: 1.1 },
  { month: 'Jun', pekerjaan: 47, invoice: 6.4, reimbursement: 1.4 },
  { month: 'Jul', pekerjaan: 53, invoice: 7.2, reimbursement: 1.7 },
]

export const customerWork = [
  { customer: 'Nusantara Mineral', pekerjaan: 68 },
  { customer: 'Borneo Energy', pekerjaan: 54 },
  { customer: 'Armada Prima', pekerjaan: 43 },
  { customer: 'Lautan Bara', pekerjaan: 39 },
  { customer: 'Samudera Bulk', pekerjaan: 28 },
]

export const statusComposition = [
  { name: 'Draft Sales', value: 31, fill: '#991b1b' },
  { name: 'Kegiatan Berjalan', value: 47, fill: '#0284c7' },
  { name: 'Vessel Complete', value: 26, fill: '#059669' },
  { name: 'Siap Ditagihkan', value: 19, fill: '#d97706' },
  { name: 'Menunggu Pembayaran', value: 15, fill: '#dc2626' },
]

export const outstandingRows = [
  { id: 'INV-2026-0644', customer: 'PT Borneo Energy Terminal', jatuhTempo: '02 Agu 2026', umur: '28 hari', status: 'Menunggu Pembayaran', nilai: 'Rp 1.240.000.000' },
  { id: 'DN-2026-0188', customer: 'PT Armada Prima Coal', jatuhTempo: '05 Agu 2026', umur: '24 hari', status: 'Menunggu Pembayaran', nilai: 'Rp 184.500.000' },
  { id: 'INV-2026-0631', customer: 'PT Lautan Bara Mandiri', jatuhTempo: '09 Agu 2026', umur: '19 hari', status: 'Overdue', nilai: 'Rp 732.250.000' },
  { id: 'INV-2026-0629', customer: 'PT Nusantara Mineral Logistik', jatuhTempo: '12 Agu 2026', umur: '16 hari', status: 'Menunggu Pembayaran', nilai: 'Rp 515.000.000' },
]

export const incompleteDocuments = [
  { id: 'RKBM-2026-0718', dokumen: 'Final DSR', customer: 'PT Nusantara Mineral Logistik', owner: 'Operational', status: 'Tertunda' },
  { id: 'RKBM-2026-0716', dokumen: 'Barge Nomination', customer: 'PT Armada Prima Coal', owner: 'Operational', status: 'Menunggu Dokumen' },
  { id: 'RKBM-2026-0715', dokumen: 'BA Vessel Complete', customer: 'PT Lautan Bara Mandiri', owner: 'Operational', status: 'Menunggu Dokumen' },
  { id: 'RKBM-2026-0713', dokumen: 'PO Customer', customer: 'PT Borneo Energy Terminal', owner: 'Sales Support', status: 'Menunggu Dokumen' },
]

export const activityLogs = [
  { title: 'Invoice INV-2026-0644 diperbarui', meta: 'Finance - 22 menit lalu' },
  { title: 'Final DSR RKBM-2026-0718 belum lengkap', meta: 'Operational - 1 jam lalu' },
  { title: 'Dokumen awal customer baru diunggah', meta: 'Sales Support - 2 jam lalu' },
  { title: 'Pembayaran Rp 480.000.000 direkonsiliasi', meta: 'Finance - 4 jam lalu' },
]

export const followUps = [
  { id: 'FU-0718', customer: 'PT Borneo Energy Terminal', agenda: 'Kirim draft invoice', due: 'Hari ini', status: 'Diproses' },
  { id: 'FU-0716', customer: 'PT Armada Prima Coal', agenda: 'Minta PO final', due: 'Besok', status: 'Menunggu Dokumen' },
  { id: 'FU-0712', customer: 'PT Lautan Bara Mandiri', agenda: 'Konfirmasi BA complete', due: '01 Agu 2026', status: 'Kegiatan Berjalan' },
]

export const agingReceivables = [
  { bucket: '0-30', nilai: 2.8 },
  { bucket: '31-60', nilai: 1.9 },
  { bucket: '61-90', nilai: 1.1 },
  { bucket: '>90', nilai: 0.6 },
]

export const dashboardByRole = {
  admin: {
    title: 'Dashboard Admin',
    subtitle: 'Kontrol menyeluruh pekerjaan PBM/RKBM, dokumen, tagihan, reimbursement, dan aktivitas sistem.',
    stats: [
      { label: 'Total Pekerjaan', value: '248', delta: '+18 bulan ini', tone: 'brand' },
      { label: 'Pekerjaan Berjalan', value: '47', delta: '19% aktif', tone: 'info' },
      { label: 'Vessel Complete', value: '126', delta: '51% tahun ini', tone: 'success' },
      { label: 'Dokumen Belum Lengkap', value: '34', delta: 'Butuh follow-up', tone: 'warning' },
      { label: 'Total Invoice', value: 'Rp 42,8 M', delta: '+Rp 7,2 M', tone: 'brand' },
      { label: 'Total Reimbursement', value: 'Rp 8,6 M', delta: '+Rp 1,7 M', tone: 'success' },
      { label: 'Outstanding Invoice', value: 'Rp 6,4 M', delta: '19 invoice', tone: 'danger' },
      { label: 'Outstanding Debit Note', value: 'Rp 920 Jt', delta: '7 debit note', tone: 'warning' },
    ],
  },
  sales: {
    title: 'Dashboard Sales',
    subtitle: 'Pantau pekerjaan baru, kelengkapan dokumen awal, performa customer, dan follow-up komersial.',
    stats: [
      { label: 'Draft Sales', value: '31', delta: '+9 minggu ini', tone: 'brand' },
      { label: 'Dokumen Awal Belum Lengkap', value: '12', delta: '4 customer', tone: 'warning' },
      { label: 'Pekerjaan Per Customer', value: '68', delta: 'Top customer', tone: 'info' },
      { label: 'Penagihan Siap Dikirim', value: '15', delta: 'Rp 3,1 M', tone: 'danger' },
      { label: 'Follow-up Customer', value: '21', delta: '8 jatuh tempo', tone: 'warning' },
    ],
  },
  operational: {
    title: 'Dashboard Operational',
    subtitle: 'Monitor pekerjaan lapangan, penerbitan RKBM, DSR final, vessel complete, dan dokumen operasional.',
    stats: [
      { label: 'Pekerjaan Berjalan', value: '47', delta: '12 jetty aktif', tone: 'info' },
      { label: 'RKBM Belum Terbit', value: '9', delta: 'Prioritas hari ini', tone: 'warning' },
      { label: 'Final DSR Belum Diinput', value: '14', delta: '5 lewat SLA', tone: 'danger' },
      { label: 'Belum Vessel Complete', value: '22', delta: 'Dalam proses', tone: 'brand' },
      { label: 'Dokumen Operasional Lengkap', value: '88%', delta: '+6%', tone: 'success' },
    ],
  },
  finance: {
    title: 'Dashboard Finance',
    subtitle: 'Pantau job siap ditagihkan, invoice, debit note, PNBP, pembayaran, dan aging piutang.',
    stats: [
      { label: 'Job Siap Ditagihkan', value: '19', delta: 'Rp 5,8 M', tone: 'brand' },
      { label: 'Invoice Draft', value: '11', delta: 'Menunggu review', tone: 'warning' },
      { label: 'Invoice Jatuh Tempo', value: '23', delta: '7 hari ke depan', tone: 'danger' },
      { label: 'Debit Note Belum Dibayar', value: '7', delta: 'Rp 920 Jt', tone: 'warning' },
      { label: 'Total PNBP', value: 'Rp 2,4 M', delta: 'Bulan ini', tone: 'info' },
      { label: 'Total Pembayaran', value: 'Rp 11,9 M', delta: '+Rp 2,1 M', tone: 'success' },
      { label: 'Aging Piutang', value: 'Rp 6,4 M', delta: '64% < 60 hari', tone: 'danger' },
    ],
  },
  viewer: {
    title: 'Dashboard Viewer',
    subtitle: 'Ringkasan umum pekerjaan PBM/RKBM, dokumen, status pekerjaan, dan outstanding tanpa tombol aksi.',
    stats: [
      { label: 'Total Pekerjaan', value: '248', delta: 'Tahun berjalan', tone: 'brand' },
      { label: 'Pekerjaan Berjalan', value: '47', delta: 'Aktif', tone: 'info' },
      { label: 'Vessel Complete', value: '126', delta: 'Tercatat', tone: 'success' },
      { label: 'Dokumen Belum Lengkap', value: '34', delta: 'Monitoring', tone: 'warning' },
      { label: 'Outstanding', value: 'Rp 6,4 M', delta: 'Ringkasan', tone: 'danger' },
    ],
  },
}
