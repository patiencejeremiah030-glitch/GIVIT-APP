import { useEffect, useState } from 'react'
import api from '../api/client'
import { parseApiError } from '../api/errors'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({
    username: '',
    phone: '',
    location: '',
    bio: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
      })
    }
  }, [user])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.patch('users/me/', form)
      await refreshUser()
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
      <h1>My profile</h1>
      <p className="subtitle">Email: {user?.email}</p>
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <label>
          Username
          <input name="username" value={form.username} onChange={handleChange} required />
        </label>
        <label>
          Phone
          <input name="phone" value={form.phone} onChange={handleChange} />
        </label>
        <label>
          Location
          <input name="location" value={form.location} onChange={handleChange} />
        </label>
        <label>
          Bio
          <textarea name="bio" value={form.bio} onChange={handleChange} />
        </label>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
