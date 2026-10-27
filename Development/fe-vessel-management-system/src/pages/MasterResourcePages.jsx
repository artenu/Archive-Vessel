import { ConfiguredMasterPage } from '../components/master-data/ConfiguredMasterPage'

const statusOptions = ['Aktif', 'Nonaktif']
const vesselTypeOptions = ['Mother Vessel', 'Tug Boat', 'Barge', 'Floating Crane', 'Landing Craft Tank']
const unloadingLocationTypeOptions = ['Jetty', 'Port', 'Anchorage', 'Stockpile', 'Area Muat', 'Area Bongkar']

const customerColumns = [
  { key: 'kode', label: 'Kode Customer' },
  { key: 'nama', label: 'Nama Customer' },
  { key: 'npwp', label: 'NPWP' },
  { key: 'pic', label: 'PIC' },
  { key: 'kontak', label: 'Kontak' },
]

const customerFields = [
  { key: 'kode', label: 'Kode Customer', placeholder: 'CUST-ABC', autoFocus: true },
  { key: 'nama', label: 'Nama Customer', placeholder: 'Nama perusahaan customer' },
  { key: 'pic', label: 'PIC Customer', placeholder: 'Nama PIC customer' },
  { key: 'kontak', label: 'Kontak', placeholder: 'Email atau nomor telepon' },
  { key: 'status', label: 'Status', type: 'select', options: statusOptions, defaultValue: 'Aktif' },
]

const endUserColumns = [
  { key: 'kode', label: 'Kode End User' },
  { key: 'nama', label: 'Nama End User' },
  { key: 'customer', label: 'Customer Terkait' },
  { key: 'lokasi', label: 'Lokasi' },
  { key: 'pic', label: 'PIC' },
]

const endUserFields = [
  { key: 'kode', label: 'Kode End User', placeholder: 'END-ABC', autoFocus: true },
  { key: 'nama', label: 'Nama End User', placeholder: 'Nama end user' },
  {
    key: 'customer',
    label: 'Customer Terkait',
    type: 'select',
    options: (data) => ['', ...(data.customers ?? []).map((item) => item.nama)].map((item) => ({ value: item, label: item || 'Pilih customer' })),
  },
  { key: 'lokasi', label: 'Lokasi', placeholder: 'Area atau kota end user' },
  { key: 'status', label: 'Status', type: 'select', options: statusOptions, defaultValue: 'Aktif' },
]

const vesselColumns = [
  { key: 'kode', label: 'Kode Vessel' },
  { key: 'nama', label: 'Nama Vessel' },
  { key: 'tipe', label: 'Tipe' },
  { key: 'imo', label: 'IMO' },
  { key: 'kapasitas', label: 'Kapasitas' },
  { key: 'operator', label: 'Owner/Operator' },
]

const vesselFields = [
  { key: 'kode', label: 'Kode Vessel', placeholder: 'VES-LARUS', autoFocus: true },
  { key: 'nama', label: 'Nama Vessel', placeholder: 'MV LARUS' },
  { key: 'tipe', label: 'Tipe Vessel', type: 'select', options: vesselTypeOptions, defaultValue: 'Mother Vessel' },
  { key: 'imo', label: 'IMO', placeholder: 'IMO 9345678' },
  { key: 'kapasitas', label: 'Kapasitas / DWT', placeholder: '72.000 DWT' },
  { key: 'status', label: 'Status', type: 'select', options: statusOptions, defaultValue: 'Aktif' },
]

const unloadingLocationColumns = [
  { key: 'kode', label: 'Kode Lokasi' },
  { key: 'nama', label: 'Nama Lokasi Bongkar' },
  { key: 'tipe', label: 'Tipe' },
  { key: 'area', label: 'Area' },
  { key: 'kota', label: 'Kota' },
  { key: 'pic', label: 'PIC Lokasi' },
]

const unloadingLocationFields = [
  { key: 'kode', label: 'Kode Lokasi', placeholder: 'BKR-MJ', autoFocus: true },
  { key: 'nama', label: 'Nama Lokasi Bongkar', placeholder: 'Jetty PLTU Muara Jawa' },
  { key: 'tipe', label: 'Tipe Lokasi', type: 'select', options: unloadingLocationTypeOptions, defaultValue: 'Jetty' },
  { key: 'area', label: 'Area', placeholder: 'Muara Jawa' },
  { key: 'status', label: 'Status', type: 'select', options: statusOptions, defaultValue: 'Aktif' },
]

const destinationLocationColumns = [
  { key: 'kode', label: 'Kode Tujuan' },
  { key: 'nama', label: 'Nama Lokasi Tujuan' },
  { key: 'endUser', label: 'End User' },
  { key: 'customer', label: 'Customer' },
  { key: 'kota', label: 'Kota' },
  { key: 'provinsi', label: 'Provinsi' },
]

