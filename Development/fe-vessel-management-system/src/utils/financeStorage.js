import { jobList } from '../data/jobs'
import { getCreatedJobs } from './jobStorage'
import { applyJobWorkflowPatch } from './jobWorkflowState'
import { getOperationalState } from './operationalStorage'

const FINANCE_KEY = 'rkbm_finance_state'
const PPN_RATE = 0.11

export const financeTariffs = {
  muatPerMt: 18500,
  bongkarFixed: 42000000,
}

export function currency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

export function roundRupiah(value) {
  return Math.round(Number(value || 0))
}

export function getFinanceState() {
  try {
    return JSON.parse(window.localStorage.getItem(FINANCE_KEY)) ?? seedFinanceState()
  } catch {
    return seedFinanceState()
  }
}

export function saveFinanceState(state) {
  window.localStorage.setItem(FINANCE_KEY, JSON.stringify(state))
}

export function updateFinanceState(updater) {
  const current = getFinanceState()
  const next = updater(current)
  saveFinanceState(next)
  return next
}

export function getAllJobs() {
  return [...getCreatedJobs(), ...jobList].map(applyJobWorkflowPatch)
}

export function getBillableJobs() {
  return getAllJobs()
    .map((job) => {
      const operational = getOperationalState(job)
      const billableBarges = operational.barges.filter((barge) => Number(barge.finalDsr || 0) > 0 && (barge.isFinalLocked || barge.documentStatus === 'Final DSR Dikonfirmasi'))
      return {
        ...job,
        operational,
        billableBarges,
        invoiceCalculation: calculateInvoice(billableBarges),
      }
    })
    .filter((job) => job.billableBarges.length > 0 && (['Vessel Complete', 'Siap Ditagihkan', 'Selesai'].includes(job.operational.status) || job.operationalStatus === 'Vessel Complete'))
}

export function getBillableRkbmOptions() {
  return getBillableJobs().flatMap((job) =>
    job.billableBarges.map((barge) => {
      const line = calculateBargeLine(barge)
      return {
        id: `${job.id}:${barge.id}`,
        jobId: job.id,
        jobNumber: job.jobNumber,
        customer: job.customer,
        vessel: job.vessel,
        rkbmNo: barge.rkbmNo,
        tugBoat: barge.tugBoat,
        barge: barge.barge,
        rkbmType: barge.rkbmType,
        finalDsr: Number(barge.finalDsr || 0),
        ...line,
      }
    }),
  )
}

export function calculateBargeLine(barge) {
  const finalDsr = Number(barge.finalDsr || 0)
  const muat = roundRupiah(finalDsr * financeTariffs.muatPerMt)
  const bongkar = barge.rkbmType === 'Bongkar' ? roundRupiah(financeTariffs.bongkarFixed) : 0
  const subtotal = roundRupiah(muat + bongkar)
  return {
    muat,
    bongkar,
    subtotal,
  }
}

export function calculateInvoice(barges) {
  const lines = barges.map((barge) => ({
    id: barge.id,
    tugBoat: barge.tugBoat,
    barge: barge.barge,
    rkbmNo: barge.rkbmNo,
    rkbmType: barge.rkbmType,
    finalDsr: Number(barge.finalDsr || 0),
    ...calculateBargeLine(barge),
  }))
  const subtotal = roundRupiah(lines.reduce((sum, line) => sum + line.subtotal, 0))
  const ppn = roundRupiah(subtotal * PPN_RATE)
  const total = roundRupiah(subtotal + ppn)
  return { lines, subtotal, ppn, total }
}

export function createInvoice(payload) {
  const selected = getBillableRkbmOptions()
    .filter((item) => payload.rkbmIds.includes(item.id))
    .map((item) => {
      const manualBongkar = Number(payload.manualBongkarRates?.[item.id] || 0)
      if (item.rkbmType !== 'Bongkar' || !manualBongkar) return item
      const bongkar = roundRupiah(manualBongkar)
      return {
        ...item,
        bongkar,
        subtotal: roundRupiah(item.muat + bongkar),
        tariffMode: 'Manual',
      }
    })
  const subtotal = roundRupiah(selected.reduce((sum, item) => sum + item.subtotal, 0))
  const ppn = roundRupiah(subtotal * PPN_RATE)
  const total = roundRupiah(subtotal + ppn)
  const invoice = {
    id: crypto.randomUUID(),
    invoiceNo: payload.invoiceNo,
    invoiceDate: payload.invoiceDate,
    dueDate: payload.dueDate,
    taxInvoiceNo: payload.taxInvoiceNo,
    notes: payload.notes,
    files: payload.files,
    rkbmIds: payload.rkbmIds,
    lines: selected,
    subtotal,
    ppn,
    total,
    paid: 0,
    outstanding: total,
    status: 'Siap Dikirim',
  }
  updateFinanceState((state) => ({ ...state, invoices: [invoice, ...state.invoices] }))
  return invoice
}

