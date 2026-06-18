// src/pages/Home.jsx - VERSIÓN LIMPIA Y TRADUCIDA

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { 
  getAllCategoriesWithPosts, 
  loadMoreCategories,
  getSliderCategories
} from '../redux/actions/categoryAction';
import { getBoutiquesForHome } from '../redux/actions/boutiqueAction';
import { 
  Container, 
  Spinner, 
  Alert,
  Button,
  Row,
  Col,
  Badge
} from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroll-component';
import MainCategorySlider from '../components/SlidersCategories/CategorySlider';
import HeaderCarousel from '../components/SlidersCategories/HeaderCarousel';
 
import PostCard from '../components/post-card/PostCard';
import BoutiquePostCard from '../components/boutique/BoutiquePostCard';
import { ArrowRight, ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
 
const Home = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const hasLoadedRef = useRef(false);
  const boutiqueSliderRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  const { theme = 'light' } = useSelector(state => state.theme || {});
  
  // Slider (todas las categorías)
  const {
    sliderCategories = [],
    sliderLoading = false
  } = useSelector((state) => state.category || {});
  
  // Scroll infinito (categorías con posts)
  const {
    categories = [],
    loading,
    
    hasMoreCategories,
   
  } = useSelector((state) => state.category || {});

  const { homeBoutiques = [] } = useSelector((state) => state.boutique || {});

  // Carga inicial
  useEffect(() => {
    if (hasLoadedRef.current) return;
    
    hasLoadedRef.current = true;
    
    // Cargar slider (todas las categorías)
    dispatch(getSliderCategories());
    
    // Cargar primeras 2 categorías con posts (scroll infinito)
    dispatch(getAllCategoriesWithPosts(1, 2));
    dispatch(getBoutiquesForHome(10));
    
    // Timeout de respaldo
    const timer = setTimeout(() => {
      if (!dataLoaded && !loading) {
        setInitialLoadDone(true);
        setDataLoaded(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [dispatch]);

  // Monitorear cuando los datos del scroll están listos
  useEffect(() => {
    if (categories.length > 0 && !loading && !dataLoaded) {
      setDataLoaded(true);
      setInitialLoadDone(true);
    }
  }, [categories, loading, dataLoaded]);

  // Verificar scroll de boutiques
  const checkScrollPosition = useCallback(() => {
    if (boutiqueSliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = boutiqueSliderRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    const slider = boutiqueSliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition();
      return () => slider.removeEventListener('scroll', checkScrollPosition);
    }
  }, [homeBoutiques, checkScrollPosition]);

  const scrollBoutiques = (direction) => {
    if (boutiqueSliderRef.current) {
      boutiqueSliderRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth'
      });
    }
  };

  // Scroll infinito
  const fetchMoreData = useCallback(() => {
    if (hasMoreCategories && !loading && dataLoaded) {
      dispatch(loadMoreCategories());
    }
  }, [dispatch, hasMoreCategories, loading, dataLoaded]);

  // Navegación
  const handleCategoryClick = (slugOrObject, categoryNameParam) => {
    let slug, categoryName;
    if (typeof slugOrObject === 'object') {
      slug = slugOrObject.slug;
      categoryName = slugOrObject.name || 'Catégorie';
    } else {
      slug = slugOrObject;
      categoryName = categoryNameParam || 'Catégorie';
    }
    if (slug) {
      history.push(`/${slug}`);
    }
  };

  const handleViewMore = (slug, categoryName) => {
    history.push(`/${slug}`, { fromHome: true, categoryName });
  };

  const handleViewAllBoutiques = () => {
    history.push('/boutiques/1');
  };

  const handleBoutiqueClick = (boutiqueId) => {
    history.push(`/boutique/${boutiqueId}`);
  };

  // Filtrar posts normales (excluir boutiques)
  const filterNormalPosts = (posts) => {
    if (!posts) return [];
    return posts.filter(post => !post.isFromBoutique);
  };

  // Filtrar categorías para el scroll (excluir boutiques)
  const filteredScrollCategories = categories.filter(category => {
    const categoryName = category.name?.toLowerCase() || '';
    const categorySlug = category.slug?.toLowerCase() || '';
    return categoryName !== 'boutique' && 
           categoryName !== 'boutiques' && 
           categorySlug !== 'boutique' && 
           categorySlug !== 'boutiques';
  });

  // Loading inicial
  if ((sliderLoading || loading) && categories.length === 0 && !dataLoaded) {
    return (
      <div className={`min-vh-100 d-flex flex-column ${theme === 'dark' ? 'bg-dark' : 'bg-light'}`}>
        <Container className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3 text-muted">Chargement des expériences uniques...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className={`min-vh-100 d-flex flex-column ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light'}`}>
      
      <HeaderCarousel />
      
      <main className="flex-grow-1">
        {/* Slider - Toutes les catégories */}
        <section>
          <Container>
            <MainCategorySlider 
              categories={sliderCategories}
              onCategoryClick={handleCategoryClick}  
            />
          </Container>
        </section>

        <Container className="py-1">
          {/* Section Boutiques */}
          {homeBoutiques.length > 0 && (
            <section className="mb-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h5 className="h4 fw-bold mb-0">Boutiques {homeBoutiques.length}</h5>
                </div>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-purple" 
                    className="rounded-circle p-2" 
                    onClick={() => scrollBoutiques('left')} 
                    disabled={!showLeftArrow} 
                    style={{ width: '40px', height: '40px' }}
                  >
                    <ChevronLeft size={20} />
                  </Button>
                  <Button 
                    variant="outline-purple" 
                    className="rounded-circle p-2" 
                    onClick={() => scrollBoutiques('right')} 
                    disabled={!showRightArrow} 
                    style={{ width: '40px', height: '40px' }}
                  >
                    <ChevronRight size={20} />
                  </Button>
                  <Button 
                    variant="outline-purple" 
                    className="rounded-pill px-4 ms-2" 
                    onClick={handleViewAllBoutiques}
                  >
                    Voir tout <ArrowRight className="ms-2" size={16} />
                  </Button>
                </div>
              </div>
              <div className="boutique-slider-container position-relative">
                <div 
                  className="boutique-slider d-flex gap-3 pb-3" 
                  ref={boutiqueSliderRef} 
                  style={{ overflowX: 'auto', scrollBehavior: 'smooth', scrollbarWidth: 'thin' }}
                >
                  {homeBoutiques.map((boutique) => (
                    <div 
                      key={boutique._id} 
                      className="boutique-slide" 
                      style={{ minWidth: '280px', maxWidth: '280px' }} 
                      onClick={() => handleBoutiqueClick(boutique._id)}
                    >
                      <BoutiquePostCard boutique={boutique} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Scroll Infinito - Sections avec posts */}
          <InfiniteScroll
            dataLength={filteredScrollCategories.length}
            next={fetchMoreData}
            hasMore={hasMoreCategories && dataLoaded}
            loader={
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Chargement de plus de catégories...</p>
              </div>
            }
            endMessage={
              <div className="text-center py-5">
                <i className="fas fa-flag-checkered fa-2x text-success mb-3"></i>
                <h4 className="h5 mb-2">Vous êtes arrivé à la fin !</h4>
                <p className="text-muted">Vous avez exploré toutes nos catégories</p>
              </div>
            }
            scrollThreshold={0.9}
          >
            {filteredScrollCategories.map((category) => {
              const normalPosts = filterNormalPosts(category.posts);
              
              return (
                <section key={category._id} className="mb-5">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <div className="category-icon bg-primary bg-opacity-10 rounded-3 p-3">
                          <i className="fas fa-tag text-primary" style={{ fontSize: '1.5rem' }}></i>
                        </div>
                        <div>
                          <h3 className="h4 fw-bold mb-0">{category.name}</h3>
                          <p className="text-muted mb-0">{normalPosts.length} produits</p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline-primary" 
                      className="rounded-pill px-4" 
                      onClick={() => handleViewMore(category.slug, category.name)}
                    >
                      Voir tout <ArrowRight className="ms-2" size={16} />
                    </Button>
                  </div>

                  {normalPosts.length > 0 ? (
                    <Row>
                      {normalPosts.slice(0, 6).map((post) => (
                        <Col key={post._id} xs={6} md={4} lg={2} className="mb-2">
                          <PostCard post={post} />
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Alert variant="info" className="text-center">
                      <i className="fas fa-info-circle me-2"></i>
                      Aucun produit disponible dans cette catégorie pour le moment
                    </Alert>
                  )}
                </section>
              );
            })}
          </InfiniteScroll>
        </Container>
      </main>

      <style jsx="true">{`
        .bg-purple { background-color: #8B5CF6; }
        .text-purple { color: #8B5CF6; }
        .btn-outline-purple { color: #8B5CF6; border-color: #8B5CF6; }
        .btn-outline-purple:hover { color: #fff; background-color: #8B5CF6; border-color: #8B5CF6; }
        .boutique-slider { overflow-x: auto; overflow-y: hidden; white-space: nowrap; cursor: grab; scrollbar-width: thin; padding: 5px 0; }
        .boutique-slider:active { cursor: grabbing; }
        .boutique-slider::-webkit-scrollbar { height: 6px; }
        .boutique-slider::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .boutique-slider::-webkit-scrollbar-thumb { background: #8B5CF6; border-radius: 10px; }
        .boutique-slide { transition: transform 0.2s; cursor: pointer; }
        .boutique-slide:hover { transform: translateY(-4px); }
        @media (max-width: 768px) { .boutique-slide { min-width: 240px !important; max-width: 240px !important; } }
      `}</style>
    </div>
  );
};

export default Home;