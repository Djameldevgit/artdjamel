export const createSlug = (text) => {
  if (!text) return ''
  return String(text)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const getRouteType = (slug) => {
  if (!slug) return 'home'
  if (slug === 'boutiques') return 'boutiques-list'
  if (slug.startsWith('boutique-')) return 'boutique'
  if (slug.startsWith('annonce-')) return 'annonce'
  if (slug.startsWith('immobilier')) return 'immobilier'
  return 'category'
}

export const parseCategorySlug = (slug) => {
  const parts = slug.split('-')
  return {
    main: parts[0],
    sub: parts[1] || null,
    property: parts[2] || null,
    filters: parts.slice(3),
    level: parts.length
  }
}

export const getCategoryUrl = (categoryName, subcategory = null, page = 1) => {
  let slug = createSlug(categoryName)
  if (subcategory) slug += `-${createSlug(subcategory)}`
  return `/${slug}/${page}`
}

export const getBoutiqueUrl = (boutiqueName, page = 1) => {
  const slug = createSlug(boutiqueName)
  return `/boutique-${slug}/${page}`
}