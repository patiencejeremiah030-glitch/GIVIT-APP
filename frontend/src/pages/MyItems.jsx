import { useEffect, useState } from 'react'
import api from '../api/client'
import ItemCard from '../components/ItemCard'

export default function MyItems() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('items/my/')
      .then((res) => setItems(res.data.results || res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1>My items</h1>
      {loading ? (
        <p className="loading">Loading…</p>
      ) : items.length === 0 ? (
        <p>You have not posted any items yet.</p>
      ) : (
        <div className="item-grid">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
