import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function PostItem() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    condition: 'good',
    location: '',
    listing_type: 'free',
    price: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('items/categories/').then((res) => setCategories(res.data))
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const payload = { ...form, category: Number(form.category) }
    if (form.listing_type !== 'sale') delete payload.price
    else payload.price = form.price

    try {
      const { data } = await api.post('items/', payload)
      navigate(`/items/${data.id}`)
    } catch (err) {
      const errors = err.response?.data?.errors || err.response?.data
      setError(typeof errors === 'object' ? JSON.stringify(errors) : 'Could not create item.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
      <h1>Post an item</h1>
      <form onSubmit={handleSubmit} className="form-grid">
        {error && <p className="error">{error}</p>}
        <label>
          Title
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label className="full">
          Description
          <textarea name="description" value={form.description} onChange={handleChange} required />
        </label>
        <label>
          Category
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Condition
          <select name="condition" value={form.condition} onChange={handleChange}>
            <option value="new">New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </label>
        <label>
          Location
          <input name="location" value={form.location} onChange={handleChange} required />
        </label>
        <label>
          Listing type
          <select name="listing_type" value={form.listing_type} onChange={handleChange}>
            <option value="free">Free</option>
            <option value="exchange">Exchange</option>
            <option value="sale">Sale</option>
          </select>
        </label>
        {form.listing_type === 'sale' && (
          <label>
            Price
            <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} />
          </label>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Posting…' : 'Post item'}
        </button>
      </form>
    </div>
  )
}
