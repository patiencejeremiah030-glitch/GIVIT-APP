import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        GIVIT
      </Link>
      <nav>
        <NavLink to="/">Browse</NavLink>
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/post">Post item</NavLink>
            <NavLink to="/my-items">My items</NavLink>
            <span className="user-pill">{user?.username || user?.email}</span>
            <button type="button" className="btn btn-ghost" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/register" className="btn btn-primary">
              Sign up
            </NavLink>
          </>
        )}
      </nav>
    </header>
  )
}
