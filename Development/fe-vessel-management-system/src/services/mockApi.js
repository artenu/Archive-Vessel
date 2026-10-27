import { mockUsers } from '../data/mockUsers'

const MASTER_KEY = 'rkbm_master_data'
const USERS_KEY = 'rkbm_admin_users'
const LOG_KEY = 'rkbm_activity_log'

const seedMaster = {
  customers: [
    {
      id: 'CUST-001',
      kode: 'CUST-LSE',
      nama: 'PT Lintas Samudera Energi',
      endUser: 'PLTU Muara Jawa',
      npwp: '01.234.567.8-901.000',
      alamat: 'Jl. Pelabuhan No. 18, Jakarta Utara',
      pic: 'Raka Pratama',
      kontak: 'raka@lintassamudera.co.id',
      keterangan: 'Customer aktif untuk pekerjaan batubara.',
      status: 'Aktif',
    },
    {
      id: 'CUST-002',
      kode: 'CUST-NML',
      nama: 'PT Nusantara Mineral Logistik',
      endUser: 'PT Krakatau Power Terminal',
      npwp: '02.345.678.9-012.000',
      alamat: 'Jl. Industri Raya No. 42, Cilegon',
      pic: 'Maya Wulandari',
      kontak: 'maya@nusantaralogistik.co.id',
      keterangan: 'Customer aktif untuk terminal mineral.',
      status: 'Aktif',
    },
  ],
  endUsers: [
    {
      id: 'END-001',
      kode: 'END-PLTU-MJ',
      nama: 'PLTU Muara Jawa',
      customer: 'PT Lintas Samudera Energi',
      lokasi: 'Muara Jawa',
      pic: 'Dian Saputra',
      status: 'Aktif',
    },
    {
      id: 'END-002',
      kode: 'END-KPT',
      nama: 'PT Krakatau Power Terminal',
      customer: 'PT Nusantara Mineral Logistik',
      lokasi: 'Cilegon',
      pic: 'Arini Permata',
      status: 'Aktif',
    },
  ],
  vessels: [
    {
      id: 'VES-001',
      kode: 'VES-LARUS',
      nama: 'MV LARUS',
      tipe: 'Mother Vessel',
      imo: 'IMO 9345678',
      mmsi: '525001234',
      kapasitas: '72.000 DWT',
      bendera: 'Indonesia',
      operator: 'PT Lintas Samudera Energi',
      owner: 'PT Lintas Samudera Energi',
      status: 'Aktif',
    },
    {
      id: 'VES-002',
      kode: 'VES-ARMADA-SMD',
      nama: 'MV Armada Samudera',
      tipe: 'Mother Vessel',
      imo: 'IMO 9456789',
      mmsi: '525004321',
      kapasitas: '64.500 DWT',
      bendera: 'Indonesia',
      operator: 'Armada Group',
      owner: 'Armada Group',
      status: 'Aktif',
    },
  ],
  tugBoats: [
    { id: 'TUG-001', kode: 'TB-H19', nama: 'TB Harmony XIX', owner: 'Armada Group', kapasitas: '2.400 HP', status: 'Aktif' },
    { id: 'TUG-002', kode: 'TB-W1110', nama: 'TB Wiratimur 1110', owner: 'PT Wiratimur', kapasitas: '2.800 HP', status: 'Aktif' },
  ],
  barges: [
    { id: 'BRG-M-001', kode: 'BG-LS88', nama: 'BG Lintas Samudera 88', owner: 'PT Lintas Samudera Energi', kapasitas: '8.500 MT', status: 'Aktif' },
    { id: 'BRG-M-002', kode: 'BG-W3003', nama: 'BG Wiratimur 3003', owner: 'PT Wiratimur', kapasitas: '9.000 MT', status: 'Aktif' },
  ],
  locations: [
    { id: 'LOC-001', kode: 'LOC-MJ', nama: 'Jetty PLTU Muara Jawa', status: 'Aktif' },
    { id: 'LOC-002', kode: 'LOC-J3', nama: 'Jetty 3', status: 'Aktif' },
  ],
  unloadingLocations: [
    {
      id: 'ULOC-001',
      kode: 'BKR-MJ',
      nama: 'Jetty PLTU Muara Jawa',
      tipe: 'Jetty',
      area: 'Muara Jawa',
      kota: 'Kutai Kartanegara',
      provinsi: 'Kalimantan Timur',
      koordinat: '-0.7594, 117.2567',
      pic: 'Dian Saputra',
      status: 'Aktif',
    },
    {
      id: 'ULOC-002',
      kode: 'BKR-J3',
      nama: 'Jetty 3',
      tipe: 'Jetty',
      area: 'Cilegon',
      kota: 'Cilegon',
      provinsi: 'Banten',
      koordinat: '-6.0171, 105.9536',
      pic: 'Arini Permata',
      status: 'Aktif',
    },
  ],
  destinationLocations: [
    {
      id: 'DLOC-001',
      kode: 'TJN-MJ',
      nama: 'PLTU Muara Jawa',
      endUser: 'PLTU Muara Jawa',
      customer: 'PT Lintas Samudera Energi',
      kota: 'Kutai Kartanegara',
      provinsi: 'Kalimantan Timur',
      koordinat: '-0.7594, 117.2567',
      status: 'Aktif',
    },
    {
      id: 'DLOC-002',
      kode: 'TJN-KPT',
      nama: 'Krakatau Power Terminal',
      endUser: 'PT Krakatau Power Terminal',
      customer: 'PT Nusantara Mineral Logistik',
      kota: 'Cilegon',
      provinsi: 'Banten',
      koordinat: '-6.0171, 105.9536',
      status: 'Aktif',
    },
  ],
  documentTypes: [
    { id: 'DOC-001', kode: 'DOC-SPK', nama: 'Surat Penunjukan', status: 'Aktif' },
    { id: 'DOC-002', kode: 'DOC-FDSR', nama: 'Final DSR', status: 'Aktif' },
  ],
  rkbmTariffs: [
    { id: 'TRF-001', kode: 'TRF-MUAT', nama: 'Tarif RKBM Muat', nilai: '18500', status: 'Aktif' },
    { id: 'TRF-002', kode: 'TRF-BONGKAR', nama: 'Tarif Tetap RKBM Bongkar', nilai: '42000000', status: 'Aktif' },
  ],
  taxConfig: [
    { id: 'TAX-001', kode: 'PPN', nama: 'PPN', nilai: '11', status: 'Aktif' },
  ],
}

