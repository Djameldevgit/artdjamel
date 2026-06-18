import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';
import { getDataAPI } from "../utils/fetchData";
import Posts from "../components/home/Posts";
import LoadIcon from "../images/loading.gif";

// 🔷 COMPONENTES ESENCIALES PARA BÚSQUEDA
import SubCategoryTelephone from '../components/forms/Telephone/SubCategoryTelephone';
import SubCategoryVetements from '../components/forms/vetements/SubCategoryVetements';

import {
  Container,
  Form,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
  Card,
  Badge,
  Collapse,
} from "react-bootstrap";

export default function SearchPage() {
  const { t, i18n } = useTranslation('search');
  const languageReducer = useSelector(state => state.languageReducer);
  
  const isRTL = i18n.language === 'ar';
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  
  useEffect(() => {
    const lang = languageReducer?.language || 'fr';
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [languageReducer?.language, i18n]);

  // 🔹 Estados para filtros SIMPLIFICADOS
  const [filters, setFilters] = useState({
    category: "",        // vetements o telephones
    subCategory: "",    // Subcategoría dinámica según categoría
    tipoArticulo: "",   // Tipo de artículo
    latest: false       // Últimos productos
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const { auth } = useSelector((state) => state);

  // 🔹 Buscar productos
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const queryParams = new URLSearchParams();
      
      // 🔥 SOLO 3 FILTROS PRINCIPALES
      if (filters.category.trim()) queryParams.append('category', filters.category.trim());
      if (filters.subCategory.trim()) queryParams.append('subCategory', filters.subCategory.trim());
      if (filters.tipoArticulo.trim()) queryParams.append('tipoArticulo', filters.tipoArticulo.trim());
      
      if (filters.latest) queryParams.append('sort', '-createdAt');
      
      const queryString = queryParams.toString();
      const url = `posts${queryString ? `?${queryString}` : ''}`;
      
      const res = await getDataAPI(url, auth.token);
      setResults(res.data.posts || []);
      
    } catch (err) {
      console.error("Error en búsqueda:", err);
      setError(err.response?.data?.message || err.message || t('errors.searchError', 'Erreur de recherche'));
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Buscar últimos productos
  const handleLatestProducts = () => {
    setFilters(prev => ({
      ...prev,
      latest: true,
      category: "",
      subCategory: "",
      tipoArticulo: ""
    }));
  };

  useEffect(() => {
    if (filters.latest) {
      handleSearch();
    }
  }, [filters.latest]);

  // 🔹 Manejo de filtros
  const updateFilter = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      latest: false // Desactivar latest cuando se usan otros filtros
    }));

    // 🔥 RESETEAR SUBCATEGORÍA Y TIPOARTICULO CUANDO CAMBIA CATEGORÍA
    if (field === 'category') {
      setFilters(prev => ({
        ...prev,
        subCategory: "",
        tipoArticulo: "",
        latest: false
      }));
    }

    // 🔥 BUSCAR AUTOMÁTICAMENTE AL SELECCIONAR CATEGORÍA/SUBCATEGORÍA
    if (field === 'category' || field === 'subCategory' || field === 'tipoArticulo') {
      setTimeout(() => handleSearch(), 300);
    }
  };

  // 🔹 Limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      category: "",
      subCategory: "",
      tipoArticulo: "",
      latest: false
    });
    setResults([]);
    setError(null);
    setShowAdvancedSearch(false);
  };

  // 🔹 Renderizar componente de subcategoría según categoría seleccionada
  const renderSubCategoryComponent = () => {
    const props = {
      postData: filters,
      handleChangeInput: (e) => {
        const fieldName = e.target.name;
        const value = e.target.value;
        updateFilter(fieldName, value);
      }
    };

    switch (filters.category) {
      case 'vetements':
        return <SubCategoryVetements {...props} />;
      case 'telephones':
        return <SubCategoryTelephone {...props} />;
      default:
        return null;
    }
  };

  // 🔹 Renderizar opciones de tipoArticulo según categoría
  const renderTipoArticuloOptions = () => {
    // Esto depende de cómo tengas configurado el campo tipoArticulo en tu backend
    // Aquí te pongo un ejemplo básico
    const options = {
      vetements: ['Nuevo', 'Usado', 'Vintage', 'Colección'],
      telephones: ['Nuevo', 'Seminuevo', 'Usado', 'Reacondicionado'],
      default: ['Nuevo', 'Usado']
    };

    const currentOptions = options[filters.category] || options.default;

    return (
      <Form.Select
        name="tipoArticulo"
        value={filters.tipoArticulo}
        onChange={(e) => updateFilter('tipoArticulo', e.target.value)}
        size="sm"
        disabled={!filters.category}
      >
        <option value="">{t('labels.selectType', 'Tipo de artículo')}</option>
        {currentOptions.map((option, index) => (
          <option key={index} value={option.toLowerCase()}>
            {option}
          </option>
        ))}
      </Form.Select>
    );
  };

  // 🔹 Contador de filtros activos
  const activeFiltersCount = [
    filters.category,
    filters.subCategory,
    filters.tipoArticulo,
    filters.latest
  ].filter(Boolean).length;

  return (
    <Container fluid className="px-0" dir={isRTL ? "rtl" : "ltr"}>
      {/* 🔹 BÚSQUEDA PRINCIPAL - LAYOUT MEJORADO */}
      <Card className="shadow-sm border-0 rounded-0 mb-2">
        <Card.Body className="p-3">
          <Form onSubmit={handleSearch}>
            
            {/* 🆕 FILA 1: CATEGORÍA + SUBCATEGORÍA + TIPOARTICULO */}
            <Row className={`g-3 align-items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
              
              {/* 🔥 COLUMNA 1 - CATEGORÍA PRINCIPAL */}
              <Col xl={3} lg={3} md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-2">
                    📂 {t('labels.mainCategory', 'Categoría Principal')}
                  </Form.Label>
                  <Form.Select
                    name="category"
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    size="sm"
                  >
                    <option value="">{t('labels.selectCategory', 'Seleccionar categoría')}</option>
                    <option value="vetements">👕 {t('categories.clothing', 'Vestimenta')}</option>
                    <option value="telephones">📱 {t('categories.phones', 'Teléfonos')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* 🔥 COLUMNA 2 - SUBCATEGORÍA DINÁMICA */}
              <Col xl={3} lg={3} md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-2">
                    🏷️ {t('labels.subCategory', 'Subcategoría')}
                  </Form.Label>
                  {filters.category ? (
                    renderSubCategoryComponent()
                  ) : (
                    <Form.Select disabled size="sm">
                      <option>{t('labels.selectCategoryFirst', 'Selecciona categoría primero')}</option>
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>

              {/* 🔥 COLUMNA 3 - TIPO DE ARTÍCULO */}
              <Col xl={3} lg={3} md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-2">
                    🏷️ {t('labels.itemType', 'Tipo de artículo')}
                  </Form.Label>
                  {renderTipoArticuloOptions()}
                </Form.Group>
              </Col>

            </Row>

            {/* 🆕 FILA 2: BÚSQUEDA AVANZADA Y BOTONES */}
            <Row className={`g-2 align-items-end mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              
              {/* BOTONES DE ACCIÓN */}
              <Col xl={4} lg={4} md={6} sm={12}>
                <div className={`d-flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Button 
                    variant="primary" 
                    onClick={handleSearch}
                    size="sm"
                    disabled={loading}
                    className="flex-fill"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className={isRTL ? "ms-2" : "me-2"} />
                        {t('buttons.searching', 'Buscando...')}
                      </>
                    ) : (
                      <>
                        <i className={`fas fa-search ${isRTL ? "ms-2" : "me-2"}`}></i>
                        {t('buttons.search', 'Buscar')}
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    size="sm"
                    className="d-flex align-items-center"
                  >
                    <i className={`fas ${showAdvancedSearch ? 'fa-filter' : 'fa-sliders-h'} ${isRTL ? "ms-2" : "me-2"}`}></i>
                    {t('buttons.filters', 'Filtros')}
                  </Button>

                  {activeFiltersCount > 0 && (
                    <Button 
                      variant="outline-danger" 
                      onClick={handleClearFilters}
                      size="sm"
                      className="d-flex align-items-center"
                    >
                      <i className={`fas fa-times ${isRTL ? "ms-2" : "me-2"}`}></i>
                      {t('buttons.clear', 'Limpiar')}
                    </Button>
                  )}
                </div>
              </Col>

              {/* BOTÓN ÚLTIMOS PRODUCTOS */}
              <Col xl={3} lg={3} md={3} sm={6}>
                <Button 
                  variant="outline-info" 
                  onClick={handleLatestProducts}
                  size="sm"
                  disabled={filters.latest}
                  className="w-100 d-flex align-items-center justify-content-center"
                >
                  <i className={`fas fa-clock ${isRTL ? "ms-2" : "me-2"}`}></i>
                  {t('buttons.latestProducts', 'Últimos productos')}
                </Button>
              </Col>

            </Row>

            {/* 🔹 BÚSQUEDA AVANZADA - COLLAPSE MEJORADO */}
            <Collapse in={showAdvancedSearch}>
              <div className="mt-3 pt-3 border-top">
                <Row className={`g-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  
                  {/* INFORMACIÓN ADICIONAL */}
                  <Col xl={12} lg={12} md={12} sm={12}>
                    <Alert variant="info" className="py-2 mb-0">
                      <small>
                        <i className={`fas fa-info-circle ${isRTL ? "ms-2" : "me-2"}`}></i>
                        {t('messages.advancedSearchInfo', 'Actualmente los filtros están simplificados a categoría, subcategoría y tipo de artículo para una mejor experiencia.')}
                      </small>
                    </Alert>
                  </Col>

                </Row>
              </div>
            </Collapse>

            {/* 🔹 FILTROS ACTIVOS MEJORADO */}
            {activeFiltersCount > 0 && (
              <div className="mt-3 pt-3 border-top">
                <div className={`d-flex align-items-center flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <small className={`text-muted ${isRTL ? "ms-2" : "me-2"}`}>
                    <strong>{activeFiltersCount}</strong> {t('labels.filtersActive', 'filtros activos')}:
                  </small>
                  
                  {filters.category && (
                    <Badge bg="primary" className={isRTL ? "ms-1 mb-1" : "me-1 mb-1"}>
                      📂 {filters.category === 'vetements' ? '👕 Vestimenta' : '📱 Teléfonos'}
                    </Badge>
                  )}
                  
                  {filters.subCategory && (
                    <Badge bg="info" className={isRTL ? "ms-1 mb-1" : "me-1 mb-1"}>
                      🏷️ {filters.subCategory}
                    </Badge>
                  )}
                  
                  {filters.tipoArticulo && (
                    <Badge bg="warning" className={isRTL ? "ms-1 mb-1" : "me-1 mb-1"}>
                      🏷️ {filters.tipoArticulo}
                    </Badge>
                  )}
                  
                  {filters.latest && (
                    <Badge bg="secondary" className={isRTL ? "ms-1 mb-1" : "me-1 mb-1"}>
                      ⏰ Últimos
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>

      {/* 🔹 CONTENIDO PRINCIPAL - RESULTADOS */}
      <Container fluid className="px-0">
        {/* 🔹 Indicadores de Resultados */}
        {results.length > 0 && (
          <Alert variant="success" className="py-2 px-3 d-flex align-items-center mb-2">
            <i className={`fas fa-check-circle ${isRTL ? "ms-2" : "me-2"} fs-6`}></i>
            <small className="fw-semibold">
              <strong>{results.length}</strong> {t('results.resultsFound', 'productos encontrados')}
            </small>
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className="py-2 px-3 d-flex align-items-center mb-2">
            <i className={`fas fa-exclamation-triangle ${isRTL ? "ms-2" : "me-2"} fs-6`}></i>
            <small>{error}</small>
          </Alert>
        )}

        {/* 🔹 Lista de Posts */}
        <div>
          {loading ? (
            <Card className="text-center border-0">
              <Card.Body className="p-4">
                <img src={LoadIcon} alt="loading" width="40" className="mb-2" />
                <h6 className="text-muted mb-1">{t('states.searching', 'Buscando...')}</h6>
              </Card.Body>
            </Card>
          ) : (
            <Posts posts={results.length > 0 ? results : null} filters={filters} />
          )}
        </div>
      </Container>
    </Container>
  );
}