const destinationLocationFields = [
  { key: 'kode', label: 'Kode Tujuan', placeholder: 'TJN-MJ', autoFocus: true },
  { key: 'nama', label: 'Nama Lokasi Tujuan', placeholder: 'PLTU Muara Jawa' },
  {
    key: 'endUser',
    label: 'End User',
    type: 'select',
    options: (data) => ['', ...(data.endUsers ?? []).map((item) => item.nama)].map((item) => ({ value: item, label: item || 'Pilih end user' })),
  },
  {
    key: 'customer',
    label: 'Customer',
    type: 'select',
    options: (data) => ['', ...(data.customers ?? []).map((item) => item.nama)].map((item) => ({ value: item, label: item || 'Pilih customer' })),
  },
  { key: 'status', label: 'Status', type: 'select', options: statusOptions, defaultValue: 'Aktif' },
]

export function CustomerMasterPage() {
  return (
    <ConfiguredMasterPage
      resourceKey="customers"
      title="Data Customer"
      description="Kelola identitas customer, NPWP, alamat, PIC, dan kontak untuk kebutuhan order, invoice, dan follow-up."
      addLabel="Tambah Customer"
      tableTitle="Customer"
      valueLabel="Nama Customer"
      searchPlaceholder="Cari kode, nama customer, NPWP, PIC, kontak, status..."
      columns={customerColumns}
      fields={customerFields}
      createItem={() => ({ kode: '', nama: '', npwp: '', alamat: '', pic: '', kontak: '', status: 'Aktif' })}
      validate={(item) => (!item.kode?.trim() || !item.nama?.trim() ? 'Kode customer dan nama customer wajib diisi.' : '')}
    />
  )
}

export function EndUserMasterPage() {
  return (
    <ConfiguredMasterPage
      resourceKey="endUsers"
      title="Data End User"
      description="Kelola end user, customer terkait, lokasi, dan PIC untuk memperjelas relasi pekerjaan operasional."
      addLabel="Tambah End User"
      tableTitle="End User"
      valueLabel="Nama End User"
      searchPlaceholder="Cari kode, nama end user, customer, lokasi, PIC, status..."
      columns={endUserColumns}
      fields={endUserFields}
      createItem={() => ({ kode: '', nama: '', customer: '', lokasi: '', pic: '', status: 'Aktif' })}
      validate={(item) => (!item.kode?.trim() || !item.nama?.trim() ? 'Kode end user dan nama end user wajib diisi.' : '')}
    />
  )
}

export function VesselMasterPage() {
  return (
    <ConfiguredMasterPage
      resourceKey="vessels"
      title="Vessel"
      description="Kelola daftar vessel beserta tipe, identitas IMO/MMSI, kapasitas, bendera, dan owner/operator."
      addLabel="Tambah Vessel"
      tableTitle="Vessel"
      valueLabel="Nama Vessel"
      searchPlaceholder="Cari kode, nama vessel, tipe, IMO, kapasitas, operator, status..."
      columns={vesselColumns}
      fields={vesselFields}
      createItem={() => ({
        kode: '',
        nama: '',
        tipe: 'Mother Vessel',
        imo: '',
        mmsi: '',
        kapasitas: '',
        bendera: '',
        operator: '',
        status: 'Aktif',
      })}
      validate={(item) => (!item.kode?.trim() || !item.nama?.trim() ? 'Kode vessel dan nama vessel wajib diisi.' : '')}
    />
  )
}

export function UnloadingLocationMasterPage() {
  return (
    <ConfiguredMasterPage
      resourceKey="unloadingLocations"
      title="Lokasi Bongkar"
      description="Kelola lokasi bongkar seperti jetty, port, anchorage, area, koordinat, dan PIC lokasi untuk kebutuhan operasional."
      addLabel="Tambah Lokasi Bongkar"
      tableTitle="Lokasi Bongkar"
      valueLabel="Nama Lokasi Bongkar"
      searchPlaceholder="Cari kode, nama lokasi bongkar, tipe, area, kota, PIC, status..."
      columns={unloadingLocationColumns}
      fields={unloadingLocationFields}
      createItem={() => ({
        kode: '',
        nama: '',
        tipe: 'Jetty',
        area: '',
        kota: '',
        provinsi: '',
        koordinat: '',
        pic: '',
        status: 'Aktif',
      })}
      validate={(item) => (!item.kode?.trim() || !item.nama?.trim() ? 'Kode lokasi dan nama lokasi bongkar wajib diisi.' : '')}
    />
  )
}

export function DestinationLocationMasterPage() {
  return (
    <ConfiguredMasterPage
      resourceKey="destinationLocations"
      title="Lokasi Tujuan"
      description="Kelola lokasi tujuan yang terhubung dengan end user dan customer untuk memperjelas drop point pekerjaan."
      addLabel="Tambah Lokasi Tujuan"
      tableTitle="Lokasi Tujuan"
      valueLabel="Nama Lokasi Tujuan"
      searchPlaceholder="Cari kode, nama lokasi tujuan, end user, customer, kota, provinsi, status..."
      columns={destinationLocationColumns}
      fields={destinationLocationFields}
      createItem={() => ({
        kode: '',
        nama: '',
        endUser: '',
        customer: '',
        kota: '',
        provinsi: '',
        koordinat: '',
        status: 'Aktif',
      })}
      validate={(item) => (!item.kode?.trim() || !item.nama?.trim() ? 'Kode tujuan dan nama lokasi tujuan wajib diisi.' : '')}
    />
  )
}
