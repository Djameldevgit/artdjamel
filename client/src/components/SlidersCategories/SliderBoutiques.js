import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaStore, FaShoppingBag, FaGift, FaTshirt, FaUtensils, FaBook, FaGamepad, FaCar, FaHome, FaMobileAlt } from 'react-icons/fa';

// Subcategorías de Boutiques - con emojis e iconos
const boutiquesData = [
  { id: 'mode-fashion', name: 'Mode & Fashion', icon: <FaTshirt />, emoji: '👗', color: '#ff6b6b', description: 'Vêtements, chaussures, accessoires' },
  { id: 'electronique-tech', name: 'Électronique & Tech', icon: <FaMobileAlt />, emoji: '📱', color: '#4ecdc4', description: 'Téléphones, accessoires tech' },
  { id: 'maison-deco', name: 'Maison & Déco', icon: <FaHome />, emoji: '🏠', color: '#45b7d1', description: 'Décoration, meubles, jardin' },
  { id: 'beaute-sante', name: 'Beauté & Santé', icon: <FaGift />, emoji: '💄', color: '#96ceb4', description: 'Cosmétiques, soins, parfums' },
  { id: 'sport-loisirs', name: 'Sport & Loisirs', icon: <FaGamepad />, emoji: '⚽', color: '#ffeaa7', description: 'Équipements sportifs, jeux' },
  { id: 'alimentation', name: 'Alimentation', icon: <FaUtensils />, emoji: '🍎', color: '#fab1a0', description: 'Produits alimentaires, boissons' },
  { id: 'librairie-papeterie', name: 'Librairie & Papeterie', icon: <FaBook />, emoji: '📚', color: '#a29bfe', description: 'Livres, fournitures bureau' },
  { id: 'automobile-accessoires', name: 'Auto & Accessoires', icon: <FaCar />, emoji: '🚗', color: '#fd79a8', description: 'Pièces auto, accessoires' },
  { id: 'enfants-bebes', name: 'Enfants & Bébés', icon: <FaGift />, emoji: '👶', color: '#81ecec', description: 'Vêtements, jouets, puériculture' },
  { id: 'artisanat-local', name: 'Artisanat Local', icon: <FaStore />, emoji: '🎨', color: '#55efc4', description: 'Produits artisanaux, locaux' },
  { id: 'bijouterie-horlogerie', name: 'Bijouterie & Horlogerie', icon: <FaShoppingBag />, emoji: '⌚', color: '#74b9ff', description: 'Bijoux, montres, accessoires' },
  { id: 'multiboutique', name: 'Multi-Boutique', icon: <FaStore />, emoji: '🛍️', color: '#a55eea', description: 'Produits variés, généraliste' }
];

