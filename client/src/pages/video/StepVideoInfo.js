// components/Video/StepVideoInfo.jsx - Versión con soporte dual
import React, { useState } from 'react';

// ============================================
// CATÉGORIES POUR VIDÉOS COMMERCIALES
// ============================================
const commercialCategories = [
  { name: 'Véhicules', slug: 'videos-vehicules', icon: '🚗', description: 'Voitures, motos, poids lourds' },
  { name: 'Immobilier', slug: 'videos-immobilier', icon: '🏠', description: 'Appartements, maisons, terrains' },
  { name: 'Téléphones', slug: 'videos-telephones', icon: '📱', description: 'Smartphones, accessoires' },
  { name: 'Informatique', slug: 'videos-informatique', icon: '💻', description: 'PC, laptops, composants' },
  { name: 'Électroménager', slug: 'videos-electromenager', icon: '🔌', description: 'Réfrigérateurs, lave-linge' },
  { name: 'Art', slug: 'videos-art', icon: '🎨', description: 'Peintures, sculptures, artisanat' },
  { name: 'Mode & Vêtements', slug: 'videos-mode-vetements', icon: '👕', description: 'Vêtements, chaussures, accessoires' },
  { name: 'Maison & Jardin', slug: 'videos-maison-jardin', icon: '🏡', description: 'Décoration, mobilier, outils' },
  { name: 'Sport & Loisirs', slug: 'videos-sport-loisirs', icon: '⚽', description: 'Équipements sportifs' },
  { name: 'Alimentaires', slug: 'videos-alimentaires', icon: '🍔', description: 'Produits alimentaires' },
  { name: 'Meubles', slug: 'videos-meubles', icon: '🛋️', description: 'Canapés, tables, chaises' },
  { name: 'Pièces Détachées', slug: 'videos-pieces-detachees', icon: '🔧', description: 'Pièces auto, électronique' },
  { name: 'Santé & Beauté', slug: 'videos-sante-beaute', icon: '💄', description: 'Cosmétiques, bien-être' },
  { name: 'Services', slug: 'videos-services', icon: '🔨', description: 'Services professionnels' },
  { name: 'Tutoriels', slug: 'videos-tutoriels', icon: '📚', description: 'DIY, formations' },
  { name: 'Reviews', slug: 'videos-reviews', icon: '⭐', description: 'Tests et avis produits' }
];

// ============================================
// CATÉGORIES POUR VIDÉOS SOCIALES (TikTok style)
// ============================================
const socialCategories = [
  { name: 'Tendance', slug: 'tendance', icon: '🔥', description: 'Les vidéos qui buzz' },
  { name: 'Humour', slug: 'humour', icon: '😂', description: 'Funny, memes, blagues' },
  { name: 'Musique', slug: 'musique', icon: '🎵', description: 'Chants, covers, instruments' },
  { name: 'Danse', slug: 'danse', icon: '💃', description: 'Chorégraphies, challenges' },
  { name: 'Sport', slug: 'sport', icon: '⚽', description: 'Fitness, exploits' },
  { name: 'Animaux', slug: 'animaux', icon: '🐕', description: 'Pets, animaux mignons' },
  { name: 'Voyage', slug: 'voyage', icon: '✈️', description: 'Destinations, aventures' },
  { name: 'Cuisine', slug: 'cuisine', icon: '🍳', description: 'Recettes, food' },
  { name: 'Beauté', slug: 'beaute', icon: '💄', description: 'Makeup, soins' },
  { name: 'Mode', slug: 'mode', icon: '👗', description: 'Style, outfits' },
  { name: 'Gaming', slug: 'gaming', icon: '🎮', description: 'Jeux vidéo, streams' },
  { name: 'Éducation', slug: 'education', icon: '📖', description: 'Savoir, astuces' },
  { name: 'Science', slug: 'science', icon: '🔬', description: 'Découvertes, expériences' },
  { name: 'Nature', slug: 'nature', icon: '🌿', description: 'Paysages, écologie' },
  { name: 'Art', slug: 'art', icon: '🎨', description: 'Créations, dessins' },
  { name: 'LifeStyle', slug: 'lifestyle', icon: '✨', description: 'Quotidien, vlogs' }
];

