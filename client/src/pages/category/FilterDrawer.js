// 📂 pages/FilterDrawer.jsx - VERSIÓN FINAL CORREGIDA

import React, { useState, useEffect, useCallback } from 'react';
import { Offcanvas, Form, Button, Accordion, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { 
  Funnel, 
  XLg, 
  ArrowCounterclockwise,
  Check2,
  GeoAlt,
  CurrencyEuro,
  SortDown,
  Search
} from 'react-bootstrap-icons';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import axios from 'axios';
import { BASE_URL } from '../../utils/config';
//import WilayaCommuneField from '../../components/CATEGORIES/camposComun/WilayaCommuneField';

const FilterDrawer = ({ 
  show, 
  onHide, 
  onApplyFilters, 
  initialWilaya, 
  initialCommune, 
  initialSearchTerm = '',
  initialSortBy = 'recent',
  isBoutique, 
  isVideo 
}) => {
  const { slug, subSlug, articleSlug } = useParams();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // ============ ESTADOS LOCALES ============
  const [categoryChildren, setCategoryChildren] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [error, setError] = useState(null);
  
  // Metadata de filtros
  const [localFilterMetadata, setLocalFilterMetadata] = useState({
    wilayas: [],
    priceRange: { min: 0, max: 1000000 },
    communes: []
  });

  // ============ ESTADO DE FILTROS TEMPORALES ============
  const [tempFilters, setTempFilters] = useState({
    subCategory: '',
    article: '',
    searchTerm: initialSearchTerm || '',
    wilaya: initialWilaya || '',
    commune: initialCommune || '',
    priceMin: 0,
    priceMax: 1000000,
    sortBy: initialSortBy || 'recent'
  });
  
  const [priceRange, setPriceRange] = useState([0, 1000000]);

  // ============ DETECTAR TAMAÑO ============
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============ CARGAR METADATA ============
  useEffect(() => {
    if (!show || !slug) return;
    
    const loadMetadata = async () => {
      setLoadingChildren(true);
      setError(null);
      
      try {
        console.log('🔄 Cargando metadata para drawer...', { slug, subSlug, articleSlug });
        
        const response = await axios.get(`${BASE_URL}/api/categories/metadata/${slug}`, {
          params: {
            sub: subSlug,
            article: articleSlug
          }
        });
        
        const data = response.data;
        
        if (data.success) {
          setCategoryChildren(data.children || []);
          setLocalFilterMetadata({
            wilayas: data.filterMetadata?.wilayas || [],
            priceRange: data.filterMetadata?.priceRange || { min: 0, max: 1000000 },
            communes: data.filterMetadata?.communes || []
          });
        } else {
          throw new Error(data.message || 'Error al cargar metadata');
        }
        
      } catch (error) {
        console.error('❌ Error cargando metadata:', error);
        setError(error.response?.data?.message || error.message || 'Error al cargar filtros');
        setCategoryChildren([]);
      } finally {
        setLoadingChildren(false);
      }
    };
    
    loadMetadata();
  }, [show, slug, subSlug, articleSlug]);

  // ============ INICIALIZAR FILTROS ============
  const initializeFilters = useCallback(() => {
    const min = localFilterMetadata?.priceRange?.min ?? 0;
    const max = localFilterMetadata?.priceRange?.max ?? 1000000;
    
    let initialSub = subSlug || '';
    let initialArticle = articleSlug || '';
    
    if (initialSub && categoryChildren.length > 0) {
      const exists = categoryChildren.some(sub => sub.slug === initialSub);
      if (!exists) initialSub = '';
    }
    
    if (initialArticle && categoryChildren.length > 0) {
      let exists = false;
      for (const sub of categoryChildren) {
        if (sub.articles && sub.articles.some(art => art.slug === initialArticle)) {
          exists = true;
          break;
        }
      }
      if (!exists) initialArticle = '';
    }
    
    setTempFilters({
      subCategory: initialSub,
      article: initialArticle,
      searchTerm: initialSearchTerm || '',
      wilaya: initialWilaya || '',
      commune: initialCommune || '',
      priceMin: min,
      priceMax: max,
      sortBy: initialSortBy || 'recent'
    });
    
    setPriceRange([min, max]);
  }, [localFilterMetadata, subSlug, articleSlug, initialWilaya, initialCommune, initialSearchTerm, initialSortBy, categoryChildren]);

  useEffect(() => {
    if (!loadingChildren) {
      initializeFilters();
    }
  }, [initializeFilters, loadingChildren]);

  // ============ HANDLERS ============
  const handleFilterChange = (key, value) => {
    console.log(`🔄 Cambiando filtro ${key}:`, value);
    setTempFilters(prev => ({ ...prev, [key]: value }));
    
    if (key === 'subCategory') {
      setTempFilters(prev => ({ ...prev, article: '' }));
    }
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setTempFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceRangeChange = (values) => {
    setPriceRange(values);
    setTempFilters(prev => ({
      ...prev,
      priceMin: values[0],
      priceMax: values[1]
    }));
  };

  // ✅ APLICAR FILTROS
  const applyFilters = () => {
    console.log('🎯 Aplicando filtros desde drawer:', tempFilters);
    
    const filtersToApply = {
      subCategory: tempFilters.subCategory,
      article: tempFilters.article,
      searchTerm: tempFilters.searchTerm,
      wilaya: tempFilters.wilaya,
      commune: tempFilters.commune,
      priceMin: tempFilters.priceMin,
      priceMax: tempFilters.priceMax,
      sortBy: tempFilters.sortBy
    };
    
    if (onApplyFilters && typeof onApplyFilters === 'function') {
      onApplyFilters(filtersToApply);
    }
    
    onHide();
  };

  const resetFilters = () => {
    const min = localFilterMetadata?.priceRange?.min ?? 0;
    const max = localFilterMetadata?.priceRange?.max ?? 1000000;
    
    setTempFilters({
      subCategory: '',
      article: '',
      searchTerm: '',
      wilaya: '',
      commune: '',
      priceMin: min,
      priceMax: max,
      sortBy: 'recent'
    });
    setPriceRange([min, max]);
  };

  const countActiveFilters = () => {
    let count = 0;
    const defaultMin = localFilterMetadata?.priceRange?.min ?? 0;
    const defaultMax = localFilterMetadata?.priceRange?.max ?? 1000000;
    
    if (tempFilters.searchTerm && tempFilters.searchTerm !== '') count++;
    if (tempFilters.subCategory && tempFilters.subCategory !== '') count++;
    if (tempFilters.article && tempFilters.article !== '') count++;
    if (tempFilters.wilaya && tempFilters.wilaya !== '') count++;
    if (tempFilters.commune && tempFilters.commune !== '') count++;
    if (tempFilters.priceMin !== defaultMin) count++;
    if (tempFilters.priceMax !== defaultMax) count++;
    if (tempFilters.sortBy !== 'recent') count++;
    
    return count;
  };

  const getArticlesForSelect = () => {
    if (!tempFilters.subCategory) return [];
    const selectedSub = categoryChildren.find(sub => sub.slug === tempFilters.subCategory);
    return selectedSub?.articles || [];
  };

  const isMobile = windowWidth <= 768;

  // ✅ OPCIONES DE ORDENAMIENTO
  const getSortOptions = () => {
    if (isVideo) {
      return [
        { value: 'recent', label: 'Plus récentes', icon: '🕐' },
        { value: 'popular', label: 'Plus vues', icon: '👁️' },
        { value: 'liked', label: 'Plus aimées', icon: '❤️' }
      ];
    }
    if (isBoutique) {
      return [
        { value: 'recent', label: 'Plus récentes', icon: '🕐' },
        { value: 'popular', label: 'Plus visitées', icon: '👁️' },
        { value: 'rating', label: 'Mieux notées', icon: '⭐' }
      ];
    }
    return [
      { value: 'recent', label: 'Plus récents', icon: '🕐' },
      { value: 'price_asc', label: 'Prix croissant', icon: '💰' },
      { value: 'price_desc', label: 'Prix décroissant', icon: '💎' }
    ];
  };

  const sortOptions = getSortOptions();

  // ============ RENDER PARA VIDEOS (desde la izquierda) ============
  if (isVideo) {
    return (
      <Offcanvas 
        show={show} 
        onHide={onHide} 
        placement="start"
        style={{ width: isMobile ? '100%' : '400px', maxWidth: '100%' }}
      >
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconCircle}>
              <Funnel size={18} color="#667eea" />
            </div>
            <h6 style={styles.headerTitle}>Filtrer les vidéos</h6>
          </div>
          <button onClick={onHide} style={styles.iconButton}>
            <XLg size={16} color="#666" />
          </button>
        </div>
        
        <Offcanvas.Body style={styles.body}>
          {/* BÚSQUEDA POR TÍTULO */}
          <Accordion defaultActiveKey="0" style={styles.accordion}>
            <Accordion.Item eventKey="0" style={styles.accordionItem}>
              <Accordion.Header>
                <div style={styles.accordionTitle}>
                  <Search size={16} color="#667eea" style={{ marginRight: '8px' }} />
                  <span>Recherche</span>
                </div>
              </Accordion.Header>
              <Accordion.Body style={styles.accordionBody}>
                <Form.Label style={styles.label}>Titre ou mot-clé</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Rechercher une vidéo..."
                  value={tempFilters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  style={styles.searchInput}
                />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* CATEGORÍAS */}
          {categoryChildren.length > 0 && (
            <Accordion defaultActiveKey="1" style={styles.accordion}>
              <Accordion.Item eventKey="1" style={styles.accordionItem}>
                <Accordion.Header>
                  <div style={styles.accordionTitle}>
                    <span>📁 Catégories</span>
                    <span style={styles.countBadge}>{categoryChildren.length}</span>
                  </div>
                </Accordion.Header>
                <Accordion.Body style={styles.accordionBody}>
                  <Form.Label style={styles.label}>Sous-catégorie</Form.Label>
                  <Form.Select
                    value={tempFilters.subCategory}
                    onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Toutes les catégories</option>
                    {categoryChildren.map(sub => (
                      <option key={sub._id} value={sub.slug}>
                        {sub.name}
                        {sub.count ? ` (${sub.count})` : ''}
                      </option>
                    ))}
                  </Form.Select>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          )}

          {/* ORDENAMIENTO */}
          <Accordion defaultActiveKey="2" style={styles.accordion}>
            <Accordion.Item eventKey="2" style={styles.accordionItem}>
              <Accordion.Header>
                <div style={styles.accordionTitle}>
                  <SortDown size={16} color="#667eea" style={{ marginRight: '8px' }} />
                  <span>Trier par</span>
                </div>
              </Accordion.Header>
              <Accordion.Body style={styles.accordionBody}>
                <div style={styles.sortOptions}>
                  {sortOptions.map(option => (
                    <div
                      key={option.value}
                      onClick={() => handleFilterChange('sortBy', option.value)}
                      style={{
                        ...styles.sortOption,
                        backgroundColor: tempFilters.sortBy === option.value ? '#f0f3ff' : 'white',
                        borderColor: tempFilters.sortBy === option.value ? '#667eea' : '#e9ecef'
                      }}
                    >
                      <div style={styles.sortOptionLeft}>
                        <span style={styles.sortIcon}>{option.icon}</span>
                        <span style={styles.sortLabel}>{option.label}</span>
                      </div>
                      {tempFilters.sortBy === option.value && (
                        <Check2 size={16} color="#667eea" />
                      )}
                    </div>
                  ))}
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Offcanvas.Body>
        
        <div style={styles.footer}>
          <Button variant="outline-secondary" onClick={resetFilters} style={styles.resetButton}>
            Réinitialiser
          </Button>
          <Button variant="primary" onClick={applyFilters} style={styles.applyButton}>
            Appliquer ({countActiveFilters()})
          </Button>
        </div>
      </Offcanvas>
    );
  }

  // ============ RENDER LOADING ============
  if (loadingChildren) {
    return (
      <Offcanvas show={show} onHide={onHide} placement="start" style={{ width: isMobile ? '100%' : '400px', maxWidth: '100%' }}>
        <div style={styles.loadingContainer}>
          <Spinner animation="border" variant="primary" />
          <p style={styles.loadingText}>Chargement des filtres...</p>
        </div>
      </Offcanvas>
    );
  }

  // ============ RENDER ERROR ============
  if (error) {
    return (
      <Offcanvas show={show} onHide={onHide} placement="start" style={{ width: isMobile ? '100%' : '400px', maxWidth: '100%' }}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <h6 style={styles.errorTitle}>Erreur</h6>
          <p style={styles.errorText}>{error}</p>
          <Button variant="outline-primary" size="sm" onClick={() => window.location.reload()} style={styles.errorButton}>
            Réessayer
          </Button>
        </div>
      </Offcanvas>
    );
  }

  // ============ RENDER PRINCIPAL ============
  return (
    <Offcanvas show={show} onHide={onHide} placement="start" style={{ width: isMobile ? '100%' : '400px', maxWidth: '100%' }}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconCircle}>
            <Funnel size={18} color="#667eea" />
          </div>
          <h6 style={styles.headerTitle}>Filtres</h6>
          {countActiveFilters() > 0 && <span style={styles.badge}>{countActiveFilters()}</span>}
        </div>
        <div style={styles.headerRight}>
          <button onClick={resetFilters} style={styles.iconButton} title="Réinitialiser">
            <ArrowCounterclockwise size={16} color="#666" />
          </button>
          <button onClick={onHide} style={styles.iconButton} title="Fermer">
            <XLg size={16} color="#666" />
          </button>
        </div>
      </div>

      <Offcanvas.Body style={styles.body}>
        {/* CATEGORÍAS */}
        {categoryChildren.length > 0 && !isBoutique && (
          <Accordion defaultActiveKey="0" style={styles.accordion}>
            <Accordion.Item eventKey="0" style={styles.accordionItem}>
              <Accordion.Header>
                <div style={styles.accordionTitle}>
                  <span>Catégories</span>
                  <span style={styles.countBadge}>{categoryChildren.length}</span>
                </div>
              </Accordion.Header>
              <Accordion.Body style={styles.accordionBody}>
                <Form.Label style={styles.label}>Sous-catégorie</Form.Label>
                <Form.Select
                  value={tempFilters.subCategory}
                  onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                  style={styles.select}
                >
                  <option value="">Toutes les sous-catégories</option>
                  {categoryChildren.map(sub => (
                    <option key={sub._id} value={sub.slug}>
                      {sub.name}
                      {sub.postCount ? ` (${sub.postCount})` : ''}
                    </option>
                  ))}
                </Form.Select>

                {tempFilters.subCategory && getArticlesForSelect().length > 0 && (
                  <>
                    <Form.Label style={{...styles.label, marginTop: '20px'}}>Article</Form.Label>
                    <Form.Select
                      value={tempFilters.article}
                      onChange={(e) => handleFilterChange('article', e.target.value)}
                      style={styles.select}
                    >
                      <option value="">Tous les articles</option>
                      {getArticlesForSelect().map(article => (
                        <option key={article._id} value={article.slug}>
                          {article.name}
                        </option>
                      ))}
                    </Form.Select>
                  </>
                )}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        )}

        {/* LOCALISATION */}
        {!isBoutique && !isVideo && (
          <Accordion defaultActiveKey="1" style={styles.accordion}>
            <Accordion.Item eventKey="1" style={styles.accordionItem}>
              <Accordion.Header>
                <div style={styles.accordionTitle}>
                  <GeoAlt size={16} color="#667eea" style={{ marginRight: '8px' }} />
                  <span>Localisation</span>
                </div>
              </Accordion.Header>
              <Accordion.Body style={styles.accordionBody}>
              
                <Form.Text className="text-muted" style={{ fontSize: '11px', display: 'block', marginTop: '6px' }}>
                  Sélectionnez une wilaya pour voir les communes disponibles
                </Form.Text>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        )}

        {/* PRIX */}
        {!isBoutique && !isVideo && (
          <Accordion defaultActiveKey="2" style={styles.accordion}>
            <Accordion.Item eventKey="2" style={styles.accordionItem}>
              <Accordion.Header>
                <div style={styles.accordionTitle}>
                  <CurrencyEuro size={16} color="#667eea" style={{ marginRight: '8px' }} />
                  <span>Prix</span>
                </div>
              </Accordion.Header>
              <Accordion.Body style={styles.accordionBody}>
                <div style={styles.priceRangeContainer}>
                  <Slider
                    range
                    min={localFilterMetadata.priceRange.min}
                    max={localFilterMetadata.priceRange.max}
                    step={1000}
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    trackStyle={[{ backgroundColor: '#667eea', height: '4px' }]}
                    handleStyle={[
                      { borderColor: '#667eea', backgroundColor: '#667eea', width: '18px', height: '18px', marginTop: '-7px', boxShadow: '0 2px 4px rgba(102,126,234,0.3)' },
                      { borderColor: '#667eea', backgroundColor: '#667eea', width: '18px', height: '18px', marginTop: '-7px', boxShadow: '0 2px 4px rgba(102,126,234,0.3)' }
                    ]}
                    railStyle={{ backgroundColor: '#e9ecef', height: '4px' }}
                  />
                  <div style={styles.priceInputs}>
                    <div style={styles.priceInputGroup}>
                      <span style={styles.priceLabel}>Min</span>
                      <div style={styles.priceInputWrapper}>
                        <span style={styles.priceCurrency}>DA</span>
                        <input
                          type="number"
                          value={tempFilters.priceMin}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleFilterChange('priceMin', val);
                            setPriceRange([Number(val) || localFilterMetadata.priceRange.min, priceRange[1]]);
                          }}
                          placeholder={localFilterMetadata.priceRange.min.toString()}
                          style={styles.priceInput}
                        />
                      </div>
                    </div>
                    <div style={styles.priceSeparator}><span>−</span></div>
                    <div style={styles.priceInputGroup}>
                      <span style={styles.priceLabel}>Max</span>
                      <div style={styles.priceInputWrapper}>
                        <span style={styles.priceCurrency}>DA</span>
                        <input
                          type="number"
                          value={tempFilters.priceMax}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleFilterChange('priceMax', val);
                            setPriceRange([priceRange[0], Number(val) || localFilterMetadata.priceRange.max]);
                          }}
                          placeholder={localFilterMetadata.priceRange.max.toString()}
                          style={styles.priceInput}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        )}

        {/* ORDENAMIENTO */}
        <Accordion defaultActiveKey="3" style={styles.accordion}>
          <Accordion.Item eventKey="3" style={styles.accordionItem}>
            <Accordion.Header>
              <div style={styles.accordionTitle}>
                <SortDown size={16} color="#667eea" style={{ marginRight: '8px' }} />
                <span>Trier par</span>
              </div>
            </Accordion.Header>
            <Accordion.Body style={styles.accordionBody}>
              <div style={styles.sortOptions}>
                {sortOptions.map(option => (
                  <div
                    key={option.value}
                    onClick={() => handleFilterChange('sortBy', option.value)}
                    style={{
                      ...styles.sortOption,
                      backgroundColor: tempFilters.sortBy === option.value ? '#f0f3ff' : 'white',
                      borderColor: tempFilters.sortBy === option.value ? '#667eea' : '#e9ecef'
                    }}
                  >
                    <div style={styles.sortOptionLeft}>
                      <span style={styles.sortIcon}>{option.icon}</span>
                      <span style={styles.sortLabel}>{option.label}</span>
                    </div>
                    {tempFilters.sortBy === option.value && <Check2 size={16} color="#667eea" />}
                  </div>
                ))}
              </div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Offcanvas.Body>

      {/* FOOTER */}
      <div style={styles.footer}>
        <Button variant="outline-secondary" onClick={resetFilters} style={styles.resetButton}>
          Réinitialiser
        </Button>
        <Button variant="primary" onClick={applyFilters} style={styles.applyButton}>
          Appliquer ({countActiveFilters()})
        </Button>
      </div>
    </Offcanvas>
  );
};

