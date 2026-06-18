// PublicStoresPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Alert, Badge, Pagination } from 'react-bootstrap';
import { FaStore, FaSearch, FaFilter, FaStar, FaEye, FaHeart, FaMapMarkerAlt, FaShoppingBag } from 'react-icons/fa';

const PublicStoresPage = () => {
    const { category } = useParams();
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(parseInt(queryParams.get('page')) || 1);
    const [pages, setPages] = useState(1);
    
    const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
    const [selectedCity, setSelectedCity] = useState(queryParams.get('city') || '');
    const [selectedPlan, setSelectedPlan] = useState(queryParams.get('plan') || '');
    const [sortBy, setSortBy] = useState(queryParams.get('sort') || 'newest');
    
    useEffect(() => {
        fetchStores();
    }, [category, page, searchTerm, selectedCity, selectedPlan, sortBy]);
    
    const fetchStores = async () => {
        setLoading(true);
        try {
            let url = `/api/stores/public/all?page=${page}&limit=12&sort=${sortBy}`;
    
            if (category && category !== 'all') {
              url = `/api/stores/public/category/${category}?page=${page}&limit=12&sort=${sortBy}`;
            }
            
            if (searchTerm) url += `&q=${encodeURIComponent(searchTerm)}`;
            if (selectedCity) url += `&city=${encodeURIComponent(selectedCity)}`;
            if (selectedPlan) url += `&plan=${encodeURIComponent(selectedPlan)}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
              setStores(data.stores || []);
              setTotal(data.total || 0);
              setPages(data.pages || 1);
            } else {
              setError(data.msg || 'Error al cargar las boutiques');
            }
          } catch (err) {
            setError('Error de conexión');
            console.error('Error fetching stores:', err);
          } finally {
            setLoading(false);
          }
        };
    
    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedCity) params.set('city', selectedCity);
        if (selectedPlan) params.set('plan', selectedPlan);
        params.set('sort', sortBy);
        params.set('page', '1');
        history.push(`${location.pathname}?${params.toString()}`);
        setPage(1);
    };
    
    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(location.search);
        params.set('page', newPage);
        history.push(`${location.pathname}?${params.toString()}`);
        setPage(newPage);
        window.scrollTo(0, 0);
    };
    
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCity('');
        setSelectedPlan('');
        setSortBy('newest');
        history.push(location.pathname);
        setPage(1);
    };
    
    const renderStoreCard = (store) => {
        return (
            <Col key={store._id} lg={4} md={6} className="mb-4">
                <Card 
                    className="h-100 shadow-sm border-0 hover-lift cursor-pointer"
                    onClick={() => history.push(`/store/${store._id}`)}
                >
                    <Card.Body>
                        <div className="d-flex align-items-start mb-3">
                            {store.logoUrl ? (
                                <img 
                                    src={store.logoUrl} 
                                    alt={store.name}
                                    className="rounded-circle me-3"
                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                />
                            ) : (
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                     style={{ width: '60px', height: '60px' }}>
                                    <FaStore size={24} />
                                </div>
                            )}
                            <div className="flex-grow-1">
                                <h5 className="mb-1">{store.name}</h5>
                                <div className="d-flex align-items-center mb-2">
                                    <Badge bg={store.plan === 'Premium' ? 'warning' : 
                                              store.plan === 'Pro' ? 'info' : 'secondary'}
                                           className="me-2">
                                        {store.plan}
                                    </Badge>
                                    <span className="text-muted small">
                                        {store.category}
                                    </span>
                                </div>
                                {store.owner?.name && (
                                    <p className="text-muted small mb-0">
                                        <i className="fas fa-user me-1"></i>
                                        {store.owner.name}
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        <p className="text-muted small mb-4">
                            {store.description?.substring(0, 120) || 'Aucune description disponible.'}
                            {store.description?.length > 120 ? '...' : ''}
                        </p>
                        
                        <div className="d-flex justify-content-between small text-muted">
                            <div className="d-flex align-items-center">
                                <FaEye className="me-1" />
                                <span>{store.stats?.totalViews || 0}</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <FaHeart className="me-1 text-danger" />
                                <span>{store.stats?.totalFavorites || 0}</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <FaShoppingBag className="me-1" />
                                <span>{store.stats?.totalProducts || 0} produits</span>
                            </div>
                        </div>
                        
                        {store.address?.city && (
                            <div className="mt-3 pt-3 border-top d-flex align-items-center">
                                <FaMapMarkerAlt className="me-2 text-muted" />
                                <span className="small text-muted">
                                    {store.address.city}, {store.address.country}
                                </span>
                            </div>
                        )}
                    </Card.Body>
                    
                    <Card.Footer className="bg-transparent border-top-0 pt-0">
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                                Créée le {new Date(store.createdAt).toLocaleDateString('fr-FR')}
                            </small>
                            <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    history.push(`/store/${store._id}`);
                                }}
                            >
                                Visiter
                            </Button>
                        </div>
                    </Card.Footer>
                </Card>
            </Col>
        );
    };
    
    if (loading && stores.length === 0) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement des boutiques...</p>
            </Container>
        );
    }
    
    return (
        <Container fluid="lg" className="py-4">
            {/* Header */}
            <div className="mb-5">
                <h1 className="display-5 fw-bold mb-3">
                    <FaStore className="me-3 text-primary" />
                    {category ? `Boutiques - ${category}` : 'Toutes les Boutiques'}
                </h1>
                <div className="d-flex justify-content-between align-items-center">
                    <p className="lead text-muted mb-0">
                        Découvrez les meilleures boutiques professionnelles
                    </p>
                    <Badge bg="primary" className="fs-6 px-3 py-2">
                        {total} {total === 1 ? 'boutique' : 'boutiques'}
                    </Badge>
                </div>
            </div>
            
            {/* Filtros */}
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Form onSubmit={handleSearch}>
                        <Row className="g-3">
                            <Col md={5}>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <FaSearch />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Rechercher une boutique..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            
                            <Col md={3}>
                                <Form.Select 
                                    value={selectedCity} 
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                >
                                    <option value="">Toutes les villes</option>
                                    <option value="Alger">Alger</option>
                                    <option value="Oran">Oran</option>
                                    <option value="Constantine">Constantine</option>
                                </Form.Select>
                            </Col>
                            
                            <Col md={2}>
                                <Form.Select 
                                    value={selectedPlan} 
                                    onChange={(e) => setSelectedPlan(e.target.value)}
                                >
                                    <option value="">Tous les plans</option>
                                    <option value="Free">Gratuit</option>
                                    <option value="Pro">Pro</option>
                                    <option value="Premium">Premium</option>
                                </Form.Select>
                            </Col>
                            
                            <Col md={2}>
                                <Form.Select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="newest">Plus récentes</option>
                                    <option value="views">Plus vues</option>
                                    <option value="favorites">Plus populaires</option>
                                    <option value="products">Plus de produits</option>
                                </Form.Select>
                            </Col>
                        </Row>
                        
                        <div className="d-flex justify-content-between mt-3">
                            <Button 
                                type="submit" 
                                variant="primary"
                            >
                                <FaSearch className="me-2" />
                                Rechercher
                            </Button>
                            
                            {(searchTerm || selectedCity || selectedPlan) && (
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={clearFilters}
                                >
                                    Effacer les filtres
                                </Button>
                            )}
                        </div>
                    </Form>
                </Card.Body>
            </Card>
            
            {/* Error */}
            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}
            
            {/* Stores Grid */}
            {stores.length === 0 && !loading ? (
                <Card className="text-center shadow-sm border-0 py-5">
                    <Card.Body>
                        <FaStore size={64} className="text-muted mb-4" />
                        <h4 className="mb-3">Aucune boutique trouvée</h4>
                        <p className="text-muted mb-4">
                            {searchTerm 
                                ? `Aucune boutique ne correspond à votre recherche "${searchTerm}"`
                                : 'Aucune boutique disponible pour le moment.'
                            }
                        </p>
                        <Button 
                            variant="primary" 
                            onClick={clearFilters}
                        >
                            Voir toutes les boutiques
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <>
                    <Row className="g-4">
                        {stores.map(store => renderStoreCard(store))}
                    </Row>
                    
                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="d-flex justify-content-center mt-5">
                            <Pagination>
                                <Pagination.First 
                                    onClick={() => handlePageChange(1)} 
                                    disabled={page === 1}
                                />
                                <Pagination.Prev 
                                    onClick={() => handlePageChange(page - 1)} 
                                    disabled={page === 1}
                                />
                                
                                {[...Array(Math.min(5, pages))].map((_, idx) => {
                                    const pageNum = Math.max(1, Math.min(pages - 4, page - 2)) + idx;
                                    if (pageNum > pages) return null;
                                    
                                    return (
                                        <Pagination.Item
                                            key={pageNum}
                                            active={pageNum === page}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </Pagination.Item>
                                    );
                                })}
                                
                                <Pagination.Next 
                                    onClick={() => handlePageChange(page + 1)} 
                                    disabled={page === pages}
                                />
                                <Pagination.Last 
                                    onClick={() => handlePageChange(pages)} 
                                    disabled={page === pages}
                                />
                            </Pagination>
                        </div>
                    )}
                </>
            )}
        </Container>
    );
};

export default PublicStoresPage;