export const masterResources = [
  { key: 'customers', label: 'Data Customer', valueLabel: 'Nama Customer', path: '/master-data/customer' },
  { key: 'endUsers', label: 'Data End User', valueLabel: 'Nama End User', path: '/master-data/end-user' },
  { key: 'vessels', label: 'Vessel', valueLabel: 'Nama Vessel', path: '/master-data/vessel' },
  { key: 'tugBoats', label: 'Tug Boat', valueLabel: 'Nama Tug Boat' },
  { key: 'barges', label: 'Barge', valueLabel: 'Nama Barge' },
  { key: 'locations', label: 'Lokasi', valueLabel: 'Nama Lokasi' },
  { key: 'unloadingLocations', label: 'Lokasi Bongkar', valueLabel: 'Nama Lokasi Bongkar', path: '/master-data/lokasi-bongkar' },
  { key: 'destinationLocations', label: 'Lokasi Tujuan', valueLabel: 'Nama Lokasi Tujuan', path: '/master-data/lokasi-tujuan' },
  { key: 'documentTypes', label: 'Jenis Dokumen', valueLabel: 'Nama Dokumen' },
  { key: 'rkbmTariffs', label: 'Tarif RKBM', valueLabel: 'Nama Tarif' },
  { key: 'taxConfig', label: 'Konfigurasi PPN', valueLabel: 'Nama Konfigurasi' },
]

export const masterNavigationItems = [
  { key: 'customers', label: 'Data Customer', path: '/master-data/customer' },
  { key: 'endUsers', label: 'Data End User', path: '/master-data/end-user' },
  { key: 'vessels', label: 'Vessel', path: '/master-data/vessel' },
  { key: 'unloadingLocations', label: 'Lokasi Bongkar', path: '/master-data/lokasi-bongkar' },
  { key: 'destinationLocations', label: 'Lokasi Tujuan', path: '/master-data/lokasi-tujuan' },
]

