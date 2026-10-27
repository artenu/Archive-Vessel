export function statusTone(status) {
  if (['SELESAI', 'Selesai', 'LUNAS', 'Lunas', 'Lengkap', 'Terbit', 'Vessel Complete', 'Terekonsiliasi', 'Final DSR Dikonfirmasi', 'Final DSR Lengkap', 'Diterima Customer', 'Dokumen Operasional Lengkap', 'Ternominasi', 'Selesai Administrasi', 'Diarsipkan'].includes(status)) return 'success'
  if (['BELUM DITAGIH', 'Menunggu', 'Menunggu Dokumen', 'Menunggu Sandar', 'Menunggu Bongkar', 'Menunggu RKBM', 'Menunggu Final DSR', 'Outstanding', 'Tertunda', 'Review', 'Draft', 'DRAFT', 'Draft Sales', 'Draft Invoice', 'Draft Debit Note', 'Draft Operasional', 'Persiapan Dokumen', 'Sebagian Lunas', 'Dibayar Sebagian', 'Belum Invoice', 'Belum Dibayar', 'Belum Dibuat', 'Belum Nominasi', 'Menunggu Rekonsiliasi', 'Dokumen Belum Lengkap', 'Dokumen Awal Belum Lengkap', 'Dokumen Operasional Belum Lengkap', 'Menunggu Pembayaran', 'Revisi Diminta'].includes(status)) return 'warning'
  if (['Ditolak', 'Overdue', 'Batalkan Job'].includes(status)) return 'danger'
  if (['Operasional', 'OPERATIONAL', 'FINANCE', 'SUDAH DITAGIH', 'Diproses', 'Daily DSR', 'Final DSR Review', 'Kegiatan Berjalan', 'Bongkar Berjalan', 'Vessel Tiba', 'Dikirim'].includes(status)) return 'info'
  if (['Aktif', 'Siap Ditagihkan', 'Siap Dikirim', 'Pekerjaan Baru', 'Job Baru', 'Menunggu Operational', 'Diserahkan ke Operational', 'Diajukan ke Operational', 'Dokumen Awal Lengkap', 'RKBM Terbit', 'Invoice Terbit', 'Debit Note Terbit'].includes(status)) return 'brand'
  return 'neutral'
}
