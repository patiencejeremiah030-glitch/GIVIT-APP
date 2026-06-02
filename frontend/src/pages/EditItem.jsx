import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import { parseApiError } from '../api/errors'

export default function EditItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('items/categories/'),
      api.get(`items/${id}/`),
    ]).then(([catRes, itemRes]) => {
      setCategories(catRes.data)
      const item = itemRes.data
      setForm({
        title: item.title,
        description: item.description,
        category: String(item.category),
        condition: item.condition,
        location: item.location,
        contact: item.contact || '',
        listing_type: item.listing_type,
        price: item.price ?? '',
      })
    })
  }, [id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const payload = { ...form, category: Number(form.category) }
    if (form.listing_type !== 'sale') delete payload.price
    else payload.price = form.price
    try {
      await api.patch(`items/${id}/`, payload)
      navigate(`/items/${id}`)
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing permanently?')) return
    try {
      await api.delete(`items/${id}/`)
      navigate('/my-items')
    } catch (err) {
      alert(parseApiError(err))
    }
  }

  if (!form) return <p className="loading">Loading…</p>

  return (
    <div className="form-page">
      <h1>Edit item</h1>
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <label>
          Title
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label>
          Description
          <textarea name="description" value={form.description} onChange={handleChange} required />
        </label>
        <label>
          Category
          <select name="category" value={form.category} onChange={handleChange}>
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
          Contact
          <input
            name="contact"
            value={form.contact}
            onChange={handleChange}
            placeholder="Phone or email"
            required
          />
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
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </form>
      <button type="button" className="btn btn-danger" style={{ marginTop: '1rem' }} onClick={handleDelete}>
        Delete listing
      </button>
    </div>
  )
}
