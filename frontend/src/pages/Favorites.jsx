import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import api from '../api/client'
import { getResults } from '../api/errors'
import ItemCard from '../components/ItemCard'

export default function Favorites() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    api
      .get('items/favorites/')
      .then((res) => setItems(getResults(res.data)))
      .catch(() => setError('Could not load favorites.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const onFavoriteChange = (itemId, favorited) => {
    if (!favorited) {
      setItems((prev) => prev.filter((i) => i.id !== itemId))
    }
  }

  return (
    <div>
      <h1>
        <Heart size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Saved items
      </h1>
      <p className="subtitle">Items you have favorited.</p>
      {error && <p className="error-banner">{error}</p>}
      {loading ? (
        <p className="loading">Loading…</p>
      ) : items.length === 0 ? (
        <p className="empty-state">
          No saved items yet. Tap the heart on a listing to save it here.{' '}
          <Link to="/">Browse items</Link>
        </p>
      ) : (
        <div className="item-grid">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onFavoriteChange={onFavoriteChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
