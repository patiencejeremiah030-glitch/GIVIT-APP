import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Inbox, MessageCircle, PlusCircle } from 'lucide-react'
import api from '../api/client'

const cardMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('users/dashboard/')
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load dashboard.'))
  }, [])

  if (error) return <p className="error-banner">{error}</p>
  if (!data) return <div className="skeleton-grid"><div className="skeleton-card" /></div>

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
      >
        Welcome back, {data.user.username}
      </motion.h1>
      <p className="subtitle">{data.user.email}</p>

      <div className="stats-grid">
        <motion.div
          className="stat-card"
          {...cardMotion}
          transition={{ delay: 0.1 }}
        >
          <Package size={28} color="var(--primary)" />
          <h3>My items</h3>
          <p className="stat-number">{data.items.total}</p>
          <ul>
            <li>{data.items.available} available</li>
            <li>{data.items.requested} requested</li>
            <li>{data.items.given} given</li>
          </ul>
          <Link to="/my-items">View all →</Link>
        </motion.div>

        <motion.div
          className="stat-card"
          {...cardMotion}
          transition={{ delay: 0.2 }}
        >
          <Inbox size={28} color="var(--primary)" />
          <h3>Requests</h3>
          <p className="stat-number">{data.requests.incoming_pending}</p>
          <p>pending on your items</p>
          <Link to="/requests">Manage requests →</Link>
        </motion.div>

        <motion.div
          className="stat-card"
          {...cardMotion}
          transition={{ delay: 0.3 }}
        >
          <MessageCircle size={28} color="var(--primary)" />
          <h3>Messages</h3>
          <p className="stat-number">{data.messages.unread}</p>
          <p>unread · {data.messages.conversations} chats</p>
          <Link to="/messages">Open inbox →</Link>
        </motion.div>
      </div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link to="/post" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={20} />
          Post a new item
        </Link>
      </motion.div>
    </div>
  )
}
