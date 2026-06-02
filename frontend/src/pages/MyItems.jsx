import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { getResults } from '../api/errors'
import ItemCard from '../components/ItemCard'

export default function MyItems() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('items/my/')
      .then((res) => setItems(getResults(res.data)))
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
        <div className="item-grid my-items-grid">
          {items.map((item) => (
            <div key={item.id} className="my-item-wrap">
              <ItemCard item={item} />
              <Link to={`/items/${item.id}/edit`} className="btn btn-ghost btn-sm">
                Edit listing
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
