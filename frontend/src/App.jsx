import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PostItem from './pages/PostItem'
import ItemDetail from './pages/ItemDetail'
import MyItems from './pages/MyItems'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/post" element={<PostItem />} />
            <Route path="/my-items" element={<MyItems />} />
          </Route>
        </Routes>
      </main>
    </>
  )
}
