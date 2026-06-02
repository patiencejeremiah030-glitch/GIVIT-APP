import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Sparkles, Gift, X, MapPin } from 'lucide-react'
import api from '../api/client'
import { getResults } from '../api/errors'
import CategoryGrid from '../components/CategoryGrid'
import CategorySection from '../components/CategorySection'
import CategoryEmpty from '../components/CategoryEmpty'
import ItemCard from '../components/ItemCard'

export default function Home() {
  const [items, setItems] = useState([])
  const [countItems, setCountItems] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [freeOnly, setFreeOnly] = useState(false)
  const [filterCategory, setFilterCategory] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('items/categories/').then((res) => setCategories(res.data))
  }, [])

  const fetchItems = useCallback(() => {
    setLoading(true)
    const params = { page_size: 100 }
    if (search.trim()) params.search = search.trim()
    if (freeOnly) params.is_free = true
    if (filterCategory) params.category = filterCategory
    if (locationFilter.trim()) params.location = locationFilter.trim()

    api
      .get('items/', { params })
      .then((res) => setItems(getResults(res.data)))
      .catch(() => setError('Could not load items. Is the backend running on port 8000?'))
      .finally(() => setLoading(false))
  }, [search, freeOnly, filterCategory, locationFilter])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  useEffect(() => {
    api
      .get('items/', { params: { page_size: 100 } })
      .then((res) => setCountItems(getResults(res.data)))
      .catch(() => {})
  }, [])

  const itemCounts = useMemo(() => {
    const counts = {}
    categories.forEach((cat) => {
      counts[cat.slug] = countItems.filter(
        (i) => i.category_slug === cat.slug || i.category === cat.id,
      ).length
    })
    return counts
  }, [categories, countItems])

  const hasFilters = Boolean(
    search.trim() || freeOnly || filterCategory || locationFilter.trim(),
  )
  const showSections = !hasFilters

  const sections = useMemo(() => {
    if (!showSections) return []
    return categories
      .map((cat) => ({
        category: cat,
        items: items.filter(
          (i) => i.category_slug === cat.slug || i.category === cat.id,
        ),
      }))
      .filter((s) => s.items.length > 0)
  }, [categories, items, showSections])

  const emptyCategories = useMemo(() => {
    if (!showSections) return []
    return categories.filter((c) => (itemCounts[c.slug] ?? 0) === 0)
  }, [categories, itemCounts, showSections])

  const handleCategorySelect = (slug) => {
    setActiveCategory(slug)
    setFilterCategory(slug)
  }

  const clearFilters = () => {
    setSearch('')
    setFreeOnly(false)
    setFilterCategory('')
    setLocationFilter('')
    setActiveCategory(null)
  }

  return (
    <div className="home-page">
      <motion.section
        className="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="hero-badge">
          <Sparkles size={16} />
          Community marketplace
        </div>
        <h1>
          Give. <span className="hero-highlight">Swap.</span> Trade.
        </h1>
        <p>
          Discover free items, swaps, and affordable finds — organized by category in your
          neighborhood.
        </p>
        <div className="hero-stats">
          <div>
            <strong>{countItems.length}</strong>
            <span>listings</span>
          </div>
          <div>
            <strong>{categories.length}</strong>
            <span>categories</span>
          </div>
          <div>
            <strong>Free</strong>
            <span>donations</span>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="search-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="search-wrap">
          <Search size={20} className="search-icon" />
          <input
            type="search"
            placeholder="Search chairs, books…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="search-wrap location-wrap">
          <MapPin size={20} className="search-icon" />
          <input
            type="search"
            placeholder="Location (e.g. Lagos)"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>
        <motion.button
          type="button"
          className={`chip ${freeOnly ? 'chip-active' : ''}`}
          onClick={() => setFreeOnly(!freeOnly)}
          whileTap={{ scale: 0.95 }}
        >
          <Gift size={16} />
          Free only
        </motion.button>
        {hasFilters && (
          <button type="button" className="chip chip-clear" onClick={clearFilters}>
            <X size={16} />
            Clear
          </button>
        )}
      </motion.section>

      {error && <p className="error-banner">{error}</p>}

      {!loading && categories.length > 0 && (
        <CategoryGrid
          categories={categories}
          itemCounts={itemCounts}
          activeSlug={activeCategory}
          onSelect={handleCategorySelect}
        />
      )}

      {loading ? (
        <div className="categories-loading">
          <div className="skeleton-grid categories-skeleton">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="skeleton-category-tile" />
            ))}
          </div>
        </div>
      ) : showSections ? (
        <div className="category-sections">
          <motion.div
            className="category-listings-heading"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2>All listings by category</h2>
            <p>Scroll through each section or tap a category above to filter.</p>
          </motion.div>
          {sections.length === 0 && emptyCategories.length === categories.length ? (
            <p className="empty-state">No items yet. Be the first to post!</p>
          ) : (
            <>
              {sections.map((s, i) => (
                <CategorySection
                  key={s.category.id}
                  category={s.category}
                  items={s.items}
                  index={i}
                  isHighlighted={activeCategory === s.category.slug}
                />
              ))}
              {emptyCategories.map((cat, i) => (
                <CategoryEmpty key={cat.id} category={cat} index={i} />
              ))}
            </>
          )}
        </div>
      ) : (
        <section className="results-section">
          <h2>
            {filterCategory
              ? `Results in ${categories.find((c) => c.slug === filterCategory)?.name || filterCategory}`
              : locationFilter.trim()
                ? `Results near ${locationFilter.trim()}`
                : 'Search results'}{' '}
            ({items.length})
          </h2>
          <div className="item-grid">
            {items.length === 0 ? (
              <p className="empty-state">No items match your filters.</p>
            ) : (
              items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <ItemCard item={item} />
                </motion.div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  )
}
