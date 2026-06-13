import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Image, Paperclip, Search, Send, Smile } from 'lucide-react'
import api from '../api/client'
import { getResults, parseApiError } from '../api/errors'
import { useAuth } from '../context/AuthContext'

function getInitials(name = '') {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  )
}

function formatDayLabel(iso) {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, yesterday)) return 'Yesterday'
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function formatListTime(iso) {
  const date = new Date(iso)
  const now = new Date()
  if (isSameDay(date, now)) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  }
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'short' })
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatMessageTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function groupMessagesByDay(messages) {
  const groups = []
  messages.forEach((message) => {
    const label = formatDayLabel(message.created_at)
    const last = groups[groups.length - 1]
    if (last && last.label === label) {
      last.messages.push(message)
    } else {
      groups.push({ label, messages: [message] })
    }
  })
  return groups
}

function ChatAvatar({ person, size = 40 }) {
  const name = person?.username || '?'
  const style = { width: size, height: size, fontSize: size * 0.36 }

  if (person?.avatar) {
    return (
      <img
        src={person.avatar}
        alt=""
        className="messenger-avatar messenger-avatar-img"
        style={style}
      />
    )
  }

  return (
    <span className="messenger-avatar" style={style} aria-hidden="true">
      {getInitials(name)}
    </span>
  )
}

