import { lazy, Suspense } from 'react'

const AnalysisPage = lazy(() => import('../pages/AnalysisPage').then((module) => ({ default: module.AnalysisPage })))

function RouteLoader() {
  return (
    <div className="grid min-h-[360px] place-items-center">
      <div className="h-8 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-brand-700" />
    </div>
  )
}

export function AnalysisRoute({ initialTab }) {
  return (
    <Suspense fallback={<RouteLoader />}>
      <AnalysisPage initialTab={initialTab} />
    </Suspense>
  )
}
