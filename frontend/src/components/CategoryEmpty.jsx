import { motion } from 'framer-motion'
import { PlusCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCategoryMeta } from '../utils/categories'

export default function CategoryEmpty({ category, index }) {
  const meta = getCategoryMeta(category.slug)
  const Icon = meta.icon

  return (
    <motion.section
      id={`category-${category.slug}`}
      className="category-section category-section-empty"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="category-empty-card" style={{ '--tile-accent': meta.accent }}>
        <span className="category-empty-icon" style={{ background: meta.gradient }}>
          <Icon size={32} />
        </span>
        <div>
          <h3>{category.name}</h3>
          <p>No listings yet — be the first to share something in this category.</p>
          <Link to="/post" className="btn btn-primary category-empty-cta">
            <PlusCircle size={18} />
            Post in {category.name}
          </Link>
        </div>
      </div>
    </motion.section>
  )
}
