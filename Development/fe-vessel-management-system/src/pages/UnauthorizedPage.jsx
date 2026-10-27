import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'

export function UnauthorizedPage() {
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <Card className="max-w-md">
        <CardContent className="p-4 text-center">
          <div className="mx-auto grid h-9 w-9 place-items-center rounded-md bg-brand-50 text-brand-700">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h1 className="mt-3 text-lg font-semibold text-slate-950">Akses Tidak Diizinkan</h1>
          <p className="mt-1.5 text-xs text-slate-500">Role Anda tidak memiliki izin untuk membuka halaman ini.</p>
          <Button asChild className="mt-3">
            <Link to="/dashboard">Kembali ke Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
