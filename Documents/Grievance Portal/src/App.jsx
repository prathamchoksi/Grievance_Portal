import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Categories from './pages/Categories.jsx'
import Submit from './pages/Submit.jsx'
import Login from './pages/Login.jsx'
import Admin from './pages/Admin.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/submit/:category" element={<Submit />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
