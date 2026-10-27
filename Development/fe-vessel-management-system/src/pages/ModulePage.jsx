import { Filter, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { DataTable } from '../components/data-display/DataTable'
import { EmptyState } from '../components/feedback/EmptyState'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { FormField, SelectInput, TextInput } from '../components/ui/FormField'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { jobs } from '../data/dashboard'
import { useAuth } from '../hooks/useAuth'
import { useConfirm } from '../hooks/useConfirm'
import { useToast } from '../hooks/useToast'

const columns = [
  { key: 'id', label: 'Referensi' },
  { key: 'customer', label: 'Customer' },
  { key: 'kapal', label: 'Kapal/Tongkang' },
  { key: 'dermaga', label: 'Lokasi' },
  { key: 'status', label: 'Status' },
]

export function ModulePage({ title, description, category = 'Operasional' }) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { confirm } = useConfirm()
  const { notify } = useToast()
  const readOnly = user?.role === 'viewer'

  function simulateSave() {
    setOpen(false)
    notify({ title: 'Data simulasi tersimpan', description: `${title} siap dikembangkan pada fase berikutnya.`, type: 'success' })
  }

  function simulateDelete(row) {
    confirm({
      title: 'Hapus data simulasi?',
      description: `${row.id} akan dihapus dari tampilan mock.`,
      onConfirm: () => notify({ title: 'Data simulasi dihapus', description: row.id, type: 'info' }),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-brand-700">{category}</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-950">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">{description}</p>
        </div>
        {!readOnly ? <Button icon={Plus} onClick={() => setOpen(true)}>Tambah</Button> : null}
      </div>

      <Card>
        <CardHeader
          title={`Daftar ${title}`}
          description="Placeholder frontend dengan mock data lokal."
          action={
            <div className="flex gap-2">
              <Button variant="secondary" icon={Filter}>Filter</Button>
              {!readOnly ? <Button variant="secondary" size="icon-sm" icon={Trash2} aria-label="Hapus data simulasi" onClick={() => simulateDelete(jobs[0])} /> : null}
            </div>
          }
        />
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            <FormField label="Pencarian">
              <div className="flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input className="w-full text-xs outline-none placeholder:text-slate-400" placeholder={`Cari data ${title.toLowerCase()}...`} />
              </div>
            </FormField>
            <FormField label="Status">
              <SelectInput defaultValue="semua">
                <option value="semua">Semua Status</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
              </SelectInput>
            </FormField>
          </div>

          {jobs.length ? <DataTable columns={columns} rows={jobs} showActions={!readOnly} onAction={simulateDelete} /> : <EmptyState />}
        </CardContent>
        <Pagination page={1} totalPages={1} totalItems={jobs.length} pageSize={10} />
      </Card>

      <Modal
        open={open}
        title={`Tambah ${title}`}
        description="Form ini masih simulasi frontend dan belum terhubung backend."
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={simulateSave}>Simpan</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <FormField label="Nomor Referensi">
            <TextInput placeholder="Contoh: RKBM-2026-0801" />
          </FormField>
          <FormField label="Customer">
            <TextInput placeholder="Nama customer" />
          </FormField>
          <FormField label="Status">
            <SelectInput defaultValue="diproses">
              <option value="diproses">Diproses</option>
              <option value="menunggu">Menunggu Dokumen</option>
              <option value="selesai">Selesai</option>
            </SelectInput>
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
