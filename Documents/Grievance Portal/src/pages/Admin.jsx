import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase.js'

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
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  const adminScope = localStorage.getItem('adminScope') || 'all'
  const isScoped = adminScope !== 'all'

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
    if (isScoped) {
      setCategoryFilter(adminScope)
    }
  }, [adminScope, isScoped])

  const filtered = useMemo(() => {
    const scopeFiltered = isScoped
      ? grievances.filter((item) => item.category === adminScope)
      : grievances

    if (categoryFilter === 'All' || isScoped) {
      return scopeFiltered
    }

    return scopeFiltered.filter((item) => item.category === categoryFilter)
  }, [adminScope, categoryFilter, grievances, isScoped])

  const handleLogout = () => {
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('adminScope')
    localStorage.removeItem('adminId')
    navigate('/login', { replace: true })
  }

  if (!isAdmin) {
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
      </main>

      <div className="fixed bottom-0 left-0 w-full h-1 bg-primary" />
    </div>
  )
}

export default Admin