export function createPnbp(payload) {
  const pnbp = {
    id: crypto.randomUUID(),
    type: payload.type,
    billingNo: payload.billingNo,
    ntpn: payload.ntpn,
    paidDate: payload.paidDate,
    amount: Number(payload.amount || 0),
    payer: payload.payer,
    proofFile: payload.proofFile,
    status: 'Tercatat',
  }
  updateFinanceState((state) => ({ ...state, pnbp: [pnbp, ...state.pnbp] }))
  return pnbp
}

export function createDebitNote(payload) {
  const selected = getFinanceState().pnbp.filter((item) => payload.pnbpIds.includes(item.id))
  const total = selected.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const debitNote = {
    id: crypto.randomUUID(),
    debitNoteNo: payload.debitNoteNo,
    debitNoteDate: payload.debitNoteDate,
    customer: payload.customer,
    notes: payload.notes,
    pnbpIds: payload.pnbpIds,
    transactions: selected,
    total,
    paid: 0,
    outstanding: total,
    status: 'Siap Dikirim',
  }
  updateFinanceState((state) => ({ ...state, debitNotes: [debitNote, ...state.debitNotes] }))
  return debitNote
}

export function createPayment(payload) {
  const amount = Number(payload.amount || 0)
  const payment = {
    id: crypto.randomUUID(),
    targetType: payload.targetType,
    targetId: payload.targetId,
    paidDate: payload.paidDate,
    amount,
    method: payload.method,
    referenceNo: payload.referenceNo,
    proofFile: payload.proofFile,
    warning: payload.warning,
  }
  updateFinanceState((state) => {
    const key = payload.targetType === 'Invoice' ? 'invoices' : 'debitNotes'
    const updatedTargets = state[key].map((item) => {
      if (item.id !== payload.targetId) return item
      const paid = roundRupiah(Number(item.paid || 0) + amount)
      const outstanding = roundRupiah(Math.max(0, Number(item.total || 0) - paid))
      return {
        ...item,
        paid,
        outstanding,
        status: outstanding === 0 ? 'Lunas' : 'Dibayar Sebagian',
      }
    })
    return { ...state, [key]: updatedTargets, payments: [payment, ...state.payments] }
  })
  return payment
}

export function daysUntil(date) {
  const due = new Date(date)
  const now = new Date()
  return Math.ceil((due.getTime() - now.getTime()) / 86400000)
}

export function dueBadgeTone(date) {
  const days = daysUntil(date)
  if (days < 0) return 'danger'
  if (days <= 7) return 'warning'
  return 'success'
}

export function agingBucket(item) {
  const days = Math.max(0, -daysUntil(item.dueDate ?? item.debitNoteDate))
  if (days <= 30) return '0-30'
  if (days <= 60) return '31-60'
  if (days <= 90) return '61-90'
  return '>90'
}

function seedFinanceState() {
  return {
    invoices: [
      {
        id: 'INV-MOCK-001',
        invoiceNo: 'INV/AG/2026/0701',
        invoiceDate: '2026-07-24',
        dueDate: '2026-08-23',
        taxInvoiceNo: '010.007-26.12345678',
        notes: 'Invoice jasa PBM MV LARUS tahap 1',
        files: [{ id: 'file-inv-1', name: 'Invoice_INV-0701.pdf', size: 920000, type: 'application/pdf' }],
        rkbmIds: ['JOB-2026-0001:BRG-001-A', 'JOB-2026-0001:BRG-001-B'],
        lines: [],
        subtotal: 893625000,
        ppn: 9830_0000,
        total: 991925000,
        paid: 640000000,
        outstanding: 351925000,
        status: 'Diterima Customer',
      },
    ],
    pnbp: [
      { id: 'PNBP-MOCK-001', type: 'PNBP Jasa Barang', billingNo: '820260071001', ntpn: 'NTPN7A1B2C3D', paidDate: '2026-07-23', amount: 118500000, payer: 'PT Lintas Samudera Energi', proofFile: { name: 'Bukti_PNBP_Barang.pdf', size: 510000 }, status: 'Tercatat' },
      { id: 'PNBP-MOCK-002', type: 'PNBP Jasa PBM', billingNo: '820260071002', ntpn: 'NTPN8E4F5G6H', paidDate: '2026-07-24', amount: 42000000, payer: 'Armada Group', proofFile: { name: 'Bukti_PNBP_PBM.pdf', size: 460000 }, status: 'Tercatat' },
    ],
    debitNotes: [
      {
        id: 'DN-MOCK-001',
        debitNoteNo: 'DN/AG/2026/0204',
        debitNoteDate: '2026-07-25',
        customer: 'PT Lintas Samudera Energi',
        notes: 'Reimbursement PNBP MV LARUS',
        pnbpIds: ['PNBP-MOCK-001'],
        transactions: [],
        total: 118500000,
        paid: 0,
        outstanding: 118500000,
        status: 'Siap Dikirim',
      },
    ],
    payments: [
      { id: 'PAY-MOCK-001', targetType: 'Invoice', targetId: 'INV-MOCK-001', paidDate: '2026-07-29', amount: 640000000, method: 'Transfer Bank', referenceNo: 'BNI-TRX-880991', proofFile: { name: 'Bukti_Bayar_INV0701.pdf', size: 730000 }, warning: '' },
    ],
  }
}
