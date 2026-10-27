import { useState } from 'react'
import { Outlet } from 'react-router'
import { Sidebar } from '../components/navigation/Sidebar'
import { Topbar } from '../components/navigation/Topbar'
import { useAuth } from '../hooks/useAuth'

export function AppLayout() {
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  function toggleSidebar() {
    setCollapsed((value) => !value)
  }

  return (
    <div className="flex min-h-screen bg-[#f7f8fa] text-sm text-slate-800">
      <Sidebar
        role={user?.role}
        collapsed={collapsed}
        onToggle={toggleSidebar}
      />
      <div className="min-w-0 flex-1">
        <Topbar />
        <main className="mx-auto w-full max-w-[1500px] px-3 py-3 sm:px-4 sm:py-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
