import { lazy, Suspense } from 'react'

const DashboardPage = lazy(() => import('../pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))

function RouteLoader() {
  return (
    <div className="grid min-h-[360px] place-items-center">
      <div className="h-8 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-brand-700" />
    </div>
  )
}

export function DashboardRoute() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <DashboardPage />
    </Suspense>
  )
}
