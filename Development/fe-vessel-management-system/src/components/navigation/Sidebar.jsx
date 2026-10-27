import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { getNavigationByRole } from '../../data/navigation'
import { roles } from '../../data/mockUsers'
import logoArmada from '../../assets/BGLogoArmada.png'
import { cn } from '../../utils/cn'

export function Sidebar({ role, collapsed = false, onToggle }) {
  const items = getNavigationByRole(role)
  const location = useLocation()
  const currentPath = `${location.pathname}${location.search}`
  const [openGroups, setOpenGroups] = useState({})
  const isPathActive = useCallback((path) => {
    const [pathname, search] = path.split('?')
    if (pathname !== location.pathname) return false
    return !search || `?${search}` === location.search
  }, [location.pathname, location.search])

  useEffect(() => {
    const activeGroups = items
      .filter((item) => item.children?.length && (isPathActive(item.path) || item.children.some((child) => isPathActive(child.path))))
      .reduce((groups, item) => ({ ...groups, [item.path]: true }), {})

    if (Object.keys(activeGroups).length) {
      setOpenGroups((groups) => {
        const alreadyOpen = Object.keys(activeGroups).every((path) => groups[path])
        return alreadyOpen ? groups : { ...groups, ...activeGroups }
      })
    }
  }, [currentPath, isPathActive, items])

  function toggleGroup(path) {
    setOpenGroups((groups) => ({ ...groups, [path]: !groups[path] }))
  }

  function isGroupActive(item) {
    return isPathActive(item.path) || item.children?.some((child) => isPathActive(child.path))
  }

  return (
    <aside
      className={cn(
        'sticky top-0 z-40 flex min-h-screen flex-col overflow-visible border-r border-slate-900/70 bg-[#14171d] text-slate-300 transition-[width] duration-200',
        collapsed ? 'w-[64px]' : 'w-[216px]',
      )}
    >
      <button
        type="button"
        aria-label={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
        onClick={onToggle}
        className="absolute -right-3 top-5 z-50 grid h-6 w-6 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      <div className={cn('flex h-14 items-center border-b border-white/[0.06]', collapsed ? 'justify-center px-2' : 'px-3')}>
        <div className={cn('flex min-w-0 items-center', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-md bg-black ring-1 ring-white/10">
            <img src={logoArmada} alt="Armada Group" className="h-full w-full object-contain p-0.5" />
          </div>
          <div className={cn('min-w-0 transition-opacity', collapsed && 'hidden')}>
            <p className="truncate text-sm font-semibold tracking-[0.08em] text-white">ARMADA</p>
            <p className="text-[11px] leading-4 text-slate-400">RKBM Archive System</p>
          </div>
        </div>
      </div>

      <div className={cn('py-3', collapsed ? 'px-2' : 'px-3')}>
        {!collapsed ? <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">Menu Utama</p> : null}
        <nav className="space-y-1">
          {items.map((item) => {
            const hasChildren = item.children?.length
            const groupActive = hasChildren && isGroupActive(item)
            const groupOpen = !collapsed && openGroups[item.path]
            const ExpandIcon = item.expandIcon

            if (hasChildren) {
              return (
                <div key={`${item.path}-${item.label}`} className="space-y-1">
                  <button
                    type="button"
                    className={cn(
                      'flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-100',
                      groupActive && 'bg-brand-600 text-white shadow-sm hover:bg-brand-600 hover:text-white',
                      collapsed && 'justify-center px-0',
                    )}
                    onClick={() => toggleGroup(item.path)}
                    title={collapsed ? item.label : undefined}
                    aria-expanded={groupOpen}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    {!collapsed ? <span className="min-w-0 flex-1 truncate text-left">{item.label}</span> : null}
                    {!collapsed && ExpandIcon ? (
                      <ExpandIcon className={cn('h-3.5 w-3.5 shrink-0 transition-transform', groupOpen && 'rotate-180')} />
                    ) : null}
                  </button>

                  {groupOpen ? (
                    <div className="space-y-1 pl-4">
                      {item.children.map((child) => (
                        <NavLink
                          key={`${child.path}-${child.label}`}
                          to={child.path}
                          className={() =>
                            cn(
                              'flex h-8 items-center gap-2 rounded-md px-2.5 text-[11px] font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-100',
                              isPathActive(child.path) && 'bg-white/[0.08] text-white',
                            )
                          }
                        >
                          <child.icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            }

            return (
              <NavLink
                key={`${item.path}-${item.label}`}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex h-9 items-center gap-2.5 rounded-md px-2.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-100',
                    isActive && 'bg-brand-600 text-white shadow-sm hover:bg-brand-600 hover:text-white',
                    collapsed && 'justify-center px-0',
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className={cn('mt-auto border-t border-white/[0.06] py-3', collapsed ? 'px-0' : 'px-4')}>
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-2')}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <div className={cn('min-w-0', collapsed && 'hidden')}>
            <p className="truncate text-xs font-medium text-slate-200">{roles[role]}</p>
            <p className="text-[11px] text-slate-500">Archive focus</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
