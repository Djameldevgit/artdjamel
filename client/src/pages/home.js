import React, {
  useEffect,
  useCallback,
  useMemo,
  useState
} from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroll-component';

import HomeSlider from '../components/HomeSlider';
import CategorySection from '../components/CategorySection';

import {
  getSliderCategories,
  getCategoriesWithVideos
} from '../redux/actions/categoryAction';

const Home = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { theme = 'light' } = useSelector(
    state => state.theme || {}
  );

  const {
    sliderCategories = [],
    sliderLoading = false,
    categoriesWithVideos = [],
    loadingCategoriesWithVideos = false,
    hasMoreCategoriesWithVideos = true,
    currentCategoriesPage = 1
  } = useSelector(state => state.category || {});

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // ===============================
  // CARGA INICIAL
  // ===============================
  useEffect(() => {
    if (sliderCategories.length === 0 && !sliderLoading) {
      dispatch(getSliderCategories());
    }

    if (categoriesWithVideos.length === 0 && !loadingCategoriesWithVideos) {
      dispatch(getCategoriesWithVideos(1, 3));
    }
  }, []);

  // ===============================
  // FIN CARGA INICIAL
  // ===============================
  useEffect(() => {
    if (categoriesWithVideos.length > 0) {
      setIsInitialLoad(false);
    }
  }, [categoriesWithVideos.length]);

  // ===============================
  // DATA DIRECTA REDUX
  // ===============================
  const allCategories = useMemo(
    () => categoriesWithVideos,
    [categoriesWithVideos]
  );

  // ✅ Filtrar categorías no deseadas (tutorials y channels) del feed principal
  const filteredCategories = useMemo(
    () => allCategories.filter(
      cat => cat.slug !== 'tutorials' && cat.slug !== 'channels'
    ),
    [allCategories]
  );

  const hasMore = hasMoreCategoriesWithVideos;
  const page = currentCategoriesPage;

  // ===============================
  // LOAD MORE
  // ===============================
  const fetchMoreCategories = useCallback(() => {
    if (loadingCategoriesWithVideos || !hasMore) return;
    dispatch(getCategoriesWithVideos(page + 1, 3));
  }, [dispatch, loadingCategoriesWithVideos, hasMore, page]);

  // ===============================
  // CLICK SLIDER
  // ===============================
  const handleCategoryClick = useCallback(
    category => {
      const slug = category?.slug || category;
      if (!slug) return;

      sessionStorage.setItem('returnToFeed', 'true');
      sessionStorage.setItem('scrollPosition', window.scrollY);
      history.push(`/${slug}/1`);
    },
    [history]
  );

  // ===============================
  // VIEW MORE
  // ===============================
  const handleViewMore = useCallback(
    (slug, categoryName) => {
      sessionStorage.setItem('returnToFeed', 'true');
      sessionStorage.setItem('scrollPosition', window.scrollY);
      history.push(`/${slug}/1`, { fromHome: true, categoryName });
    },
    [history]
  );

  // ===============================
  // RESTORE SCROLL
  // ===============================
  useEffect(() => {
    const pos = sessionStorage.getItem('scrollPosition');
    if (!pos) return;

    requestAnimationFrame(() => {
      window.scrollTo(0, parseInt(pos, 10));
      sessionStorage.removeItem('scrollPosition');
    });
  }, []);

  // ===============================
  // LOADING FIRST
  // ===============================
  const isLoading = isInitialLoad && loadingCategoriesWithVideos && allCategories.length === 0;

  if (isLoading) {
    return (
      <div className={`home-loading ${theme}`}>
        <Spinner animation="border" variant="primary" />
        <p>Chargement des catégories...</p>
      </div>
    );
  }

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className={`home-root ${theme}`}>
      <header className="home-header">
        <HomeSlider
          categories={sliderCategories}
          onCategoryClick={handleCategoryClick}
        />
      </header>

      <InfiniteScroll
        dataLength={filteredCategories.length}
        next={fetchMoreCategories}
        hasMore={hasMore && !loadingCategoriesWithVideos}
        loader={
          <div className="home-loader">
            <Spinner animation="border" size="sm" />
            <span>Chargement...</span>
          </div>
        }
        endMessage={
          filteredCategories.length > 0 && (
            <div className="home-end-msg">
              <p>✨ Toutes les catégories ont été chargées ✨</p>
            </div>
          )
        }
      >
        {filteredCategories.map(category => (
          <CategorySection
            key={category._id}
            category={category}
            videos={category.videos || []}
            onViewMore={handleViewMore}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default Home;