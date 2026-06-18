import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { getDataAPI } from "../utils/fetchData";
import { Form, Button, InputGroup, Spinner, Card, Row, Col, Badge } from "react-bootstrap";

const SearchInputPost = ({ 
  onSearchResults, 
  onSearchLoading,
  filters = {},
  onFiltersChange
}) => {
  const [searchText, setSearchText] = useState("");
  const [searching, setSearching] = useState(false);
  const timeoutRef = useRef(null);
  const abortRef = useRef(null);

  const { auth } = useSelector((state) => state);

  // 🔥 BÚSQUEDA SIMPLIFICADA
  const performSearch = async (text, currentFilters) => {
    if (!auth.token || !text.trim()) {
      onSearchResults?.([]);
      return;
    }

    // Cancelar búsqueda anterior
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      setSearching(true);
      onSearchLoading?.(true);

      const queryParams = new URLSearchParams();
      queryParams.append('search', text.trim().toLowerCase());

      // Solo filtros activos
      if (currentFilters.subCategory) queryParams.append('subCategory', currentFilters.subCategory);
      if (currentFilters.destinacion) queryParams.append('destinacion', currentFilters.destinacion);
      if (currentFilters.datedepar) queryParams.append('datedepar', currentFilters.datedepar);
      if (currentFilters.latest) queryParams.append('sort', '-createdAt');

      const url = `posts/search?${queryParams}`;
      const res = await getDataAPI(url, auth.token, {
        signal: abortRef.current.signal
      });

      // 🔥 IMPORTANTE: Pasar los resultados al callback
      onSearchResults?.(res.data.posts || []);
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Error en búsqueda:", err);
        onSearchResults?.([]);
      }
    } finally {
      setSearching(false);
      onSearchLoading?.(false);
    }
  };

  // 🔥 EFECTO ÚNICO
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (searchText.trim()) {
      timeoutRef.current = setTimeout(() => {
        performSearch(searchText, filters);
      }, 500);
    } else {
      onSearchResults?.([]);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [searchText, filters]);

  // 🔥 ACCIONES SIMPLES
  const clearSearch = () => {
    setSearchText("");
    onSearchResults?.([]);
  };

  const clearAll = () => {
    clearSearch();
    onFiltersChange?.({
      subCategory: "",
      destinacion: "", 
      datedepar: "",
      latest: false
    });
  };

  // 🔥 CONTADOR SIMPLE
  const activeFilters = [
    filters.subCategory,
    filters.destinacion, 
    filters.datedepar,
    filters.latest,
    searchText
  ].filter(Boolean).length;

  return (
    <Card className="shadow-sm border-primary border-2 rounded-0 mb-3 bg-light">
      <Card.Body className="p-3">
        <Form onSubmit={(e) => e.preventDefault()}>
          <Row className="g-2 align-items-center">
            <Col xl={10} lg={9} md={8}>
              <Form.Group className="mb-0">
                <Form.Label className="small fw-bold mb-1 text-primary">
                  <i className="fas fa-search me-1"></i>
                  Búsqueda Inteligente
                  {activeFilters > 0 && (
                    <Badge bg="warning" className="ms-1">{activeFilters}</Badge>
                  )}
                </Form.Label>
                
                <InputGroup size="sm">
                  <Form.Control
                    type="text"
                    placeholder="Buscar destinos, categorías, fechas..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  
                  {searchText && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={clearSearch}
                      disabled={searching}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  )}
                  
                  <Button 
                    variant={searching ? "warning" : "primary"}
                    disabled={!searchText.trim()}
                  >
                    {searching ? <Spinner size="sm" /> : <i className="fas fa-bolt"></i>}
                  </Button>
                </InputGroup>

                {/* FILTROS ACTIVOS */}
                {activeFilters > 0 && (
                  <div className="mt-2">
                    <small className="text-muted me-2">Filtros:</small>
                    {filters.subCategory && <Badge bg="info" className="me-1">{filters.subCategory}</Badge>}
                    {filters.destinacion && <Badge bg="success" className="me-1">{filters.destinacion}</Badge>}
                    {filters.datedepar && <Badge bg="warning" className="me-1">{filters.datedepar}</Badge>}
                    {searchText && <Badge bg="primary" className="me-1">"{searchText}"</Badge>}
                    
                    <Button variant="outline-danger" size="sm" onClick={clearAll}>
                      <i className="fas fa-times me-1"></i>Limpiar
                    </Button>
                  </div>
                )}
              </Form.Group>
            </Col>

            <Col xl={2} lg={3} md={4}>
              <div className="d-grid">
                <Button 
                  variant="outline-info" 
                  onClick={() => onFiltersChange?.({ ...filters, latest: true })}
                  size="sm"
                >
                  <i className="fas fa-bolt me-1"></i>Últimos
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SearchInputPost;