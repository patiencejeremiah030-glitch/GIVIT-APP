import {
  BookOpen,
  Laptop,
  Shirt,
  Sofa,
  UtensilsCrossed,
  Package,
} from 'lucide-react'

export const CATEGORY_META = {
  electronics: {
    icon: Laptop,
    gradient: 'linear-gradient(135deg, #1d3557 0%, #457b9d 100%)',
    accent: '#457b9d',
    tagline: 'Phones, laptops & gadgets',
  },
  furniture: {
    icon: Sofa,
    gradient: 'linear-gradient(135deg, #6f4e37 0%, #a98467 100%)',
    accent: '#a98467',
    tagline: 'Chairs, tables & home decor',
  },
  books: {
    icon: BookOpen,
    gradient: 'linear-gradient(135deg, #5c4033 0%, #8b5e3c 100%)',
    accent: '#8b5e3c',
    tagline: 'Textbooks, novels & more',
  },
  clothes: {
    icon: Shirt,
    gradient: 'linear-gradient(135deg, #7b2cbf 0%, #c77dff 100%)',
    accent: '#9d4edd',
    tagline: 'Fashion & accessories',
  },
  kitchen: {
    icon: UtensilsCrossed,
    gradient: 'linear-gradient(135deg, #e85d04 0%, #f48c06 100%)',
    accent: '#f48c06',
    tagline: 'Appliances & cookware',
  },
  others: {
    icon: Package,
    gradient: 'linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)',
    accent: '#40916c',
    tagline: 'Everything else',
  },
}

export function getCategoryMeta(slug) {
  const key = (slug || 'others').toLowerCase()
  return CATEGORY_META[key] || CATEGORY_META.others
}
