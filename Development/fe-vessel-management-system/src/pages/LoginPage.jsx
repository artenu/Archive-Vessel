import { ArrowRight, Database, FileText, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { roles } from '../data/mockUsers'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { api } from '../services/mockApi'
import logoArmada from '../assets/BGLogoArmada.png'

export function LoginPage() {
  const users = useMemo(() => api.users.list().filter((user) => user.status !== 'Nonaktif'), [])
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()

  const selectedUser = useMemo(() => users.find((user) => user.id === selectedUserId) ?? users[0], [selectedUserId, users])

  function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    window.setTimeout(() => {
      login(selectedUserId)
      notify({
        title: 'Login simulasi berhasil',
        description: `Masuk sebagai ${roles[selectedUser?.role]}.`,
        type: 'success',
      })
      navigate('/dashboard')
    }, 450)
  }

  return (
    <main className="login-page">
      <div className="login-shell">
        <section className="login-brand-panel">
          <div className="login-brand-content">
            <div className="login-brand-head">
              <div className="login-logo-box">
                <img src={logoArmada} alt="Armada Group" />
              </div>
              <div>
                <p className="login-brand-name">Armada</p>
                <p className="login-brand-subtitle">RKBM Archive Management System</p>
              </div>
            </div>

            <div className="login-copy">
              <p className="login-eyebrow">Data Archive System</p>
              <h1>Data RKBM lebih rapi, mudah dicari, dan aman tersimpan.</h1>
              <p>
                Kelola pekerjaan Sales, Operational, Finance, master data, serta dokumen pendukung dalam satu sistem terpusat.
              </p>
            </div>

            <div className="login-brand-bottom">
              <div className="login-features">
                <Feature icon={FileText} label="Arsip dokumen" />
                <Feature icon={Database} label="Master data" />
                <Feature icon={ShieldCheck} label="Role akses" />
              </div>
              <div className="login-metrics">
                <Metric value="5" label="Role" />
                <Metric value="4" label="Master" />
                <Metric value="24/7" label="Akses" />
              </div>
            </div>
          </div>
        </section>

        <section className="login-form-panel">
          <div className="login-form-card">
            <div className="login-lock">
              <LockKeyhole size={22} />
            </div>
            <h2>Selamat datang kembali</h2>
            <p className="login-form-intro">Pilih akun simulasi untuk masuk ke sistem.</p>

            <form className="login-form" onSubmit={handleSubmit}>
              <label className="login-field">
                <span>Akun Simulasi</span>
                <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {roles[user.role]} - {user.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="login-field">
                <span>Email</span>
                <input value={selectedUser?.email ?? ''} readOnly />
              </label>

              <label className="login-field">
                <span>Password</span>
                <input value="simulasi-frontend" type="password" readOnly />
              </label>

              <div className="login-role-box">
                <div>
                  <span>Role aktif</span>
                  <strong>{roles[selectedUser?.role]}</strong>
                  <small>{selectedUser?.department ?? selectedUser?.username}</small>
                </div>
                <b>Aktif</b>
              </div>

              <div className="login-actions-row">
                <label>
                  <input type="checkbox" />
                  Ingat saya
                </label>
                <button type="button">Lupa password?</button>
              </div>

              <button className="login-submit" type="submit" disabled={loading}>
                {loading ? <Loader2 size={16} className="login-spin" /> : <ArrowRight size={16} />}
                Masuk ke Aplikasi
              </button>
            </form>

            <p className="login-footnote">(c) 2026 RKBM Archive Management System</p>
          </div>
        </section>
      </div>
    </main>
  )
}

function Feature({ icon: Icon, label }) {
  return (
    <div className="login-feature">
      <Icon size={15} />
      <span>{label}</span>
    </div>
  )
}

function Metric({ value, label }) {
  return (
    <div className="login-metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}
