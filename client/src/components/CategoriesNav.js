// components/CategoriesNav.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const CategoriesNav = ({ selectedCategory, onSelectCategory, categories: propCategories }) => {
    const { homePosts } = useSelector(state => state);
    
    // Usar categorías de props o de Redux
    const categories = propCategories || homePosts.categories || [];
    
    const [showAll, setShowAll] = useState(false);
    
    // Categorías a mostrar (limitadas o todas)
    const categoriesToShow = showAll 
        ? categories 
        : categories.slice(0, 8);
    
    return (
        <div className="categories-nav mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Filtrar por categoría:</h5>
                {categories.length > 8 && (
                    <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? 'Ver menos' : `Ver todas (${categories.length})`}
                    </button>
                )}
            </div>
            
            <div className="d-flex flex-wrap gap-2">
                {/* Botón "Todas" */}
                <button
                    className={`btn ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => onSelectCategory('all')}
                >
                    <i className="fas fa-globe me-1"></i>
                    Todas
                </button>
                
                {/* Categorías */}
                {categoriesToShow.map(category => (
                    <button
                        key={category.name}
                        className={`btn ${selectedCategory === category.name ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => onSelectCategory(category.name)}
                        title={`${category.count} anuncios`}
                    >
                        <span className="me-1">{category.emoji}</span>
                        {category.name}
                        {category.count > 0 && (
                            <span className="badge bg-light text-dark ms-1">
                                {category.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>
            
            {/* Información de la categoría seleccionada */}
            {selectedCategory !== 'all' && (
                <div className="mt-3 p-3 bg-light rounded">
                    <p className="mb-0">
                        <strong>
                            {categories.find(c => c.name === selectedCategory)?.emoji || '📁'}
                            {selectedCategory}
                        </strong>
                        <span className="text-muted ms-2">
                            {categories.find(c => c.name === selectedCategory)?.count || 0} anuncios disponibles
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default CategoriesNav;