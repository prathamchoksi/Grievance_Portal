import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

const Landing = lazy(() => import('./pages/Landing.jsx'))
const Categories = lazy(() => import('./pages/Categories.jsx'))
const Submit = lazy(() => import('./pages/Submit.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Admin = lazy(() => import('./pages/Admin.jsx'))

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/submit/:category" element={<Submit />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
