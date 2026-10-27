import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '../ui/Button'
import { FormField, SelectInput, TextInput } from '../ui/FormField'
import { Modal } from '../ui/Modal'

const fieldClassName = 'h-9 text-xs'
const labelClassName = 'text-[11px] font-semibold text-slate-950'
const cancelButtonClassName = 'h-8 min-w-20 px-3 text-xs font-semibold'
const saveButtonClassName = 'h-8 min-w-24 bg-brand-600 px-3 text-xs font-semibold shadow-sm ring-1 ring-brand-700/20 hover:bg-brand-700'

export function MasterResourceModal({ open, item, resource, showValue, error, onClose, onSave }) {
  const [form, setForm] = useState(item ?? {})

  useEffect(() => {
    setForm(item ?? {})
  }, [item])

  if (!open || !item) return null

  return (
    <Modal
      open={open}
      eyebrow="Data Master"
      title={`${item.id ? 'Edit' : 'Tambah'} ${resource.label}`}
      description="Lengkapi data referensi yang diperlukan."
      onClose={onClose}
      maxWidth="max-w-3xl"
      panelClassName="rounded-md shadow-[0_18px_50px_rgba(15,23,42,0.28)]"
      bodyClassName="bg-[#f6f6f7] px-4 py-4"
      footer={<><Button variant="secondary" className={cancelButtonClassName} onClick={onClose}>Batal</Button><Button icon={Save} className={saveButtonClassName} onClick={() => onSave(form)}>Simpan</Button></>}
    >
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-brand-600" />
          <h3 className="text-sm font-semibold text-slate-950">Informasi {resource.label}</h3>
        </div>
        <div className="grid gap-x-4 gap-y-3 md:grid-cols-2">
          {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 md:col-span-2">{error}</p> : null}
          <FormField label="Kode" labelClassName={labelClassName}>
            <TextInput className={fieldClassName} value={form.kode ?? ''} onChange={(event) => setForm({ ...form, kode: event.target.value })} placeholder="Kode unik" autoFocus />
          </FormField>
          <FormField label={resource.valueLabel} labelClassName={labelClassName}>
            <TextInput className={fieldClassName} value={form.nama ?? ''} onChange={(event) => setForm({ ...form, nama: event.target.value })} placeholder={resource.valueLabel} />
          </FormField>
          {showValue ? (
            <FormField label="Nilai" labelClassName={labelClassName}>
              <TextInput className={fieldClassName} value={form.nilai ?? ''} onChange={(event) => setForm({ ...form, nilai: event.target.value })} placeholder="Nilai tarif atau PPN" />
            </FormField>
          ) : null}
          <FormField label="Status" labelClassName={labelClassName}>
            <SelectInput className={fieldClassName} value={form.status ?? 'Aktif'} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option>Aktif</option>
              <option>Nonaktif</option>
            </SelectInput>
          </FormField>
        </div>
      </section>
    </Modal>
  )
}
