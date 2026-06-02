import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Send } from 'lucide-react'
import api from '../api/client'
import { getResults, parseApiError } from '../api/errors'
import { useAuth } from '../context/AuthContext'

export default function Messages() {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const activeConvo = conversations.find(
    (c) => String(c.id) === String(conversationId),
  )

  const loadConversations = () => {
    return api.get('messages/conversations/').then((res) => {
      setConversations(getResults(res.data))
    })
  }

  const loadMessages = (id) => {
    return api.get(`messages/conversations/${id}/messages/`).then((res) => {
      setMessages(getResults(res.data))
      api.post(`messages/conversations/${id}/read/`).catch(() => {})
    })
  }

  useEffect(() => {
    loadConversations()
      .catch(() => setError('Could not load conversations.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId).catch(() => setError('Could not load messages.'))
    } else {
      setMessages([])
    }
  }, [conversationId])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!body.trim() || !conversationId) return
    try {
      await api.post(`messages/conversations/${conversationId}/messages/`, {
        body: body.trim(),
      })
      setBody('')
      await loadMessages(conversationId)
      await loadConversations()
    } catch (err) {
      alert(parseApiError(err))
    }
  }

  const otherLabel = (convo) => {
    if (convo.other_participant?.username) return convo.other_participant.username
    const names = convo.participant_usernames || []
    return names.find((n) => n !== user?.username) || 'Chat'
  }

  return (
    <div className="messages-layout">
      <aside className="messages-sidebar">
        <h1>Messages</h1>
        {loading ? (
          <p className="loading">Loading…</p>
        ) : conversations.length === 0 ? (
          <p className="empty-state">No conversations yet. Message an item owner from an item page.</p>
        ) : (
          <ul className="conversation-list">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/messages/${c.id}`}
                  className={`conversation-item ${String(c.id) === conversationId ? 'active' : ''}`}
                >
                  <strong>{otherLabel(c)}</strong>
                  {c.item_title && <span className="meta">{c.item_title}</span>}
                  {c.last_message && (
                    <span className="preview">{c.last_message.body}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="messages-thread">
        {!conversationId ? (
          <p className="empty-state">Select a conversation to start chatting.</p>
        ) : (
          <>
            <div className="thread-header">
              <h2>{otherLabel(activeConvo || {})}</h2>
              {activeConvo?.item && (
                <Link to={`/items/${activeConvo.item}`} className="meta">
                  View item: {activeConvo.item_title}
                </Link>
              )}
            </div>
            {error && <p className="error">{error}</p>}
            <div className="message-bubbles">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`bubble ${m.sender === user?.id ? 'bubble-mine' : 'bubble-theirs'}`}
                >
                  <span className="bubble-user">{m.sender_username}</span>
                  <p>{m.body}</p>
                </div>
              ))}
            </div>
            <form className="message-compose" onSubmit={sendMessage}>
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type a message…"
              />
              <button type="submit" className="btn btn-primary">
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
