import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { parseApiError } from '../api/errors'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(parseApiError(err, 'Login failed. Check your email and password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="auth-card"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <motion.button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Logging in…' : 'Log in'}
        </motion.button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        No account? <Link to="/register">Sign up</Link>
      </p>
    </motion.div>
  )
}
