import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ItemDetail() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const [item, setItem] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    api
      .get(`items/${id}/`)
      .then((res) => setItem(res.data))
      .catch(() => setError('Item not found.'))
  }, [id])

  const requestItem = async () => {
    setError('')
    setSuccess('')
    try {
      await api.post('requests/', { item: item.id, message })
      setSuccess('Request sent! The owner will review it.')
    } catch (err) {
      setError(err.response?.data?.errors?.item?.[0] || 'Could not send request.')
    }
  }

  if (error && !item) return <p className="error">{error}</p>
  if (!item) return <p className="loading">Loading…</p>

  const isOwner = user?.id === item.owner_id

  return (
    <article className="item-detail">
      <div className="item-detail-images">
        {item.images?.length > 0 ? (
          item.images.map((img) => (
            <img key={img.id} src={img.image} alt={item.title} />
          ))
        ) : (
          <div className="placeholder large">No image</div>
        )}
      </div>
      <div>
        <span className="badge">{item.listing_type}</span>
        <h1>{item.title}</h1>
        <p className="meta">
          {item.category_name} · {item.condition} · {item.location}
        </p>
        <p>{item.description}</p>
        <p>
          <strong>Status:</strong> {item.status}
        </p>
        <p>
          <strong>Owner:</strong> {item.owner_username}
        </p>
        {item.listing_type === 'sale' && item.price && (
          <p>
            <strong>Price:</strong> ${item.price}
          </p>
        )}

        {isAuthenticated && !isOwner && item.status === 'available' && (
          <section className="request-box">
            <h3>Request this item</h3>
            <textarea
              placeholder="Message to owner (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="button" className="btn btn-primary" onClick={requestItem}>
              Send request
            </button>
            {success && <p className="success">{success}</p>}
            {error && <p className="error">{error}</p>}
          </section>
        )}

        {!isAuthenticated && (
          <p>
            <Link to="/login">Log in</Link> to request this item.
          </p>
        )}
      </div>
    </article>
  )
}