const StepVideoInfo = ({ wizardData, updateData, videoType = 'commercial', videoCategories: externalCategories = null }) => {
  const [tagInput, setTagInput] = useState('');
  
  // Utiliser les catégories externes si fournies, sinon les catégories par défaut selon le type
  const categories = externalCategories || (videoType === 'commercial' ? commercialCategories : socialCategories);
  const [selectedCategory, setSelectedCategory] = useState(wizardData.categorySlug || '');
  
  const selectCategory = (slug) => {
    setSelectedCategory(slug);
    updateData({ categorySlug: slug });
  };
  
  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const currentTags = wizardData.tags || [];
      if (!currentTags.includes(tagInput.trim())) {
        updateData({ tags: [...currentTags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove) => {
    const currentTags = wizardData.tags || [];
    updateData({ tags: currentTags.filter(tag => tag !== tagToRemove) });
  };
  
  // Titre selon le type de vidéo
  const getTitle = () => {
    if (videoType === 'commercial') {
      return '🛍️ Informations produit / service';
    }
    return '🎵 Détails de votre vidéo';
  };
  
  const getSubtitle = () => {
    if (videoType === 'commercial') {
      return 'Ajoutez les détails de votre produit ou service pour attirer plus d\'acheteurs';
    }
    return 'Ajoutez une description et choisissez une catégorie pour toucher votre audience';
  };
  
  const getPlaceholderTitle = () => {
    if (videoType === 'commercial') {
      return 'Ex: iPhone 13 Pro - Excellent état, vente urgente';
    }
    return 'Ex: Mon meilleur moment de la journée ! 🔥';
  };
  
  const getPlaceholderDescription = () => {
    if (videoType === 'commercial') {
      return 'Décrivez votre produit : état, prix, caractéristiques, raison de vente...';
    }
    return 'Racontez votre vidéo, ajoutez des hashtags, faites rire ou émerveiller...';
  };
  
  const getTagHint = () => {
    if (videoType === 'commercial') {
      return 'Tags : produit, marque, état, prix (ex: iphone, apple, neuf)';
    }
    return 'Tags : humour, danse, challenge, tendance (ex: fun, viral, #fyp)';
  };
  
  return (
    <div className="step-video-info" style={{ padding: '20px' }}>
      <div className="step-header" style={{ marginBottom: '24px' }}>
        <h5 style={{ marginBottom: '8px', fontSize: '1.1rem', fontWeight: '600' }}>
          {getTitle()}
        </h5>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0' }}>
          {getSubtitle()}
        </p>
      </div>
      
      {/* Titre */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>
          Titre <span style={{ color: '#ff3b5c' }}>*</span>
        </label>
        <input
          type="text"
          className="form-control"
          placeholder={getPlaceholderTitle()}
          value={wizardData.title || ''}
          onChange={(e) => updateData({ title: e.target.value })}
          maxLength={100}
          style={{ 
            width: '100%', 
            padding: '12px', 
            borderRadius: '12px', 
            border: '1px solid #e0e0e0',
            fontSize: '0.9rem'
          }}
        />
        <small className="text-muted" style={{ fontSize: '0.7rem', marginTop: '4px', display: 'block' }}>
          {(wizardData.title || '').length}/100 caractères
        </small>
      </div>
      
      {/* Description */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>
          Description
        </label>
        <textarea
          className="form-control"
          rows="4"
          placeholder={getPlaceholderDescription()}
          value={wizardData.description || ''}
          onChange={(e) => updateData({ description: e.target.value })}
          maxLength={2000}
          style={{ 
            width: '100%', 
            padding: '12px', 
            borderRadius: '12px', 
            border: '1px solid #e0e0e0',
            fontSize: '0.9rem',
            resize: 'vertical'
          }}
        />
        <small className="text-muted" style={{ fontSize: '0.7rem', marginTop: '4px', display: 'block' }}>
          {(wizardData.description || '').length}/2000 caractères
        </small>
      </div>
      
      {/* Catégorie */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>
          Catégorie <span style={{ color: '#ff3b5c' }}>*</span>
        </label>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', 
          gap: '10px',
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '4px'
        }}>
          {categories.map(cat => (
            <div
              key={cat.slug}
              onClick={() => selectCategory(cat.slug)}
              style={{
                padding: '12px 8px',
                border: selectedCategory === cat.slug ? '2px solid #667eea' : '1px solid #e0e0e0',
                borderRadius: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                background: selectedCategory === cat.slug ? 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))' : 'white',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>{cat.icon}</div>
              <div style={{ fontSize: '12px', fontWeight: selectedCategory === cat.slug ? '600' : '500' }}>
                {cat.name}
              </div>
              {selectedCategory === cat.slug && (
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#667eea',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px'
                }}>
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Tags */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>
          Tags
        </label>
        <input
          type="text"
          className="form-control"
          placeholder={getTagHint()}
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={addTag}
          style={{ 
            width: '100%', 
            padding: '12px', 
            borderRadius: '12px', 
            border: '1px solid #e0e0e0',
            fontSize: '0.9rem'
          }}
        />
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
          {(wizardData.tags || []).map((tag, index) => (
            <span
              key={index}
              onClick={() => removeTag(tag)}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              #{tag}
              <span style={{ fontSize: '10px', opacity: 0.8 }}>✕</span>
            </span>
          ))}
        </div>
        <small className="text-muted" style={{ fontSize: '0.7rem', marginTop: '8px', display: 'block' }}>
          💡 {getTagHint()} - Appuyez sur Entrée pour ajouter
        </small>
      </div>
      
      {/* Consejos según el tipo de video */}
      <div style={{
        background: videoType === 'commercial' 
          ? 'linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08))'
          : 'linear-gradient(135deg, rgba(240,147,251,0.08), rgba(245,87,108,0.08))',
        borderRadius: '12px',
        padding: '12px 16px',
        marginTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '18px' }}>{videoType === 'commercial' ? '💡' : '🎯'}</span>
          <span style={{ fontSize: '12px', fontWeight: '600' }}>
            {videoType === 'commercial' ? 'Conseil pour vendre plus' : 'Conseil pour plus de vues'}
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '0' }}>
          {videoType === 'commercial' 
            ? 'Ajoutez le prix, l\'état et les caractéristiques clés dans la description. Plus vous donnez de détails, plus vite vous vendez !'
            : 'Utilisez des hashtags tendance, soyez authentique et engageant. Les 3 premières secondes sont cruciales pour capter l\'attention !'
          }
        </p>
      </div>
    </div>
  );
};

export default StepVideoInfo;