function readJson(key, fallback) {
  try {
    return JSON.parse(window.localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function hydrateMasterData(stored) {
  const next = { ...seedMaster, ...stored }

  Object.entries(seedMaster).forEach(([key, seedRows]) => {
    const rows = Array.isArray(stored?.[key]) ? stored[key] : seedRows
    next[key] = rows.map((row) => ({ ...(seedRows.find((seed) => seed.id === row.id) ?? {}), ...row }))
  })

  return next
}

function nextId(prefix) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

export const api = {
  masterData: {
    list() {
      return hydrateMasterData(readJson(MASTER_KEY, seedMaster))
    },
    save(resourceKey, item, actor = 'Admin') {
      const data = api.masterData.list()
      const before = data[resourceKey].find((row) => row.id === item.id) ?? null
      const nextItem = { ...item, id: item.id || nextId('MST'), status: item.status || 'Aktif' }
      const rows = before ? data[resourceKey].map((row) => (row.id === item.id ? nextItem : row)) : [nextItem, ...data[resourceKey]]
      const next = { ...data, [resourceKey]: rows }
      writeJson(MASTER_KEY, next)
      api.activityLog.record({
        user: actor,
        module: 'Master Data',
        action: before ? 'Update master data' : 'Tambah master data',
        before,
        after: nextItem,
        reason: before ? 'Pemutakhiran referensi' : 'Penambahan referensi baru',
      })
      return next
    },
  },
  users: {
    list() {
      const seeded = mockUsers.map((user) => ({
        ...user,
        username: user.username ?? user.email,
        status: 'Aktif',
      }))
      return readJson(USERS_KEY, seeded).map((user) => ({
        ...user,
        username: user.username ?? user.email,
        status: user.status ?? 'Aktif',
      }))
    },
    save(user, actor = 'Admin') {
      const users = api.users.list()
      const before = users.find((item) => item.id === user.id) ?? null
      const nextUser = { ...user, id: user.id || nextId('USR'), status: user.status || 'Aktif' }
      const next = before ? users.map((item) => (item.id === user.id ? nextUser : item)) : [nextUser, ...users]
      writeJson(USERS_KEY, next)
      api.activityLog.record({
        user: actor,
        module: 'User Management',
        action: before ? 'Update user' : 'Tambah user',
        before,
        after: nextUser,
        reason: before ? 'Perubahan user atau role' : 'Pembuatan user baru',
      })
      return next
    },
    deactivate(userId, actor = 'Admin') {
      const users = api.users.list()
      const before = users.find((user) => user.id === userId)
      const next = users.map((user) => (user.id === userId ? { ...user, status: 'Nonaktif' } : user))
      writeJson(USERS_KEY, next)
      api.activityLog.record({
        user: actor,
        module: 'User Management',
        action: 'Nonaktifkan user',
        before,
        after: next.find((user) => user.id === userId),
        reason: 'User tidak lagi aktif',
      })
      return next
    },
  },
  activityLog: {
    list() {
      return readJson(LOG_KEY, seedLogs())
    },
    record(entry) {
      const rows = api.activityLog.list()
      const nextEntry = {
        id: nextId('LOG'),
        date: new Date().toISOString(),
        ipAddress: `10.10.${Math.floor(Math.random() * 90) + 10}.${Math.floor(Math.random() * 180) + 20}`,
        ...entry,
      }
      writeJson(LOG_KEY, [nextEntry, ...rows])
      return nextEntry
    },
  },
}

function seedLogs() {
  return [
    {
      id: 'LOG-001',
      user: 'Dimas Wirawan',
      action: 'Konfirmasi Final DSR',
      module: 'Operational',
      before: { status: 'Review', finalDsr: 24300 },
      after: { status: 'Final DSR Dikonfirmasi', finalDsr: 24300 },
      date: '2026-07-30T03:22:00.000Z',
      ipAddress: '10.10.20.41',
      reason: 'Final DSR sudah diverifikasi surveyor',
    },
    {
      id: 'LOG-002',
      user: 'Nadia Puspita',
      action: 'Buat Invoice',
      module: 'Finance',
      before: { status: 'Siap Ditagihkan' },
      after: { invoiceNo: 'INV/AG/2026/0701', status: 'Siap Dikirim' },
      date: '2026-07-29T09:12:00.000Z',
      ipAddress: '10.10.32.88',
      reason: 'Job sudah Vessel Complete',
    },
  ]
}
