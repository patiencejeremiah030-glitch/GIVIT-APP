import { motion } from 'framer-motion'
import { getCategoryMeta } from '../utils/categories'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const card = {
  hidden: { opacity: 0, y: 28, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 22 },
  },
}

export default function CategoryGrid({ categories, itemCounts, activeSlug, onSelect }) {
  const scrollToCategory = (slug) => {
    onSelect?.(slug)
    const el = document.getElementById(`category-${slug}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="categories-showcase" aria-labelledby="categories-heading">
      <motion.div
        className="categories-showcase-intro"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <h2 id="categories-heading">Browse by category</h2>
        <p>Tap a category to jump to listings — donate, swap, or buy locally.</p>
      </motion.div>

      <motion.div
        className="categories-grid"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
      >
        {categories.map((cat) => {
          const meta = getCategoryMeta(cat.slug)
          const Icon = meta.icon
          const count = itemCounts[cat.slug] ?? 0
          const isActive = activeSlug === cat.slug

          return (
            <motion.button
              key={cat.id}
              type="button"
              className={`category-tile ${isActive ? 'category-tile-active' : ''} ${count === 0 ? 'category-tile-empty' : ''}`}
              variants={card}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => scrollToCategory(cat.slug)}
              style={{ '--tile-gradient': meta.gradient, '--tile-accent': meta.accent }}
            >
              <motion.span
                className="category-tile-glow"
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.25 }}
              />
              <span className="category-tile-icon">
                <Icon size={28} strokeWidth={2} />
              </span>
              <span className="category-tile-name">{cat.name}</span>
              <span className="category-tile-tagline">{meta.tagline}</span>
              <motion.span
                className="category-tile-count"
                key={count}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {count} {count === 1 ? 'item' : 'items'}
              </motion.span>
            </motion.button>
          )
        })}
      </motion.div>
    </section>
  )
}
