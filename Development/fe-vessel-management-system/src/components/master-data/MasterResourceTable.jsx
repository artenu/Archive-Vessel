import { DataTable } from '../data-display/DataTable'
import { EmptyState } from '../feedback/EmptyState'
import { Card, CardContent, CardHeader } from '../ui/Card'

export function MasterResourceTable({ resource, rows, columns }) {
  return (
    <Card>
      <CardHeader title={`Daftar ${resource.label}`} description={`${rows.length} data tersedia.`} />
      <CardContent>
        {rows.length ? (
          <DataTable columns={columns} rows={rows} showActions={false} />
        ) : (
          <EmptyState title="Data kosong" description="Belum ada data untuk kategori ini." />
        )}
      </CardContent>
    </Card>
  )
}
