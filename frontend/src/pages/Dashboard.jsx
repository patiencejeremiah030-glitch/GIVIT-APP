import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('users/dashboard/')
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load dashboard.'))
  }, [])

  if (error) return <p className="error">{error}</p>
  if (!data) return <p className="loading">Loading dashboard…</p>

  return (
    <div>
      <h1>Welcome, {data.user.username}</h1>
      <p className="subtitle">{data.user.email} · {data.user.location || 'No location set'}</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>My items</h3>
          <p className="stat-number">{data.items.total}</p>
          <ul>
            <li>{data.items.available} available</li>
            <li>{data.items.requested} requested</li>
            <li>{data.items.given} given away</li>
          </ul>
          <Link to="/my-items">View all</Link>
        </div>
        <div className="stat-card">
          <h3>Requests</h3>
          <p className="stat-number">{data.requests.incoming_pending}</p>
          <p>pending on your items</p>
          <ul>
            <li>{data.requests.my_pending} you sent (pending)</li>
            <li>{data.requests.my_accepted} accepted</li>
          </ul>
        </div>
        <div className="stat-card">
          <h3>Messages</h3>
          <p className="stat-number">{data.messages.unread}</p>
          <p>unread messages</p>
          <p>{data.messages.conversations} conversations</p>
        </div>
      </div>

      <Link to="/post" className="btn btn-primary">
        Post a new item
      </Link>
    </div>
  )
}
