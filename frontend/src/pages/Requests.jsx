import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import api from '../api/client'
import { getResults, parseApiError } from '../api/errors'
import { useAuth } from '../context/AuthContext'

export default function Requests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState(null)

  const load = () => {
    setLoading(true)
    api
      .get('requests/')
      .then((res) => setRequests(getResults(res.data)))
      .catch(() => setError('Could not load requests.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const incoming = requests.filter((r) => r.owner_id === user?.id)
  const outgoing = requests.filter((r) => r.requester === user?.id)

  const accept = async (id) => {
    setActionId(id)
    try {
      await api.patch(`requests/${id}/accept/`)
      load()
    } catch (err) {
      alert(parseApiError(err))
    } finally {
      setActionId(null)
    }
  }

  const reject = async (id) => {
    setActionId(id)
    try {
      await api.patch(`requests/${id}/reject/`)
      load()
    } catch (err) {
      alert(parseApiError(err))
    } finally {
      setActionId(null)
    }
  }

  const cancel = async (id) => {
    if (!window.confirm('Cancel this request?')) return
    try {
      await api.delete(`requests/${id}/`)
      load()
    } catch (err) {
      alert(parseApiError(err))
    }
  }

  const RequestCard = ({ req, isIncoming }) => (
    <article className="request-card">
      <div>
        <h3>
          <Link to={`/items/${req.item}`}>
            {req.item_detail?.title || `Item #${req.item}`}
          </Link>
        </h3>
        <p className="meta">
          {isIncoming ? (
            <>From <strong>{req.requester_username}</strong></>
          ) : (
            <>Your request to owner</>
          )}
        </p>
        {req.message && <p className="request-message">{req.message}</p>}
        <span className={`status-pill status-${req.status}`}>{req.status}</span>
      </div>
      <div className="request-actions">
        {isIncoming && req.status === 'pending' && (
          <>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={actionId === req.id}
              onClick={() => accept(req.id)}
            >
              <Check size={16} /> Accept
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={actionId === req.id}
              onClick={() => reject(req.id)}
            >
              <X size={16} /> Reject
            </button>
          </>
        )}
        {!isIncoming && req.status === 'pending' && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => cancel(req.id)}>
            Cancel request
          </button>
        )}
      </div>
    </article>
  )

  return (
    <div>
      <h1>Item requests</h1>
      <p className="subtitle">Manage requests on your items or track requests you sent.</p>
      {error && <p className="error-banner">{error}</p>}
      {loading ? (
        <p className="loading">Loading…</p>
      ) : (
        <>
          <section className="request-group">
            <h2>Incoming ({incoming.length})</h2>
            {incoming.length === 0 ? (
              <p className="empty-state">No one has requested your items yet.</p>
            ) : (
              incoming.map((r) => <RequestCard key={r.id} req={r} isIncoming />)
            )}
          </section>
          <section className="request-group">
            <h2>Outgoing ({outgoing.length})</h2>
            {outgoing.length === 0 ? (
              <p className="empty-state">You have not requested any items yet.</p>
            ) : (
              outgoing.map((r) => <RequestCard key={r.id} req={r} isIncoming={false} />)
            )}
          </section>
        </>
      )}
    </div>
  )
}
