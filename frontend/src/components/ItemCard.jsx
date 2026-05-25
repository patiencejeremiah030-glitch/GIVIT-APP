import { Link } from 'react-router-dom'

export default function ItemCard({ item }) {
  const badge =
    item.listing_type === 'free'
      ? 'Free'
      : item.listing_type === 'exchange'
        ? 'Exchange'
        : `$${item.price}`

  return (
    <Link to={`/items/${item.id}`} className="item-card">
      <div className="item-card-image">
        {item.primary_image ? (
          <img src={item.primary_image} alt={item.title} />
        ) : (
          <span className="placeholder">No image</span>
        )}
      </div>
      <div className="item-card-body">
        <span className="badge">{badge}</span>
        <h3>{item.title}</h3>
        <p className="meta">
          {item.category_name} · {item.location}
        </p>
        <p className="meta">@{item.owner_name}</p>
      </div>
    </Link>
  )
}
