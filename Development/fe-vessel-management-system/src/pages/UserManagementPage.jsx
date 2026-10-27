import { Edit3, Plus, Search, UserMinus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DataTable } from '../components/data-display/DataTable'
import { EmptyState } from '../components/feedback/EmptyState'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { FormField, SelectInput, TextInput } from '../components/ui/FormField'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { roles } from '../data/mockUsers'
import { useConfirm } from '../hooks/useConfirm'
import { useToast } from '../hooks/useToast'
import { api } from '../services/mockApi'
import { statusTone } from '../utils/statusTone'

const pageSize = 8

export function UserManagementPage() {
  const { notify } = useToast()
  const { confirm } = useConfirm()
  const [users, setUsers] = useState(() => api.users.list())
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return users.filter((user) => [user.name, user.username, user.email, roles[user.role], user.status].join(' ').toLowerCase().includes(query))
  }, [search, users])
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const pagedRows = rows.slice((page - 1) * pageSize, page * pageSize)

  function saveUser(user) {
    if (!String(user.name ?? '').trim() || !String(user.email ?? '').trim()) {
      notify({ title: 'Data user belum lengkap', description: 'Nama dan email wajib diisi.', type: 'error' })
      return
    }

    const next = api.users.save({
      ...user,
      username: user.username || user.email,
      department: roles[user.role] ?? '-',
      status: user.status || 'Aktif',
    })
    setUsers(next)
    setEditing(null)
    notify({ title: 'User disimpan', description: user.name, type: 'success' })
  }

  function deactivate(user) {
    confirm({
      title: 'Nonaktifkan user?',
      description: `${user.name} tidak akan muncul sebagai akun aktif saat login simulasi.`,
      onConfirm: () => {
        setUsers(api.users.deactivate(user.id))
        notify({ title: 'User dinonaktifkan', description: user.name, type: 'info' })
      },
    })
  }

  const columns = [
    { key: 'name', label: 'Nama' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => <Badge tone="brand">{roles[row.role]}</Badge> },
    { key: 'status', label: 'Status', render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" icon={Edit3} aria-label={`Edit ${row.name}`} onClick={() => setEditing(row)} />
          <Button variant="ghost" size="icon-sm" icon={UserMinus} aria-label={`Nonaktifkan ${row.name}`} disabled={row.status === 'Nonaktif'} onClick={() => deactivate(row)} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-700">Admin</p>
          <h1 className="text-lg font-semibold text-slate-950">User Management</h1>
          <p className="text-xs text-slate-500">Kelola user mock dengan lima role utama tanpa permission granular.</p>
        </div>
        <Button size="sm" icon={Plus} onClick={() => setEditing({ name: '', username: '', email: '', role: 'viewer', status: 'Aktif' })}>Tambah</Button>
      </div>

      <Card>
        <CardContent>
          <FormField label="Pencarian">
            <div className="flex h-7 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <TextInput
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1) }}
                className="h-auto border-0 px-0 focus:border-transparent focus:ring-0"
                placeholder="Cari nama, username, email, role..."
              />
            </div>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Daftar User" description={`${rows.length} user tersedia di localStorage.`} />
        <CardContent>
          {rows.length ? <DataTable columns={columns} rows={pagedRows} showActions={false} /> : <EmptyState title="Belum ada user" description="Tambahkan user atau ubah kata kunci pencarian." />}
        </CardContent>
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={rows.length}
          pageSize={pageSize}
          pageSizeOptions={[pageSize]}
          onPrevious={() => setPage((value) => Math.max(1, value - 1))}
          onNext={() => setPage((value) => Math.min(totalPages, value + 1))}
        />
      </Card>

      <UserModal open={Boolean(editing)} user={editing} onClose={() => setEditing(null)} onSave={saveUser} />
    </div>
  )
}

function UserModal({ open, user, onClose, onSave }) {
  const [form, setForm] = useState(user ?? {})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(user ?? {})
    setErrors({})
  }, [user])

  if (!open || !user) return null

  function updateField(key, value) {
    setErrors((current) => ({ ...current, [key]: '' }))
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSave() {
    const nextErrors = {
      name: String(form.name ?? '').trim() ? '' : 'Nama wajib diisi.',
      email: String(form.email ?? '').trim() ? '' : 'Email wajib diisi.',
    }
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.email) return
    onSave(form)
  }

  return (
    <Modal
      open={open}
      title={`${user.id ? 'Edit' : 'Tambah'} User`}
      description="User mock tersimpan di localStorage dan bisa dipilih pada login simulasi."
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button onClick={handleSave}>Simpan</Button></>}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Nama" error={errors.name}><TextInput value={form.name ?? ''} onChange={(event) => updateField('name', event.target.value)} autoFocus /></FormField>
        <FormField label="Username"><TextInput value={form.username ?? ''} onChange={(event) => updateField('username', event.target.value)} /></FormField>
        <FormField label="Email" error={errors.email}><TextInput type="email" value={form.email ?? ''} onChange={(event) => updateField('email', event.target.value)} /></FormField>
        <FormField label="Role">
          <SelectInput value={form.role ?? 'viewer'} onChange={(event) => updateField('role', event.target.value)}>
            {Object.entries(roles).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </SelectInput>
        </FormField>
        <FormField label="Status">
          <SelectInput value={form.status ?? 'Aktif'} onChange={(event) => updateField('status', event.target.value)}>
            <option>Aktif</option>
            <option>Nonaktif</option>
          </SelectInput>
        </FormField>
      </div>
    </Modal>
  )
}
