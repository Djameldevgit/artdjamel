// Funciones para construir URLs al estilo Ouedkniss
export const buildCategoryUrl = (categorySlug, page = 1) => {
  return `/${categorySlug}/${page}`;
};

export const buildSubcategoryUrl = (categorySlug, subcategorySlug, page = 1) => {
  return `/${categorySlug}-${subcategorySlug}/${page}`;
};

export const buildSubcategory2Url = (categorySlug, sub1Slug, sub2Slug, page = 1) => {
  return `/${categorySlug}-${sub1Slug}-${sub2Slug}/${page}`;
};

// Helper para capitalizar
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};