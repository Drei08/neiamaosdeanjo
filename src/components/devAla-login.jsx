import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { FaLock } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext.jsx'
import './devAla-login.css'

// rota para onde o login leva (a mesma da página de Atendimento no App.jsx)
const DESTINO = '/home'

export default function DevAlaLogin() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (user) return <Navigate to={DESTINO} replace />

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await login(email.trim(), senha)
      navigate(DESTINO, { replace: true })
    } catch {
      setErro('E-mail ou senha incorretos.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="dev">
      <div className="dev-card">
        <div className="dev-brand">dev<b>A<span className="flip">L</span>A</b></div>
        <p className="dev-muted dev-center">Painel de Sistema</p>
        <form onSubmit={entrar} className="dev-form">
          <label>E-mail
            <input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label>Senha
            <input type="password" autoComplete="current-password" value={senha} onChange={e => setSenha(e.target.value)} required />
          </label>
          {erro && <p className="dev-err">{erro}</p>}
          <button className="dev-btn" disabled={enviando}>
            <FaLock /> {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}