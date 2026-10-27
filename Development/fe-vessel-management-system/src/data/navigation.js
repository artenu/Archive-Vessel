import {
  BriefcaseBusiness,
  ChevronDown,
  Database,
  FilePlus2,
  ReceiptText,
  LayoutDashboard,
  Ship,
  Users,
} from 'lucide-react'

const allRoles = ['admin', 'sales', 'operational', 'finance', 'viewer']

export const routeAccess = {
  '/dashboard': allRoles,
  '/pekerjaan': allRoles,
  '/sales/jobs': ['admin', 'sales'],
  '/sales/jobs/new': ['admin', 'sales'],
  '/sales/jobs/edit': ['admin', 'sales'],
  '/operational/jobs': ['admin', 'operational'],
  '/finance/jobs': ['admin', 'finance'],
  '/master-data': ['admin'],
  '/pengguna': ['admin'],
}

export const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: allRoles },
  { label: 'Job Sales', path: '/sales/jobs', icon: FilePlus2, roles: ['admin', 'sales'] },
  { label: 'Job Operational', path: '/operational/jobs', icon: Ship, roles: ['admin', 'operational'] },
  { label: 'Job Finance', path: '/finance/jobs', icon: ReceiptText, roles: ['admin', 'finance'] },
  { label: 'Daftar Pekerjaan', path: '/pekerjaan', icon: BriefcaseBusiness, roles: allRoles },
  {
    label: 'Master Data',
    path: '/master-data',
    icon: Database,
    expandIcon: ChevronDown,
    roles: ['admin'],
    children: [
      { label: 'Customer', path: '/master-data?resource=customers', icon: Database },
      { label: 'Vessel', path: '/master-data?resource=vessels', icon: Ship },
      { label: 'Tug Boat', path: '/master-data?resource=tugBoats', icon: Ship },
      { label: 'Barge', path: '/master-data?resource=barges', icon: Ship },
    ],
  },
  { label: 'User Management', path: '/pengguna', icon: Users, roles: ['admin'] },
]

export function getNavigationByRole(role) {
  if (!role) return []
  return navigationItems.filter((item) => item.roles.includes(role))
}

export function canAccessPath(role, path) {
  if (!role) return false
  if (role === 'admin') return true
  return routeAccess[path]?.includes(role) ?? false
}
