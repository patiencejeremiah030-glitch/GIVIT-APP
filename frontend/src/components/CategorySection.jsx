import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { getCategoryMeta } from '../utils/categories'
import ItemCard from './ItemCard'

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.12 },
  },
}

const itemVariant = {
  hidden: { opacity: 0, x: 32 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
}

export default function CategorySection({ category, items, index, isHighlighted }) {
  const meta = getCategoryMeta(category.slug)
  const Icon = meta.icon
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '-80px', amount: 0.2 })

  return (
    <motion.section
      ref={ref}
      id={`category-${category.slug}`}
      className={`category-section ${isHighlighted ? 'category-section-highlight' : ''}`}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0.4, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      layout
    >
      <motion.div
        className="category-section-header"
        style={{ background: meta.gradient }}
        initial={{ opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="category-section-title">
          <motion.span
            className="category-icon-wrap"
            animate={inView ? { rotate: [0, -8, 8, 0], scale: 1 } : { scale: 0.9 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Icon size={26} strokeWidth={2.2} />
          </motion.span>
          <div>
            <h2>{category.name}</h2>
            <p>
              {items.length} item{items.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
        <motion.span
          className="see-all"
          animate={inView ? { x: [0, 6, 0] } : {}}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          Swipe <ArrowRight size={18} />
        </motion.span>
      </motion.div>

      <motion.div
        className="category-scroll"
        variants={listVariants}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
      >
        {items.map((item) => (
          <motion.div key={item.id} className="category-scroll-item" variants={itemVariant}>
            <ItemCard item={item} accent={meta.accent} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  )
}
