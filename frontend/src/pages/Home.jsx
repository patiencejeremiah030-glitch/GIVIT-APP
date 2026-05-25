import { useEffect, useState } from 'react'
import api from '../api/client'
import ItemCard from '../components/ItemCard'

export default function Home() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [freeOnly, setFreeOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('items/categories/').then((res) => setCategories(res.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (category) params.category = category
    if (freeOnly) params.is_free = true

    api
      .get('items/', { params })
      .then((res) => setItems(res.data.results || res.data))
      .catch(() => setError('Could not load items. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [search, category, freeOnly])

  return (
    <div>
      <section className="hero">
        <h1>Give. Share. Trade.</h1>
        <p>Find free items, exchanges, and affordable deals in your community.</p>
      </section>

      <section className="filters">
        <input
          type="search"
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={freeOnly}
            onChange={(e) => setFreeOnly(e.target.checked)}
          />
          Free only
        </label>
      </section>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="loading">Loading items…</p>
      ) : (
        <div className="item-grid">
          {items.length === 0 ? (
            <p>No items found. Be the first to post one!</p>
          ) : (
            items.map((item) => <ItemCard key={item.id} item={item} />)
          )}
        </div>
      )}
    </div>
  )
}
