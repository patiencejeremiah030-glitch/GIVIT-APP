import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    location: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      const errors = err.response?.data?.errors || err.response?.data
      setError(
        typeof errors === 'string'
          ? errors
          : JSON.stringify(errors) || 'Registration failed.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Username
          <input name="username" value={form.username} onChange={handleChange} required />
        </label>
        <label>
          Location
          <input name="location" value={form.location} onChange={handleChange} />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Confirm password
          <input
            name="password_confirm"
            type="password"
            value={form.password_confirm}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}