const SliderBoutiques = ({ categorySlug = 'boutiques', showTitle = true, compact = false }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  
  // Configuración responsive
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile && scrollRef.current) {
        scrollRef.current.scrollLeft = 0;
        setScrollPosition(0);
        updateScrollButtons();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calcular distribución según el modo
  const itemsPerRow = compact ? (isMobile ? 3 : 4) : (isMobile ? 4 : 6);
  const rows = [];
  for (let i = 0; i < boutiquesData.length; i += itemsPerRow) {
    rows.push(boutiquesData.slice(i, i + itemsPerRow));
  }

  // Actualizar estado de botones de scroll
  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Manejar scroll
  const handleScroll = () => {
    if (scrollRef.current) {
      setScrollPosition(scrollRef.current.scrollLeft);
      updateScrollButtons();
    }
  };

  // Renderizar fila de boutiques
  const renderBoutiqueRow = (row, rowIndex) => {
    return (
      <div 
        style={{
          display: 'flex',
          justifyContent: isMobile ? 'flex-start' : 'center',
          gap: compact ? (isMobile ? '10px' : '15px') : (isMobile ? '15px' : '20px'),
          padding: compact ? (isMobile ? '8px 10px' : '12px 15px') : (isMobile ? '12px 15px' : '16px 20px'),
          flexShrink: 0,
          minWidth: isMobile ? 'min-content' : 'auto'
        }}
      >
        {row.map((boutique) => (
          <Link
            key={boutique.id}
            to={`/boutique/${boutique.id}/1`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flexShrink: 0,
              width: compact ? (isMobile ? '90px' : '110px') : (isMobile ? '100px' : '130px'),
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (window.innerWidth > 768) {
                e.currentTarget.style.transform = 'translateY(-5px)';
              }
            }}
            onMouseLeave={(e) => {
              if (window.innerWidth > 768) {
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {/* CONTENEDOR DEL ICONO */}
            <div
              style={{
                width: compact ? (isMobile ? '65px' : '80px') : (isMobile ? '75px' : '95px'),
                height: compact ? (isMobile ? '65px' : '80px') : (isMobile ? '75px' : '95px'),
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: compact ? '8px' : '12px',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${boutique.color}20 0%, ${boutique.color}10 100%)`,
                border: `3px solid ${boutique.color}30`,
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
              className="boutique-icon-container"
            >
              {/* FONDO DEGRADADO */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle at 30% 30%, ${boutique.color}15 0%, transparent 70%)`,
                opacity: 0.7
              }} />
              
              {/* CONTENEDOR DEL ICONO/EMOJI */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}>
                {/* EMOJI */}
                <span style={{ 
                  fontSize: compact ? '1.8rem' : '2.2rem',
                  filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))',
                  lineHeight: 1
                }}>
                  {boutique.emoji}
                </span>
                
                {/* ICONO FA (solo en desktop) */}
                {!isMobile && !compact && (
                  <div style={{
                    color: boutique.color,
                    fontSize: '0.9rem',
                    opacity: 0.8,
                    marginTop: '2px'
                  }}>
                    {boutique.icon}
                  </div>
                )}
              </div>
              
              {/* EFECTO BRILLO */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                transform: 'rotate(45deg)',
                opacity: 0.3
              }} />
            </div>

            {/* NOMBRE DE LA BOUTIQUE */}
            <div style={{
              textAlign: 'center',
              width: '100%'
            }}>
              <h6 style={{
                fontSize: compact ? '0.75rem' : '0.85rem',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: '1.2'
              }}>
                {boutique.name}
              </h6>
              
              {/* DESCRIPCIÓN (solo en desktop y no compact) */}
              {!isMobile && !compact && (
                <p style={{
                  fontSize: '0.7rem',
                  color: '#718096',
                  margin: 0,
                  height: '32px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOriente: 'vertical',
                  lineHeight: '1.2'
                }}>
                  {boutique.description}
                </p>
              )}
              
              {/* BADGE (solo mobile o compact) */}
              {(isMobile || compact) && (
                <span style={{
                  fontSize: '0.7rem',
                  color: boutique.color,
                  fontWeight: '500',
                  display: 'inline-block',
                  marginTop: '2px'
                }}>
                  Boutique
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="boutiques-slider-container">
      {/* Card contenedor */}
      <div style={{
        position: 'relative',
        maxWidth: compact ? '100%' : '1400px',
        margin: '0 auto',
        background: compact ? 'transparent' : 'white',
        borderRadius: compact ? '12px' : '24px',
        boxShadow: compact ? '0 2px 8px rgba(0,0,0,0.06)' : '0 10px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: compact ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(0,0,0,0.08)'
      }}>
        {/* Título condicional */}
        {showTitle && (
          <div style={{
            padding: compact ? (isMobile ? '15px 12px 8px' : '18px 20px 12px') : (isMobile ? '20px 16px 12px' : '24px 24px 16px'),
            borderBottom: compact ? '1px solid rgba(0,0,0,0.04)' : '1px solid rgba(0,0,0,0.05)',
            background: compact ? 'white' : 'linear-gradient(135deg, #667eea05 0%, #764ba205 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: compact ? '36px' : '48px',
              height: compact ? '36px' : '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #a55eea 0%, #8e44ad 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: compact ? '1.2rem' : '1.5rem',
              boxShadow: '0 4px 12px rgba(165, 94, 234, 0.3)'
            }}>
              <FaStore />
            </div>
            
            <div>
              <h3 style={{
                margin: 0,
                fontSize: compact ? (isMobile ? '1.1rem' : '1.2rem') : (isMobile ? '1.3rem' : '1.5rem'),
                fontWeight: '700',
                color: '#2d3748',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>Boutiques & Commerces</span>
                <span style={{
                  fontSize: '0.7em',
                  background: 'linear-gradient(135deg, #a55eea 0%, #8e44ad 100%)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: '500'
                }}>
                  {boutiquesData.length} types
                </span>
              </h3>
              
              {!compact && (
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  color: '#666'
                }}>
                  Découvrez nos boutiques spécialisées par catégorie
                </p>
              )}
            </div>
          </div>
        )}

        {/* Contenido del slider */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            display: 'block',
            padding: compact ? (isMobile ? '10px 0' : '12px 0') : (isMobile ? '16px 0' : '20px 0'),
            overflowX: isMobile ? 'auto' : 'visible',
            overflowY: 'hidden',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}
        >
          {/* Renderizar filas */}
          {rows.map((row, rowIndex) => renderBoutiqueRow(row, rowIndex))}
        </div>

        {/* Botones de scroll solo en mobile */}
        {isMobile && rows.length > 1 && (
          <>
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 20,
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #a55eea 0%, #8e44ad 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(165, 94, 234, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <FaChevronLeft size={18} color="white" />
              </button>
            )}

            {canScrollRight && (
              <button
                onClick={scrollRight}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 20,
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #a55eea 0%, #8e44ad 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(165, 94, 234, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <FaChevronRight size={18} color="white" />
              </button>
            )}

            {/* Indicadores de scroll (dots) */}
            {rows.length > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 0 12px 0',
                position: 'relative',
                zIndex: 10
              }}>
                {rows.map((_, index) => {
                  const isActive = index === Math.floor(scrollPosition / 300);
                  return (
                    <div
                      key={index}
                      style={{
                        width: isActive ? '8px' : '6px',
                        height: isActive ? '8px' : '6px',
                        borderRadius: '50%',
                        background: isActive 
                          ? 'linear-gradient(135deg, #a55eea 0%, #8e44ad 100%)' 
                          : '#e0e0e0',
                        transition: 'all 0.3s ease',
                        transform: isActive ? 'scale(1.1)' : 'scale(1)'
                      }}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Footer (solo en modo completo) */}
        {!compact && (
          <div style={{
            padding: isMobile ? '12px 16px' : '16px 24px',
            borderTop: '1px solid rgba(0,0,0,0.04)',
            background: 'rgba(248, 249, 250, 0.6)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              <span style={{ fontWeight: '500', color: '#a55eea' }}>
                {boutiquesData.length} types de boutiques
              </span>
              <span style={{ margin: '0 8px' }}>•</span>
              Découvrez nos commerces spécialisés
            </div>
            
            <Link 
              to="/boutiques"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                color: '#a55eea',
                fontWeight: '600',
                textDecoration: 'none',
                padding: '6px 16px',
                borderRadius: '20px',
                background: 'rgba(165, 94, 234, 0.1)',
                transition: 'all 0.2s ease',
                border: '1px solid rgba(165, 94, 234, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(165, 94, 234, 0.15)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(165, 94, 234, 0.1)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              Explorer toutes les boutiques
              <FaChevronRight size={12} />
            </Link>
          </div>
        )}
      </div>

      {/* Estilos CSS */}
      <style>{`
        /* Ocultar scrollbar pero mantener funcionalidad */
        .boutiques-slider-container ::-webkit-scrollbar {
          display: none;
        }
        
        /* Efectos hover para desktop */
        @media (hover: hover) and (pointer: fine) {
          .boutique-icon-container:hover {
            transform: scale(1.05) rotate(2deg);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          }
          
          .boutiques-slider-container a:hover .boutique-icon-container {
            transform: translateY(-5px) scale(1.05);
          }
        }
        
        /* Efecto de press para mobile */
        .boutiques-slider-container a:active .boutique-icon-container {
          transform: scale(0.95);
          transition: transform 0.1s ease;
        }
        
        /* Prevenir zoom en doble tap */
        .boutiques-slider-container * {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Optimización para pantallas muy pequeñas */
        @media (max-width: 380px) {
          .boutiques-slider-container a {
            width: 85px !important;
          }
          
          .boutique-icon-container {
            width: 60px !important;
            height: 60px !important;
          }
          
          .boutique-icon-container span {
            font-size: 1.6rem !important;
          }
        }
        
        /* Mejorar visualización en PCs grandes */
        @media (min-width: 1200px) {
          .boutiques-slider-container:not(.compact) .boutique-icon-container {
            width: 105px !important;
            height: 105px !important;
          }
        }
        
        /* Animación de entrada */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .boutiques-slider-container a {
          animation: fadeInUp 0.5s ease forwards;
          animation-delay: calc(var(--index, 0) * 0.05s);
          opacity: 0;
        }
        
        /* Gradientes en los bordes del scroll (solo mobile) */
        @media (max-width: 767px) {
          .boutiques-slider-container > div > div:nth-child(2)::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 30px;
            height: 100%;
            background: linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%);
            pointer-events: none;
            z-index: 15;
          }
          
          .boutiques-slider-container > div > div:nth-child(2)::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 30px;
            height: 100%;
            background: linear-gradient(to left, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%);
            pointer-events: none;
            z-index: 15;
          }
        }
      `}</style>
    </div>
  );
};

export default SliderBoutiques;