import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '../ui/Button'
import { FormField, SelectInput, TextInput } from '../ui/FormField'
import { Modal } from '../ui/Modal'

const fieldClassName = 'h-9 text-xs'
const labelClassName = 'text-[11px] font-semibold text-slate-950'
const cancelButtonClassName = 'h-8 min-w-20 px-3 text-xs font-semibold'
const saveButtonClassName = 'h-8 min-w-24 bg-brand-600 px-3 text-xs font-semibold shadow-sm ring-1 ring-brand-700/20 hover:bg-brand-700'

export function ConfiguredMasterModal({ open, item, title, fields, error, data, onClose, onSave }) {
  const [form, setForm] = useState(item ?? {})

  useEffect(() => {
    setForm(item ?? {})
  }, [item])

  if (!open || !item) return null

  return (
    <Modal
      open={open}
      eyebrow="Data Master"
      title={`${item.id ? 'Edit' : 'Tambah'} ${title}`}
      description="Lengkapi data referensi yang diperlukan."
      onClose={onClose}
      maxWidth="max-w-4xl"
      panelClassName="rounded-md shadow-[0_18px_50px_rgba(15,23,42,0.28)]"
      bodyClassName="bg-[#f6f6f7] px-4 py-4"
      footer={<><Button variant="secondary" className={cancelButtonClassName} onClick={onClose}>Batal</Button><Button icon={Save} className={saveButtonClassName} onClick={() => onSave(form)}>Simpan</Button></>}
    >
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-brand-600" />
          <h3 className="text-sm font-semibold text-slate-950">Informasi {title}</h3>
        </div>
        <div className="grid gap-x-4 gap-y-3 md:grid-cols-2">
          {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 md:col-span-2">{error}</p> : null}
          {fields.map((field) => (
            <FormField key={field.key} label={field.label} labelClassName={labelClassName} className={field.fullWidth ? 'md:col-span-2' : undefined}>
              {field.type === 'select' ? (
                <SelectInput
                  className={fieldClassName}
                  value={form[field.key] ?? field.defaultValue ?? ''}
                  onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                >
                  {(typeof field.options === 'function' ? field.options(data) : field.options).map((option) => (
                    <option key={option.value ?? option} value={option.value ?? option}>{option.label ?? option}</option>
                  ))}
                </SelectInput>
              ) : (
                <TextInput
                  className={fieldClassName}
                  value={form[field.key] ?? ''}
                  onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                  placeholder={field.placeholder}
                  autoFocus={field.autoFocus}
                />
              )}
            </FormField>
          ))}
        </div>
      </section>
    </Modal>
  )
}