export default function Messages() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [body, setBody] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const threadRef = useRef(null)
  const inputRef = useRef(null)

  const activeConvo = conversations.find(
    (c) => String(c.id) === String(conversationId),
  )

  const otherPerson = (convo) => {
    if (convo?.other_participant) return convo.other_participant
    const names = convo?.participant_usernames || []
    const username = names.find((n) => n !== user?.username) || 'Chat'
    return { username }
  }

  const loadConversations = useCallback(() => {
    return api.get('messages/conversations/').then((res) => {
      setConversations(getResults(res.data))
    })
  }, [])

  const loadMessages = useCallback((id) => {
    return api.get(`messages/conversations/${id}/messages/`).then((res) => {
      setMessages(getResults(res.data))
      api.post(`messages/conversations/${id}/read/`).catch(() => {})
    })
  }, [])

  useEffect(() => {
    loadConversations()
      .catch(() => setError('Could not load conversations.'))
      .finally(() => setLoading(false))
  }, [loadConversations])

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      return undefined
    }

    loadMessages(conversationId).catch(() => setError('Could not load messages.'))

    const interval = setInterval(() => {
      loadMessages(conversationId).catch(() => {})
      loadConversations().catch(() => {})
    }, 5000)

    return () => clearInterval(interval)
  }, [conversationId, loadMessages, loadConversations])

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [messages, conversationId])

  useEffect(() => {
    if (conversationId) {
      inputRef.current?.focus()
    }
  }, [conversationId])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!body.trim() || !conversationId || sending) return

    const text = body.trim()
    setBody('')
    setSending(true)

    try {
      await api.post(`messages/conversations/${conversationId}/messages/`, {
        body: text,
      })
      await loadMessages(conversationId)
      await loadConversations()
    } catch (err) {
      setBody(text)
      setError(parseApiError(err, 'Could not send message.'))
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e)
    }
  }

  const filteredConversations = conversations.filter((c) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    const person = otherPerson(c)
    const haystack = [
      person.username,
      c.item_title,
      c.last_message?.body,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })

  const messageGroups = groupMessagesByDay(messages)
  const activeOther = otherPerson(activeConvo || {})

  return (
    <div className={`messenger-page ${conversationId ? 'has-chat' : ''}`}>
      <aside className="messenger-sidebar">
        <header className="messenger-sidebar-header">
          <h1>Chats</h1>
          <div className="messenger-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Messenger"
              aria-label="Search conversations"
            />
          </div>
        </header>

        <div className="messenger-conversation-scroll">
          {loading ? (
            <p className="messenger-empty">Loading chats…</p>
          ) : filteredConversations.length === 0 ? (
            <p className="messenger-empty">
              {conversations.length === 0
                ? 'No conversations yet. Message an item owner from an item page.'
                : 'No chats match your search.'}
            </p>
          ) : (
            <ul className="messenger-conversation-list">
              {filteredConversations.map((c) => {
                const person = otherPerson(c)
                const isActive = String(c.id) === String(conversationId)
                const preview = c.last_message?.body || 'Start a conversation'
                const previewTime = c.last_message?.created_at || c.updated_at

                return (
                  <li key={c.id}>
                    <Link
                      to={`/messages/${c.id}`}
                      className={`messenger-conversation-item ${isActive ? 'active' : ''}`}
                    >
                      <ChatAvatar person={person} size={56} />
                      <div className="messenger-conversation-body">
                        <div className="messenger-conversation-top">
                          <strong>{person.username}</strong>
                          {previewTime && (
                            <time dateTime={previewTime}>
                              {formatListTime(previewTime)}
                            </time>
                          )}
                        </div>
                        <div className="messenger-conversation-bottom">
                          <span className="messenger-preview">{preview}</span>
                          {c.unread_count > 0 && (
                            <span className="messenger-unread-badge">
                              {c.unread_count > 99 ? '99+' : c.unread_count}
                            </span>
                          )}
                        </div>
                        {c.item_title && (
                          <span className="messenger-item-tag">{c.item_title}</span>
                        )}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>

      <section className="messenger-chat">
        {!conversationId ? (
          <div className="messenger-placeholder">
            <div className="messenger-placeholder-icon">
              <Send size={36} />
            </div>
            <h2>Your messages</h2>
            <p>Send private photos and messages to people on GIVIT.</p>
          </div>
        ) : (
          <>
            <header className="messenger-chat-header">
              <button
                type="button"
                className="messenger-back-btn"
                aria-label="Back to chats"
                onClick={() => navigate('/messages')}
              >
                <ArrowLeft size={22} />
              </button>
              <ChatAvatar person={activeOther} size={40} />
              <div className="messenger-chat-header-info">
                <strong>{activeOther.username}</strong>
                {activeConvo?.item && (
                  <Link to={`/items/${activeConvo.item}`} className="messenger-item-link">
                    Re: {activeConvo.item_title}
                  </Link>
                )}
              </div>
            </header>

            {error && (
              <p className="messenger-error" role="alert">
                {error}
              </p>
            )}

            <div className="messenger-thread" ref={threadRef}>
              {messages.length === 0 ? (
                <p className="messenger-thread-empty">
                  Say hi to {activeOther.username} — your messages are private.
                </p>
              ) : (
                messageGroups.map((group) => (
                  <div key={group.label} className="messenger-day-group">
                    <div className="messenger-day-divider">
                      <span>{group.label}</span>
                    </div>
                    {group.messages.map((m) => {
                      const isMine = m.sender === user?.id
                      return (
                        <div
                          key={m.id}
                          className={`messenger-row ${isMine ? 'mine' : 'theirs'}`}
                        >
                          {!isMine && (
                            <ChatAvatar person={{ username: m.sender_username }} size={28} />
                          )}
                          <div className={`messenger-bubble ${isMine ? 'mine' : 'theirs'}`}>
                            <p>{m.body}</p>
                            <time dateTime={m.created_at}>
                              {formatMessageTime(m.created_at)}
                            </time>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            <form className="messenger-compose" onSubmit={sendMessage}>
              <button type="button" className="messenger-compose-icon" aria-label="Add emoji">
                <Smile size={22} />
              </button>
              <button type="button" className="messenger-compose-icon" aria-label="Attach file">
                <Paperclip size={22} />
              </button>
              <button type="button" className="messenger-compose-icon" aria-label="Add photo">
                <Image size={22} />
              </button>
              <div className="messenger-input-wrap">
                <input
                  ref={inputRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${activeOther.username}…`}
                  aria-label="Message"
                  disabled={sending}
                />
              </div>
              <button
                type="submit"
                className="messenger-send-btn"
                disabled={!body.trim() || sending}
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
