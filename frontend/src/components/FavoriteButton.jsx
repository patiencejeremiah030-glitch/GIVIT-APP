import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function FavoriteButton({
  itemId,
  initial = false,
  className = '',
  onToggled,
}) {
  const { isAuthenticated } = useAuth()
  const [favorited, setFavorited] = useState(initial)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setFavorited(initial)
  }, [initial])

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className={`favorite-btn favorite-btn-guest ${className}`}
        title="Log in to save items"
        onClick={(e) => e.stopPropagation()}
      >
        <Heart size={20} />
      </Link>
    )
  }

  const toggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      if (favorited) {
        await api.delete(`items/${itemId}/favorite/`)
        setFavorited(false)
        onToggled?.(false)
      } else {
        await api.post(`items/${itemId}/favorite/`)
        setFavorited(true)
        onToggled?.(true)
      }
    } catch {
      /* keep previous state */
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className={`favorite-btn ${favorited ? 'favorite-btn-active' : ''} ${className}`}
      aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
      aria-pressed={favorited}
      disabled={busy}
      onClick={toggle}
    >
      <Heart size={20} fill={favorited ? 'currentColor' : 'none'} />
    </button>
  )
}
