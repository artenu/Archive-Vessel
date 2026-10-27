import { FileQuestion } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-9 w-9 place-items-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200">
          <FileQuestion className="h-5 w-5" />
        </div>
        <h1 className="mt-3 text-lg font-semibold text-slate-950">Halaman Tidak Ditemukan</h1>
        <p className="mt-1.5 text-xs text-slate-500">Route yang Anda buka belum tersedia di sistem.</p>
        <Button asChild className="mt-3">
          <Link to="/dashboard">Ke Dashboard</Link>
        </Button>
      </div>
    </main>
  )
}
