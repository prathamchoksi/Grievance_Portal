import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase.js'
import { ADMIN_IDS, adminIdToEmail, isAllowedAdminId, normalizeAdminId } from '../admins.js'

function Login() {
  const [adminId, setAdminId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const normalizedId = normalizeAdminId(adminId)
    if (!isAllowedAdminId(normalizedId)) {
      setError('Unknown admin ID')
      return
    }

    const email = adminIdToEmail(normalizedId)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      localStorage.setItem('isAdmin', 'true')
      localStorage.setItem('adminId', normalizedId)
      navigate('/admin')
    } catch (authError) {
      const code = authError?.code || ''
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setError('Invalid password')
        return
      }
      if (code === 'auth/user-not-found') {
        setError('Admin account not found in Firebase Auth')
        return
      }

      setError('Login failed. Please try again.')
    }
  }

  return (
    <main className="page">
      <h1 className="title">Admin Login</h1>
      <p className="subtitle">Enter admin ID and password to access the dashboard.</p>

      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="adminId">Admin ID</label>
          <select
            id="adminId"
            value={adminId}
            onChange={(event) => setAdminId(event.target.value)}
            required
          >
            <option value="" disabled>
              Select admin category
            </option>
            {ADMIN_IDS.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
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
          <Link className="button" to="/">
            Back to Home
          </Link>
        </div>
      </form>
    </main>
  )
}

export default Login
