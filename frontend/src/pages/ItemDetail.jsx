import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MessageCircle, Flag, Phone } from 'lucide-react'
import api from '../api/client'
import { parseApiError } from '../api/errors'
import { useAuth } from '../context/AuthContext'
import FavoriteButton from '../components/FavoriteButton'

function contactHref(contact) {
  const value = contact.trim()
  if (value.includes('@')) return `mailto:${value}`
  const digits = value.replace(/\D/g, '')
  if (digits.length >= 7) return `tel:${digits}`
  return undefined
}

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [item, setItem] = useState(null)
  const [message, setMessage] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [reportReason, setReportReason] = useState('')
  const [showReport, setShowReport] = useState(false)
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
      setError(parseApiError(err, 'Could not send request.'))
    }
  }

  const startChat = async () => {
    try {
      const { data } = await api.post('messages/conversations/start/', {
        recipient_id: item.owner_id,
        item_id: item.id,
        body: chatMessage.trim(),
      })
      navigate(`/messages/${data.id}`)
    } catch (err) {
      alert(parseApiError(err))
    }
  }

  const submitReport = async () => {
    if (!reportReason.trim()) return
    try {
      await api.post('reports/', {
        report_type: 'item',
        object_id: item.id,
        reason: reportReason.trim(),
      })
      setShowReport(false)
      setReportReason('')
      setSuccess('Report submitted. Thank you.')
    } catch (err) {
      alert(parseApiError(err))
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
        <div className="item-detail-title-row">
          <span className="badge">{item.listing_type}</span>
          <h1>{item.title}</h1>
          {!isOwner && (
            <FavoriteButton
              itemId={item.id}
              initial={item.is_favorited}
              className="favorite-btn-detail"
            />
          )}
        </div>
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
        {item.contact && (
          <p className="item-contact">
            <Phone size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            <strong>Contact:</strong>{' '}
            {contactHref(item.contact) ? (
              <a href={contactHref(item.contact)}>{item.contact}</a>
            ) : (
              item.contact
            )}
          </p>
        )}
        {item.listing_type === 'sale' && item.price && (
          <p>
            <strong>Price:</strong> ${item.price}
          </p>
        )}

        {isOwner && (
          <Link to={`/items/${item.id}/edit`} className="btn btn-primary">
            Edit listing
          </Link>
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
          </section>
        )}

        {isAuthenticated && !isOwner && (
          <section className="request-box">
            <h3>
              <MessageCircle size={18} style={{ verticalAlign: 'middle' }} /> Message owner
            </h3>
            <textarea
              placeholder="Say hello (optional)"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />
            <button type="button" className="btn btn-ghost" onClick={startChat}>
              Open chat
            </button>
          </section>
        )}

        {isAuthenticated && !isOwner && (
          <section className="request-box">
            {!showReport ? (
              <button type="button" className="btn btn-ghost" onClick={() => setShowReport(true)}>
                <Flag size={16} /> Report listing
              </button>
            ) : (
              <>
                <textarea
                  placeholder="Why are you reporting this?"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <button type="button" className="btn btn-primary" onClick={submitReport}>
                  Submit report
                </button>
              </>
            )}
          </section>
        )}

        {!isAuthenticated && (
          <p>
            <Link to="/login">Log in</Link> to request or message about this item.
          </p>
        )}

        {success && <p className="success">{success}</p>}
        {error && item && <p className="error">{error}</p>}
      </div>
    </article>
  )
}
