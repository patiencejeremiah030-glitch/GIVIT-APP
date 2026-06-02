import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Menu,
  X,
  PlusCircle,
  LayoutDashboard,
  Package,
  LogOut,
  Compass,
  Inbox,
  MessageCircle,
  User,
  Heart,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }) =>
  isActive ? 'mobile-nav-item active' : 'mobile-nav-item'

function NavItem({ to, icon: Icon, label, onClick, end, className = '' }) {
  return (
    <NavLink to={to} className={navLinkClass} end={end} onClick={onClick}>
      {Icon && <Icon size={20} strokeWidth={2} />}
      {label}
    </NavLink>
  )
}

function NavSection({ title, children }) {
  return (
    <div className="mobile-nav-section">
      {title && <p className="mobile-nav-heading">{title}</p>}
      {children}
    </div>
  )
}

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef(null)

  const close = () => setOpen(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024 && !isAuthenticated) setOpen(false)
      if (window.innerWidth >= 1200 && isAuthenticated) setOpen(false)
      setMoreOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [isAuthenticated])

  useEffect(() => {
    if (!moreOpen) return
    const onDocClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [moreOpen])

  const guestPrimary = (
    <>
      <NavItem to="/" icon={Compass} label="Browse" onClick={close} end />
      <NavItem to="/post" icon={PlusCircle} label="Post item" onClick={close} />
    </>
  )

  const guestOther = (
    <>
      <NavItem to="/login" label="Log in" onClick={close} />
      <NavLink to="/register" className="mobile-nav-item mobile-nav-cta" onClick={close}>
        Sign up free
      </NavLink>
    </>
  )

  const authPrimary = (
    <>
      <NavItem to="/" icon={Compass} label="Browse" onClick={close} end />
      <NavLink to="/post" className="mobile-nav-item mobile-nav-cta" onClick={close}>
        <PlusCircle size={20} strokeWidth={2} />
        Post item
      </NavLink>
      <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={close} />
      <NavItem to="/messages" icon={MessageCircle} label="Messages" onClick={close} />
    </>
  )

  const authOther = (
    <>
      <NavItem to="/my-items" icon={Package} label="My items" onClick={close} />
      <NavItem to="/favorites" icon={Heart} label="Saved" onClick={close} />
      <NavItem to="/requests" icon={Inbox} label="Requests" onClick={close} />
      <NavItem to="/profile" icon={User} label="Profile" onClick={close} />
      <button
        type="button"
        className="mobile-nav-item mobile-nav-logout"
        onClick={() => {
          logout()
          close()
          setMoreOpen(false)
        }}
      >
        <LogOut size={20} strokeWidth={2} />
        Log out
      </button>
    </>
  )

  const mobileMenuContent = isAuthenticated ? (
    <>
      <NavSection title="Explore">{authPrimary}</NavSection>
      <NavSection title="Other">{authOther}</NavSection>
    </>
  ) : (
    <>
      <NavSection title="Explore">{guestPrimary}</NavSection>
      <NavSection title="Account">{guestOther}</NavSection>
    </>
  )

  const desktopNav = isAuthenticated ? (
    <>
      <div className="nav-group nav-group-primary">{authPrimary}</div>
      <div className="nav-group nav-group-other" ref={moreRef}>
        <button
          type="button"
          className={`mobile-nav-item nav-more-toggle ${moreOpen ? 'active' : ''}`}
          aria-expanded={moreOpen}
          aria-haspopup="true"
          onClick={() => setMoreOpen((v) => !v)}
        >
          <MoreHorizontal size={20} strokeWidth={2} />
          Other
          <ChevronDown size={16} className={`nav-chevron ${moreOpen ? 'open' : ''}`} />
        </button>
        {moreOpen && (
          <div className="nav-dropdown" role="menu">
            {authOther}
          </div>
        )}
      </div>
    </>
  ) : (
    <>
      <div className="nav-group nav-group-primary">{guestPrimary}</div>
      <div className="nav-group nav-group-other">{guestOther}</div>
    </>
  )

  const mobileMenu = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="nav-overlay"
            className="nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.nav
            key="mobile-nav-panel"
            id="mobile-nav-panel"
            className="mobile-nav-panel"
            aria-label="Mobile navigation"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
          >
            <div className="mobile-nav-panel-header">
              <p className="mobile-nav-heading">Menu</p>
              <button
                type="button"
                className="nav-toggle nav-toggle-close"
                aria-label="Close menu"
                onClick={close}
              >
                <X size={22} />
              </button>
            </div>
            {mobileMenuContent}
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <header className={`navbar ${isAuthenticated ? 'navbar-auth' : ''}`}>
        <div className="navbar-inner">
          <Link to="/" className="logo" onClick={close}>
            <span className="logo-mark">G</span>
            <span className="logo-text">GIVIT</span>
          </Link>

          <nav className="desktop-nav" aria-label="Main navigation">
            {desktopNav}
          </nav>

          <button
            type="button"
            className="nav-toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {createPortal(mobileMenu, document.body)}
    </>
  )
}
