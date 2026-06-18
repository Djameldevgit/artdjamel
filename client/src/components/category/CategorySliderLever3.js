// pages/categories/CategoryLevel3.js
import React, { useState, useEffect } from 'react';
import CategoryBreadcrumb from '../../components/category/CategoryBreadcrumb';
import Posts from '../../components/home/Posts';

const CategorySliderLevel3 = ({ categorySlug, subcategory1Slug, subcategory2Slug, page }) => {
  const [categoryData, setCategoryData] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const categoryConfig = await import(`../../categoryNivel/category${capitalize(categorySlug)}`);
        setCategoryData(categoryConfig.default || categoryConfig);
      } catch (error) {
        console.error('Error loading category:', error);
      }
    };
    
    loadData();
  }, [categorySlug, subcategory1Slug, subcategory2Slug]);
  
  if (!categoryData) return <div>Chargement...</div>;
  
  // Encontrar nombres para breadcrumb
  const selectedSubcategory1 = categoryData.categories?.find(
    cat => cat.id === subcategory1Slug || cat.slug === subcategory1Slug
  );
  
  const selectedSubcategory2 = categoryData.subcategories?.[subcategory1Slug]?.find(
    sub => sub.id === subcategory2Slug || sub.slug === subcategory2Slug
  );
  
  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <CategoryBreadcrumb 
        categoryName={categoryData.name}
        categorySlug={categorySlug}
        subcategory1Name={selectedSubcategory1?.name}
        subcategory1Slug={subcategory1Slug}
        subcategory2Name={selectedSubcategory2?.name}
        subcategory2Slug={subcategory2Slug}
      />
      
      {/* Posts filtrados por subcategoría nivel 2 */}
      <Posts 
        category={categorySlug}
        subcategory={subcategory1Slug}
        subcategory2={subcategory2Slug}
        page={parseInt(page)}
      />
    </div>
  );
};

export default CategorySliderLevel3;