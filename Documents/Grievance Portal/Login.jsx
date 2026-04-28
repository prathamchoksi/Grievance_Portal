import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const parseAdmins = (raw) => {
  // Format: id,password,scope|id,password,scope
  // Example: Mess,pass123,Mess|General,admin123,all
  if (!raw || typeof raw !== 'string') {
    return []
  }

  return raw
    .split('|')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [id, password, scope] = entry.split(',').map((part) => (part ?? '').trim())
      if (!id || !password || !scope) {
        return null
      }

      return { id, password, scope }
    })
    .filter(Boolean)
}

function Login() {
  const [adminId, setAdminId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    const admins = parseAdmins(import.meta.env.VITE_ADMINS)
    if (admins.length === 0) {
      setError('Admin login is not configured. Set VITE_ADMINS in .env and restart the dev server.')
      return
    }

    const match = admins.find((item) => item.id === adminId && item.password === password)
    if (!match) {
      setError('Invalid admin ID or password')
      return
    }

    localStorage.setItem('isAdmin', 'true')
    localStorage.setItem('adminScope', match.scope)
    localStorage.setItem('adminId', match.id)
    navigate('/admin')
  }

  return (
    <main className="page">
      <h1 className="title">Admin Login</h1>
      <p className="subtitle">Enter admin ID and password to access the dashboard.</p>

      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="adminId">Admin ID</label>
          <input
            id="adminId"
            type="text"
            value={adminId}
            onChange={(event) => setAdminId(event.target.value)}
            placeholder="e.g. Mess, Hostel, General"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

        <div className="row">
          <button className="button" type="submit">
            Login
          </button>
          <Link className="nav-link" to="/">
            Back to Home
          </Link>
        </div>
      </form>
    </main>
  )
}

export default Login
