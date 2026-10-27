import { Bell, LogOut, Search, Settings, UserCircle } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import { Button } from '../ui/Button'
import { Dropdown, DropdownItem } from '../ui/Dropdown'
import { useAuth } from '../../hooks/useAuth'
import { roles } from '../../data/mockUsers'
import { Breadcrumbs } from './Breadcrumbs'

export function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { confirm } = useConfirm()
  const { notify } = useToast()

  function handleLogout() {
    confirm({
      title: 'Keluar dari aplikasi?',
      description: 'Sesi simulasi di browser ini akan dihapus.',
      onConfirm: () => {
        logout()
        notify({ title: 'Berhasil logout', description: 'Anda kembali ke halaman login.', type: 'success' })
        navigate('/login')
      },
    })
  }

  return (
    <header className="sticky top-0 z-30 flex h-11 items-center justify-between border-b border-slate-200/80 bg-white/95 px-3 backdrop-blur sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="min-w-0">
          <Breadcrumbs />
        </div>
        <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500 lg:inline-flex">Development</span>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        <div className="hidden h-7 w-full max-w-[360px] items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 xl:flex">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400" placeholder="Cari archive, pekerjaan, dokumen..." />
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[10px] font-medium text-slate-500">Ctrl K</kbd>
        </div>
        <div className="relative">
          <Button variant="ghost" size="icon" icon={Bell} aria-label="Notifikasi" className="text-slate-600" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-600" />
        </div>
        <div className="hidden h-5 w-px bg-slate-200 md:block" />
        <Dropdown
          trigger={
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700 ring-1 ring-brand-100">
                {user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden text-left lg:block">
                <p className="text-xs font-semibold leading-tight text-slate-900">{user?.name}</p>
                <p className="text-xs leading-tight text-slate-500">{roles[user?.role]}</p>
              </div>
            </div>
          }
        >
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-slate-950">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <div className="my-1 h-px bg-slate-100" />
          <DropdownItem icon={UserCircle}>Profil Saya</DropdownItem>
          <DropdownItem icon={Settings}>Pengaturan</DropdownItem>
          <DropdownItem icon={LogOut} className="text-brand-700 hover:bg-brand-50" onClick={handleLogout}>
            Logout
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  )
}
