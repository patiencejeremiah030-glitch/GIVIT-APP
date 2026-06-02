import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import FavoriteButton from './FavoriteButton'

export default function ItemCard({ item, accent, onFavoriteChange }) {
  const badge =
    item.listing_type === 'free'
      ? 'Free'
      : item.listing_type === 'exchange'
        ? 'Exchange'
        : `$${item.price}`

  const badgeClass =
    item.listing_type === 'free'
      ? 'badge-free'
      : item.listing_type === 'exchange'
        ? 'badge-exchange'
        : 'badge-sale'

  return (
    <motion.div
      className="item-card-wrap"
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <Link
        to={`/items/${item.id}`}
        className="item-card"
        style={{ '--card-accent': accent || 'var(--primary)' }}
      >
        <div className="item-card-image">
          {item.primary_image ? (
            <img src={item.primary_image} alt={item.title} loading="lazy" />
          ) : (
            <span className="placeholder">No photo</span>
          )}
          <FavoriteButton
            itemId={item.id}
            initial={item.is_favorited}
            className="favorite-btn-card"
            onToggled={(fav) => onFavoriteChange?.(item.id, fav)}
          />
          <span className={`badge ${badgeClass}`}>{badge}</span>
        </div>
        <div className="item-card-body">
          <h3>{item.title}</h3>
          <p className="meta location">
            <MapPin size={14} />
            {item.location}
          </p>
          <p className="meta owner">@{item.owner_name}</p>
        </div>
      </Link>
    </motion.div>
  )
}
