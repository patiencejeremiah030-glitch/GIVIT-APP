import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PostItem from './pages/PostItem'
import ItemDetail from './pages/ItemDetail'
import MyItems from './pages/MyItems'
import Requests from './pages/Requests'
import Messages from './pages/Messages'
import Profile from './pages/Profile'
import EditItem from './pages/EditItem'
import Favorites from './pages/Favorites'
import GoogleAnalytics from './components/GoogleAnalytics'

export default function App() {
  const location = useLocation()

  return (
    <div className="app-shell">
      <GoogleAnalytics />
      <Navbar />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Home />
                </PageTransition>
              }
            />
            <Route
              path="/login"
              element={
                <PageTransition>
                  <Login />
                </PageTransition>
              }
            />
            <Route
              path="/register"
              element={
                <PageTransition>
                  <Register />
                </PageTransition>
              }
            />
            <Route
              path="/items/:id"
              element={
                <PageTransition>
                  <ItemDetail />
                </PageTransition>
              }
            />
            <Route element={<ProtectedRoute />}>
              <Route
                path="/dashboard"
                element={
                  <PageTransition>
                    <Dashboard />
                  </PageTransition>
                }
              />
              <Route
                path="/post"
                element={
                  <PageTransition>
                    <PostItem />
                  </PageTransition>
                }
              />
              <Route
                path="/my-items"
                element={
                  <PageTransition>
                    <MyItems />
                  </PageTransition>
                }
              />
              <Route
                path="/favorites"
                element={
                  <PageTransition>
                    <Favorites />
                  </PageTransition>
                }
              />
              <Route
                path="/requests"
                element={
                  <PageTransition>
                    <Requests />
                  </PageTransition>
                }
              />
              <Route
                path="/messages"
                element={
                  <PageTransition>
                    <Messages />
                  </PageTransition>
                }
              />
              <Route
                path="/messages/:conversationId"
                element={
                  <PageTransition>
                    <Messages />
                  </PageTransition>
                }
              />
              <Route
                path="/profile"
                element={
                  <PageTransition>
                    <Profile />
                  </PageTransition>
                }
              />
              <Route
                path="/items/:id/edit"
                element={
                  <PageTransition>
                    <EditItem />
                  </PageTransition>
                }
              />
            </Route>
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
