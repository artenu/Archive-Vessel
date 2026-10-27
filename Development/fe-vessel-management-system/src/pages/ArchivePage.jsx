import { Download, Eye, FileImage, FilePlus2, FileText, Grid2X2, List, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DataTable } from '../components/data-display/DataTable'
import { EmptyState } from '../components/feedback/EmptyState'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { FormField, SelectInput } from '../components/ui/FormField'
import { Modal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { api } from '../services/mockApi'
import { addDocumentRevision, getArchiveDocuments, getArchiveFilters } from '../utils/archiveStorage'
import { statusTone } from '../utils/statusTone'

function formatBytes(size) {
  if (!size) return '0 KB'
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function applyFilters(documents, filters, search) {
  const query = search.trim().toLowerCase()
  return documents.filter((doc) => {
    const searchable = [
      doc.fileName,
      doc.documentNumber,
      doc.rkbmNo,
      doc.invoiceNo,
      doc.debitNoteNo,
      doc.customer,
      doc.vessel,
      doc.jobNumber,
    ].join(' ').toLowerCase()
    const year = String(new Date(doc.documentDate).getFullYear())
    return (
      (!query || searchable.includes(query)) &&
      (filters.category === 'Semua Kategori' || doc.category === filters.category) &&
      (filters.year === 'Semua Tahun' || year === filters.year) &&
      (filters.customer === 'Semua Customer' || doc.customer === filters.customer) &&
      (filters.vessel === 'Semua Vessel' || doc.vessel === filters.vessel) &&
      (filters.status === 'Semua Status' || doc.status === filters.status) &&
      (filters.uploaderRole === 'Semua Role' || doc.uploaderRole === filters.uploaderRole)
    )
  })
}

export function ArchivePage() {
  const { user } = useAuth()
  const { notify } = useToast()
  const [documents, setDocuments] = useState(() => getArchiveDocuments())
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [view, setView] = useState('table')
  const [search, setSearch] = useState('')
  const filtersSource = useMemo(() => getArchiveFilters(documents), [documents])
  const [filters, setFilters] = useState({
    category: 'Semua Kategori',
    year: 'Semua Tahun',
    customer: 'Semua Customer',
    vessel: 'Semua Vessel',
    status: 'Semua Status',
    uploaderRole: 'Semua Role',
  })

  const rows = useMemo(() => applyFilters(documents, filters, search), [documents, filters, search])
  const viewerPermission = useMemo(() => api.users.list().find((item) => item.id === user?.id)?.canDownloadDocuments, [user?.id])
  const viewerCanDownload = (doc) => user?.role !== 'viewer' || viewerPermission || doc.downloadAllowedForViewer

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function downloadDoc(doc) {
    if (!viewerCanDownload(doc)) {
      notify({ title: 'Download tidak diizinkan', description: 'Hak download Viewer belum diaktifkan untuk dokumen ini.', type: 'error' })
      return
    }
    notify({ title: 'Download placeholder', description: doc.fileName, type: 'info' })
  }

  function createRevision(doc) {
    const revision = addDocumentRevision(doc)
    setDocuments(getArchiveDocuments())
    setSelectedDoc(revision)
    notify({ title: 'Revisi dibuat', description: `Versi ${revision.version} ditambahkan tanpa menimpa dokumen lama.`, type: 'success' })
  }

  const columns = [
    { key: 'category', label: 'Kategori' },
    { key: 'fileName', label: 'Nama File', render: (doc) => <button className="font-semibold text-brand-700 hover:underline" type="button" onClick={() => setSelectedDoc(doc)}>{doc.fileName}</button> },
    { key: 'documentNumber', label: 'Nomor Dokumen' },
    { key: 'documentDate', label: 'Tanggal Dokumen', render: (doc) => formatDate(doc.documentDate) },
    { key: 'customer', label: 'Customer' },
    { key: 'vessel', label: 'Vessel' },
    { key: 'jobNumber', label: 'Job' },
    { key: 'rkbmNo', label: 'RKBM' },
    { key: 'invoiceNo', label: 'Invoice/DN', render: (doc) => doc.invoiceNo !== '-' ? doc.invoiceNo : doc.debitNoteNo },
    { key: 'version', label: 'Versi', render: (doc) => `v${doc.version}` },
    { key: 'size', label: 'Ukuran', render: (doc) => formatBytes(doc.size) },
    { key: 'uploadedBy', label: 'Pengunggah' },
    { key: 'uploadedAt', label: 'Upload', render: (doc) => formatDate(doc.uploadedAt) },
    { key: 'status', label: 'Status', render: (doc) => <Badge tone={statusTone(doc.status)}>{doc.status}</Badge> },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (doc) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" icon={Eye} aria-label={`Preview ${doc.fileName}`} onClick={() => setSelectedDoc(doc)} />
          <Button variant="ghost" size="icon-sm" icon={Download} aria-label={`Download ${doc.fileName}`} onClick={() => downloadDoc(doc)} disabled={!viewerCanDownload(doc)} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-700">Arsip</p>
          <h1 className="text-lg font-semibold text-slate-950">Arsip Dokumen Terpusat</h1>
          <p className="text-xs text-slate-500">Pencarian file dokumen awal, operasional, invoice, PNBP, debit note, dan pembayaran.</p>
        </div>
        <div className="flex gap-1">
          <Button variant="secondary" size="icon" icon={List} aria-label="Tampilan tabel" onClick={() => setView('table')} />
          <Button variant="secondary" size="icon" icon={Grid2X2} aria-label="Tampilan grid" onClick={() => setView('grid')} />
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <ArchiveStat label="Total Arsip" value={documents.length} />
        <ArchiveStat label="Dokumen Terbaru" value={documents.filter((doc) => doc.status === 'Dokumen Terbaru').length} tone="success" />
        <ArchiveStat label="Revisi" value={documents.filter((doc) => doc.status === 'Revisi').length} tone="warning" />
        <ArchiveStat label="Tidak Berlaku" value={documents.filter((doc) => doc.status === 'Tidak Berlaku').length} tone="danger" />
      </div>

      <Card>
        <CardContent className="space-y-2">
          <FormField label="Pencarian Global">
            <div className="flex h-7 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full text-xs outline-none placeholder:text-slate-400" placeholder="Cari file, RKBM, invoice, debit note, customer, vessel, nomor job..." />
            </div>
          </FormField>
          <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
            <FilterSelect label="Kategori" value={filters.category} options={filtersSource.categories} onChange={(value) => updateFilter('category', value)} />
            <FilterSelect label="Tahun" value={filters.year} options={filtersSource.years} onChange={(value) => updateFilter('year', value)} />
            <FilterSelect label="Customer" value={filters.customer} options={filtersSource.customers} onChange={(value) => updateFilter('customer', value)} />
            <FilterSelect label="Vessel" value={filters.vessel} options={filtersSource.vessels} onChange={(value) => updateFilter('vessel', value)} />
            <FilterSelect label="Kelengkapan" value={filters.status} options={filtersSource.statuses} onChange={(value) => updateFilter('status', value)} />
            <FilterSelect label="Role Pengunggah" value={filters.uploaderRole} options={filtersSource.uploaderRoles} onChange={(value) => updateFilter('uploaderRole', value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Daftar Arsip" description={`${rows.length} dokumen sesuai filter.`} />
        <CardContent>
          {rows.length ? (
            view === 'table' ? (
              <DataTable columns={columns} rows={rows} showActions={false} />
            ) : (
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {rows.map((doc) => <ArchiveCard key={doc.id} doc={doc} canDownload={viewerCanDownload(doc)} onPreview={setSelectedDoc} onDownload={downloadDoc} />)}
              </div>
            )
          ) : <EmptyState title="Dokumen tidak ditemukan" description="Ubah kata kunci atau filter untuk melihat arsip lain." />}
        </CardContent>
      </Card>

      <PreviewModal
        document={selectedDoc}
        open={Boolean(selectedDoc)}
        canDownload={selectedDoc ? viewerCanDownload(selectedDoc) : false}
        onClose={() => setSelectedDoc(null)}
        onDownload={downloadDoc}
        onRevision={createRevision}
        canRevise={user?.role !== 'viewer'}
      />
    </div>
  )
}

function ArchiveStat({ label, value, tone = 'brand' }) {
  return (
    <Card>
      <CardContent className="flex min-h-12 items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-medium uppercase text-slate-500">{label}</p>
          <p className="mt-1 text-lg font-semibold leading-none text-slate-950">{value}</p>
        </div>
        <Badge tone={tone}>Arsip</Badge>
      </CardContent>
    </Card>
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

function ArchiveCard({ doc, canDownload, onPreview, onDownload }) {
  const Icon = doc.type === 'image' ? FileImage : FileText
  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="grid h-7 w-8 place-items-center rounded-md bg-slate-50 text-slate-600 ring-1 ring-slate-200">
            <Icon className="h-4 w-4" />
          </div>
          <Badge tone={statusTone(doc.status)}>{doc.status}</Badge>
        </div>
        <div>
          <h3 className="line-clamp-2 text-xs font-semibold text-slate-950">{doc.fileName}</h3>
          <p className="mt-0.5 text-[11px] text-slate-500">{doc.category} - v{doc.version} - {formatBytes(doc.size)}</p>
        </div>
        <div className="grid gap-1.5 text-[11px]">
          <Meta label="Job" value={doc.jobNumber} />
          <Meta label="Customer" value={doc.customer} />
          <Meta label="Vessel" value={doc.vessel} />
          <Meta label="Upload" value={`${doc.uploadedBy}, ${formatDate(doc.uploadedAt)}`} />
        </div>
        <div className="flex justify-end gap-1.5">
          <Button variant="secondary" size="icon-sm" icon={Eye} aria-label={`Preview ${doc.fileName}`} onClick={() => onPreview(doc)} />
          <Button variant="secondary" size="icon-sm" icon={Download} aria-label={`Download ${doc.fileName}`} disabled={!canDownload} onClick={() => onDownload(doc)} />
        </div>
      </CardContent>
    </Card>
  )
}

function PreviewModal({ document, open, onClose, canDownload, onDownload, onRevision, canRevise }) {
  if (!document) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="max-w-6xl"
      title="Preview Dokumen"
      description={document.fileName}
      footer={
        <>
          {canRevise ? <Button variant="secondary" icon={FilePlus2} onClick={() => onRevision(document)}>Tambah Revisi</Button> : null}
          <Button variant="secondary" icon={Download} disabled={!canDownload} onClick={() => onDownload(document)}>Download</Button>
          <Button onClick={onClose}>Tutup</Button>
        </>
      }
    >
      <div className="grid max-h-[72vh] gap-3 overflow-y-auto pr-1 xl:grid-cols-[1fr_340px]">
        <DocumentPreview document={document} />
        <div className="space-y-3">
          <Card className="shadow-none">
            <CardHeader title="Metadata" description="Detail metadata arsip dokumen." />
            <CardContent className="grid gap-2 text-sm">
              <Meta label="Kategori" value={document.category} />
              <Meta label="Nomor Dokumen" value={document.documentNumber} />
              <Meta label="Tanggal Dokumen" value={formatDate(document.documentDate)} />
              <Meta label="Customer" value={document.customer} />
              <Meta label="Vessel" value={document.vessel} />
              <Meta label="Job" value={document.jobNumber} />
              <Meta label="RKBM" value={document.rkbmNo} />
              <Meta label="Invoice" value={document.invoiceNo} />
              <Meta label="Debit Note" value={document.debitNoteNo} />
              <Meta label="Versi" value={`v${document.version}`} />
              <Meta label="Ukuran" value={formatBytes(document.size)} />
              <Meta label="Pengunggah" value={`${document.uploadedBy} (${document.uploaderRole})`} />
              <Meta label="Tanggal Upload" value={formatDate(document.uploadedAt)} />
              <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
                <span className="text-xs font-semibold uppercase text-slate-400">Status</span>
                <Badge tone={statusTone(document.status)}>{document.status}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader title="Riwayat Versi" description="Revisi tidak menimpa dokumen lama." />
            <CardContent className="space-y-2">
              {document.versions.map((version) => (
                <div key={`${document.id}-${version.version}-${version.fileName}`} className="rounded-md border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">Versi {version.version}</p>
                    <Badge tone={statusTone(version.status)}>{version.status}</Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">{version.fileName}</p>
                  <p className="mt-1 text-xs text-slate-500">{version.uploadedBy} - {formatDate(version.uploadedAt)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Modal>
  )
}

function DocumentPreview({ document }) {
  if (document.type === 'image') {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-lg border border-slate-200 bg-slate-100 p-3">
        <div className="aspect-[4/3] w-full max-w-xl rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
          <div className="h-full rounded-md border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-3">
            <div className="grid h-full place-items-center text-center">
              <div>
                <FileImage className="mx-auto h-14 w-14 text-brand-700" />
                <p className="mt-4 text-lg font-semibold text-slate-950">Preview Gambar Dummy</p>
                <p className="mt-2 text-sm text-slate-500">{document.fileName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[300px] rounded-lg border border-slate-200 bg-slate-100 p-3">
      <div className="mx-auto min-h-[280px] max-w-lg rounded-md bg-white p-3 shadow-sm">
        <div className="border-b border-slate-200 pb-4">
          <p className="text-xs font-semibold uppercase text-brand-700">Dummy PDF Preview</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">{document.category}</h3>
          <p className="mt-1 text-sm text-slate-500">{document.fileName}</p>
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-3 w-4/5 rounded bg-slate-200" />
          <div className="h-3 w-full rounded bg-slate-200" />
          <div className="h-3 w-3/4 rounded bg-slate-200" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-20 rounded border border-slate-200 bg-slate-50" />
            <div className="h-20 rounded border border-slate-200 bg-slate-50" />
          </div>
          <div className="mt-4 h-32 rounded border border-slate-200 bg-slate-50" />
        </div>
      </div>
    </div>
  )
}

function Meta({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
      <span className="text-xs font-semibold uppercase text-slate-400">{label}</span>
      <span className="max-w-[220px] text-right text-xs font-semibold text-slate-700">{value || '-'}</span>
    </div>
  )
}