// ============ ESTILOS ============
const styles = {
  loadingContainer: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  loadingText: { marginTop: '16px', color: '#666', fontSize: '14px' },
  errorContainer: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' },
  errorIcon: { fontSize: '48px', marginBottom: '16px' },
  errorTitle: { fontSize: '18px', fontWeight: '600', color: '#dc3545', marginBottom: '8px' },
  errorText: { fontSize: '14px', color: '#666', marginBottom: '20px', maxWidth: '280px' },
  errorButton: { borderRadius: '20px', padding: '8px 24px' },
  header: { padding: '16px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  iconCircle: { width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f0f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' },
  badge: { backgroundColor: '#667eea', color: 'white', fontSize: '11px', fontWeight: '600', padding: '2px 6px', borderRadius: '12px', marginLeft: '4px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  iconButton: { width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e9ecef', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' },
  body: { padding: '16px', backgroundColor: '#f8f9fa', flex: 1, overflowY: 'auto' },
  accordion: { marginBottom: '12px', borderRadius: '12px', overflow: 'hidden', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  accordionItem: { border: 'none', backgroundColor: 'white' },
  accordionTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', color: '#333' },
  accordionBody: { padding: '16px', backgroundColor: 'white', borderTop: '1px solid #e9ecef' },
  label: { fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#495057', display: 'block' },
  select: { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e9ecef', fontSize: '14px', color: '#333', backgroundColor: 'white', cursor: 'pointer', outline: 'none' },
  searchInput: { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e9ecef', fontSize: '14px', outline: 'none', transition: 'all 0.2s' },
  countBadge: { backgroundColor: '#e9ecef', color: '#666', fontSize: '11px', fontWeight: '600', padding: '2px 6px', borderRadius: '10px', marginLeft: '8px' },
  priceRangeContainer: { padding: '8px 0' },
  priceInputs: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px' },
  priceInputGroup: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  priceLabel: { fontSize: '12px', color: '#666', marginLeft: '4px' },
  priceInputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  priceCurrency: { position: 'absolute', left: '10px', fontSize: '12px', color: '#999' },
  priceInput: { width: '100%', padding: '10px 10px 10px 30px', borderRadius: '8px', border: '1px solid #e9ecef', fontSize: '13px', outline: 'none' },
  priceSeparator: { color: '#666', fontSize: '18px', marginTop: '16px' },
  sortOptions: { display: 'flex', flexDirection: 'column', gap: '8px' },
  sortOption: { padding: '12px 16px', border: '1px solid #e9ecef', borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' },
  sortOptionLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  sortIcon: { fontSize: '16px' },
  sortLabel: { fontSize: '14px', color: '#333' },
  footer: { padding: '16px 20px', borderTop: '1px solid #e9ecef', backgroundColor: 'white', display: 'flex', gap: '12px' },
  resetButton: { flex: 1, padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', border: '1px solid #e9ecef', backgroundColor: 'white', color: '#666', cursor: 'pointer' },
  applyButton: { flex: 1, padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', border: 'none', backgroundColor: '#667eea', color: 'white', cursor: 'pointer' }
};

export default FilterDrawer;