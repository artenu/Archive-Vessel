import { ChevronRight, Home } from 'lucide-react'
import { Link, useMatches } from 'react-router'

export function Breadcrumbs() {
  const matches = useMatches().filter((match) => match.handle?.crumb)

  return (
    <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
      <Link to="/dashboard" className="inline-flex items-center rounded p-1 text-slate-500 hover:text-brand-700" aria-label="Dashboard">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {matches.map((match, index) => (
        <div key={match.id} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className={index === matches.length - 1 ? 'font-semibold text-slate-900' : ''}>{match.handle.crumb}</span>
        </div>
      ))}
    </nav>
  )
}
