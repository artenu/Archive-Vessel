import { Eye } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'

const scheduledOrders = [
  {
    id: 'SCHED-001',
    code: 'SO 4',
    salesOrderNo: 'SO/MBS/MV-SEJAHTERA/0826-004',
    customer: 'PT Marunda Bulk Services',
    route: 'Jetty Marunda ke Anchorage Taboneo',
    vessel: 'MV SEJAHTERA BARU',
    cargo: 'Batubara',
    totalCargo: '38.200 MT',
    plannedDate: '03 Agu 2026',
    eta: '08:30 WITA',
    status: 'Menunggu Jadwal',
    bargePlan: '2 tongkang',
    documentProgress: '3/4',
  },
  {
    id: 'SCHED-002',
    code: 'SO 5',
    salesOrderNo: 'SO/KPT/MV-NUSANTARA/0826-011',
    customer: 'PT Krakatau Power Terminal',
    route: 'Anchorage Cilegon ke Jetty 2',
    vessel: 'MV NUSANTARA ENERGY',
    cargo: 'Limestone',
    totalCargo: '24.800 MT',
    plannedDate: '05 Agu 2026',
    eta: '14:00 WIB',
    status: 'Dokumen Diproses',
    bargePlan: '1 tongkang',
    documentProgress: '2/4',
  },
  {
    id: 'SCHED-003',
    code: 'SO 6',
    salesOrderNo: 'SO/BET/TB-SAMUDERA/0826-018',
    customer: 'PT Borneo Energy Terminal',
    route: 'Area Muat B ke Mother Vessel Area',
    vessel: 'TB SAMUDERA 12',
    cargo: 'Nickel Ore',
    totalCargo: '19.600 MT',
    plannedDate: '08 Agu 2026',
    eta: '10:15 WITA',
    status: 'Siap Jalan',
    bargePlan: '1 tongkang',
    documentProgress: '4/4',
  },
]

const statusTones = {
  'Menunggu Jadwal': 'warning',
  'Dokumen Diproses': 'info',
  'Siap Jalan': 'success',
}

export function ScheduledOrdersPage() {
  const [selected, setSelected] = useState(null)

  return (
    <div className="space-y-2.5">
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_22px_rgba(15,23,42,0.06)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">Order Terjadwal</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Dashboard Sales Order Terjadwal</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Pantau SO yang sudah masuk rencana operasi dan menunggu jadwal pelaksanaan.
        </p>
      </div>

      <Card className="overflow-hidden shadow-[0_10px_28px_rgba(15,23,42,0.07)] ring-1 ring-white">
        <div
          className="hidden items-center gap-3 border-b border-slate-300 bg-slate-200/80 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 shadow-[inset_0_-1px_0_rgba(15,23,42,0.05)] lg:grid"
          style={{ gridTemplateColumns: '56px minmax(0,1.35fr) minmax(0,0.9fr) 110px 84px 76px minmax(112px,0.65fr) 38px' }}
        >
          <span>SO</span>
          <span>Sales Order</span>
          <span>Vessel</span>
          <span>Jadwal</span>
          <span>ETA</span>
          <span>Dok.</span>
          <span>Status</span>
          <span className="text-right">Aksi</span>
        </div>
        <div className="divide-y divide-slate-100 bg-white">
          {scheduledOrders.map((order) => (
            <ScheduledRow key={order.id} order={order} onDetail={setSelected} />
          ))}
        </div>
      </Card>

      <ScheduledDetailModal order={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function ScheduledRow({ order, onDetail }) {
  return (
    <div
      className="grid gap-3 px-3 py-3 transition hover:bg-slate-50 lg:grid lg:items-center"
      style={{ gridTemplateColumns: '56px minmax(0,1.35fr) minmax(0,0.9fr) 110px 84px 76px minmax(112px,0.65fr) 38px' }}
    >
      <div className="grid h-8 w-12 place-items-center rounded-md bg-brand-700 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(225,2,10,0.22)]">
        {order.code}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-tight text-slate-950">{order.salesOrderNo}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{order.customer} - {order.route}</p>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-tight text-slate-950">{order.vessel}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{order.cargo} - {order.totalCargo}</p>
      </div>

      <p className="text-xs font-semibold text-slate-900">{order.plannedDate}</p>
      <p className="text-xs font-medium text-slate-500">{order.eta}</p>
      <p className="text-sm font-semibold text-slate-950">{order.documentProgress}</p>

      <div className="flex min-w-0 items-center">
        <Badge tone={statusTones[order.status]}>{order.status}</Badge>
      </div>

      <div className="flex justify-end">
        <Button
          variant="secondary"
          size="icon-sm"
          icon={Eye}
          aria-label={`Detail ${order.salesOrderNo}`}
          className="shadow-sm hover:border-brand-200 hover:text-brand-700"
          onClick={() => onDetail(order)}
        />
      </div>
    </div>
  )
}

function ScheduledDetailModal({ order, onClose }) {
  if (!order) return null

  return (
    <Modal
      open
      onClose={onClose}
      title="Detail Order Terjadwal"
      description={order.salesOrderNo}
      maxWidth="max-w-4xl"
      bodyClassName="bg-slate-50"
      footer={<Button onClick={onClose}>Tutup</Button>}
    >
      <div className="grid gap-3">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)] ring-1 ring-white">
          <div className="border-l-4 border-brand-600 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <div className="grid h-9 w-14 place-items-center rounded-md bg-brand-700 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(225,2,10,0.28)]">
                  {order.code}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">Sales Order</p>
                  <p className="truncate text-sm font-semibold text-slate-950">{order.salesOrderNo}</p>
                </div>
              </div>
              <Badge tone={statusTones[order.status]}>{order.status}</Badge>
            </div>

            <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">{order.vessel}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">{order.customer} - {order.route}</p>
          </div>
        </section>

        <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard label="Jadwal Operasi" value={order.plannedDate} />
          <InfoCard label="ETA" value={order.eta} />
          <InfoCard label="Rencana Tongkang" value={order.bargePlan} />
          <InfoCard label="Komoditas" value={order.cargo} />
          <InfoCard label="Total Muatan" value={order.totalCargo} />
          <InfoCard label="Dokumen" value={order.documentProgress} />
        </section>
      </div>
    </Modal>
  )
}

function InfoCard({ label, value }) {
  return (
    <div className="relative overflow-hidden rounded-md border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-3 py-2.5 shadow-[0_3px_10px_rgba(15,23,42,0.08)]">
      <span className="absolute inset-y-2 left-0 w-0.5 rounded-r-full bg-brand-600 opacity-80" />
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  )
}
