import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from 'firebase/auth'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { auth, db } from '../firebase.js'
import { adminIdToScope, emailToAdminId } from '../admins.js'

const categories = [
  'All',
  'Welfare Council',
  'Academic Council',
  'Cultural Council',
  'Sports Council',
  'PDC Council',
  'IRP Council',
  'General Complaints',
]

function formatDate(timestamp) {
  if (!timestamp) {
    return '-'
  }

  const rawDate = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
  if (Number.isNaN(rawDate.getTime())) {
    return '-'
  }

  return rawDate.toLocaleString()
}

function Admin() {
  const navigate = useNavigate()
  const [grievances, setGrievances] = useState([])
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [passwordCurrent, setPasswordCurrent] = useState('')
  const [passwordNext, setPasswordNext] = useState('')
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' })

  const adminId = emailToAdminId(firebaseUser?.email)
  const adminScope = adminId ? adminIdToScope(adminId) : 'all'
  const isScoped = adminScope !== 'all'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user)
      setAuthReady(true)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchGrievances = async () => {
      const grievancesQuery = query(
        collection(db, 'grievances'),
        orderBy('timestamp', 'desc'),
      )

      const snapshot = await getDocs(grievancesQuery)
      const rows = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setGrievances(rows)
      setLoading(false)
    }

    fetchGrievances()
  }, [])

  useEffect(() => {
    setCategoryFilter(isScoped ? adminScope : 'All')
  }, [adminScope, isScoped])

  useEffect(() => {
    if (authReady && firebaseUser && !adminId) {
      handleLogout()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminId, authReady, firebaseUser])

  const filtered = useMemo(() => {
    const scopeFiltered = isScoped
      ? grievances.filter((item) => item.category === adminScope)
      : grievances

    if (categoryFilter === 'All' || isScoped) {
      return scopeFiltered
    }

    return scopeFiltered.filter((item) => item.category === categoryFilter)
  }, [adminScope, categoryFilter, grievances, isScoped])

  const handleLogout = async () => {
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('adminScope')
    localStorage.removeItem('adminId')
    await signOut(auth).catch(() => {})
    navigate('/login', { replace: true })
  }

  const handleChangePassword = async (event) => {
    event.preventDefault()
    setPasswordStatus({ type: '', message: '' })

    if (!firebaseUser?.email) {
      setPasswordStatus({ type: 'error', message: 'Not signed in.' })
      return
    }

    if (!passwordCurrent || !passwordNext) {
      setPasswordStatus({ type: 'error', message: 'Enter current and new password.' })
      return
    }

    try {
      const credential = EmailAuthProvider.credential(firebaseUser.email, passwordCurrent)
      await reauthenticateWithCredential(firebaseUser, credential)
      await updatePassword(firebaseUser, passwordNext)
      setPasswordCurrent('')
      setPasswordNext('')
      setPasswordStatus({ type: 'success', message: 'Password updated successfully.' })
    } catch (error) {
      const code = error?.code || ''
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setPasswordStatus({ type: 'error', message: 'Current password is incorrect.' })
        return
      }
      if (code === 'auth/weak-password') {
        setPasswordStatus({ type: 'error', message: 'New password is too weak.' })
        return
      }

      setPasswordStatus({ type: 'error', message: 'Failed to update password. Please try again.' })
    }
  }

  if (!authReady) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center">
        <span className="font-body-md text-body-md text-on-surface-variant">Loading...</span>
      </div>
    )
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />
  }

  if (!adminId) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="bg-surface text-on-surface">
      <header className="bg-white dark:bg-slate-950 w-full border-b border-slate-200 dark:border-slate-800 h-20 flex items-center">
        <nav className="flex justify-between items-center w-full max-w-[1280px] mx-auto px-8">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-50 uppercase tracking-widest tracking-tight">
            Grievance Portal
          </div>
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={handleLogout}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 font-label-md text-label-md active:scale-95 transition-transform uppercase tracking-wider"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-[1280px] mx-auto px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="font-display-lg text-display-lg text-primary tracking-tight mb-2">
              Admin Dashboard
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              Review and manage institutional grievances with precision and institutional clarity.
            </p>
          </div>

          <div className="w-full md:w-64">
            <label
              className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2 block"
              htmlFor="category-filter"
            >
              Filter Category
            </label>
            <select
              id="category-filter"
              className="w-full bg-white border border-outline-variant px-4 py-3 rounded-none focus:ring-0 focus:border-primary font-label-md text-label-md transition-all"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              disabled={isScoped}
            >
              {(isScoped ? [adminScope] : categories).map((item) => (
                <option key={item} value={item}>
                  {item === 'All' ? 'All Categories' : item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="px-8 py-6 font-label-sm text-label-sm text-on-surface-variant uppercase">
                    Name
                  </th>
                  <th className="px-8 py-6 font-label-sm text-label-sm text-on-surface-variant uppercase">
                    Category
                  </th>
                  <th className="px-8 py-6 font-label-sm text-label-sm text-on-surface-variant uppercase">
                    Description
                  </th>
                  <th className="px-8 py-6 font-label-sm text-label-sm text-on-surface-variant uppercase">
                    Photo
                  </th>
                  <th className="px-8 py-6 font-label-sm text-label-sm text-on-surface-variant uppercase text-right">
                    Timestamp
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline-variant">
                {loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-8 py-8 font-body-md text-body-md text-on-surface-variant"
                    >
                      Loading grievances...
                    </td>
                  </tr>
                )}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-8 py-8 font-body-md text-body-md text-on-surface-variant"
                    >
                      No grievances found.
                    </td>
                  </tr>
                )}

                {!loading &&
                  filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-container-lowest transition-colors duration-200"
                    >
                      <td className="px-8 py-6 font-label-md text-label-md text-primary">
                        {item.name || 'Anonymous'}
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-surface-container-high text-on-surface-variant px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm">
                          {item.category || '-'}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-body-md text-body-md text-on-surface-variant max-w-xs truncate">
                        {item.description}
                      </td>
                      <td className="px-8 py-6">
                        {item.photoUrl ? (
                          <a
                            className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1"
                            href={item.photoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                            View
                          </a>
                        ) : (
                          <span className="font-body-md text-body-md text-on-surface-variant">-</span>
                        )}
                      </td>
                      <td className="px-8 py-6 font-label-md text-label-md text-on-surface-variant text-right">
                        {formatDate(item.timestamp)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            Showing {filtered.length} of {filtered.length} results
          </span>
          <div className="flex gap-4">
            <button
              type="button"
              className="border border-outline-variant px-6 py-2 font-label-md text-label-md hover:border-primary transition-colors disabled:opacity-30"
              disabled
            >
              Previous
            </button>
            <button
              type="button"
              className="border border-outline-variant px-6 py-2 font-label-md text-label-md hover:border-primary transition-colors"
              disabled
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase">Signed in as</div>
            <div className="font-label-md text-label-md text-primary">{adminId}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPasswordStatus({ type: '', message: '' })
              setPasswordCurrent('')
              setPasswordNext('')
              setIsChangePasswordOpen(true)
            }}
            className="border border-outline-variant px-6 py-3 font-label-md text-label-md hover:border-primary transition-colors"
          >
            Change Password
          </button>
        </div>
      </main>

      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close change password dialog"
            onClick={() => setIsChangePasswordOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white border border-outline-variant p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary">Change Password</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Update your admin password.</p>
              </div>
              <button
                type="button"
                className="text-on-surface-variant hover:text-on-surface transition-colors"
                onClick={() => setIsChangePasswordOpen(false)}
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form className="mt-8 flex flex-col gap-5" onSubmit={handleChangePassword}>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase" htmlFor="pw-current">
                  Current Password
                </label>
                <input
                  id="pw-current"
                  className="bg-white border border-outline-variant px-4 py-3 rounded-none focus:ring-0 focus:border-primary font-label-md text-label-md"
                  type="password"
                  value={passwordCurrent}
                  onChange={(event) => setPasswordCurrent(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase" htmlFor="pw-next">
                  New Password
                </label>
                <input
                  id="pw-next"
                  className="bg-white border border-outline-variant px-4 py-3 rounded-none focus:ring-0 focus:border-primary font-label-md text-label-md"
                  type="password"
                  value={passwordNext}
                  onChange={(event) => setPasswordNext(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              {passwordStatus.message && (
                <p
                  className="font-body-md text-body-md"
                  style={{ color: passwordStatus.type === 'success' ? '#166534' : '#b91c1c' }}
                >
                  {passwordStatus.message}
                </p>
              )}

              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="border border-outline-variant px-6 py-3 font-label-md text-label-md hover:border-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="border border-outline-variant px-6 py-3 font-label-md text-label-md hover:border-primary transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full h-1 bg-primary" />
    </div>
  )
}

export default Admin
