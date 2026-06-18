// src/pages/mesAnnoces.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Spinner, Alert, Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
//import { getProfileUsers } from '../redux/actions/profileAction';
 import { getProfileUsers } from '../../redux/actions/profileAction';

import { deletePost } from '../../redux/actions/postAction';
 import PostCard from '../../components/post-card/PostCard';
 
import { Pencil, Trash, Plus, Eye, Filter } from 'react-bootstrap-icons';
import InfiniteScroll from 'react-infinite-scroll-component';

const MesAnnoces = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  
  const { auth, profile } = useSelector(state => state);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, sold, expired
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const postsPerPage = 9;

  // Obtener el ID del usuario actual
  const userId = auth.user?._id;

  // Cargar posts del usuario
  useEffect(() => {
    if (!userId || !auth.token) return;

    const loadUserPosts = async () => {
      try {
        setLoading(true);
        console.log('📦 Cargando posts para usuario:', userId);
        
        // Verificar si ya tenemos los posts en el store
        const existingUserPosts = profile.posts.find(p => p._id === userId);
        
        if (!existingUserPosts) {
          // Si no están, los cargamos
          await dispatch(getProfileUsers({ id: userId, auth }));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error cargando posts:', error);
        setLoading(false);
      }
    };

    loadUserPosts();
  }, [userId, auth, dispatch, profile.posts]);

  // Extraer y procesar los posts del usuario desde el store
  useEffect(() => {
    if (userId && profile.posts.length > 0) {
      // Buscar el array de posts que corresponde a este usuario
      const userPostsData = profile.posts.find(p => p._id === userId);
      
      if (userPostsData && userPostsData.posts) {
        console.log(`✅ ${userPostsData.posts.length} posts encontrados para el usuario`);
        
        // Ordenar por fecha de creación (más recientes primero)
        const sortedPosts = [...userPostsData.posts].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setUserPosts(sortedPosts);
        filterPostsByStatus(sortedPosts, filterStatus);
      } else {
        setUserPosts([]);
        setFilteredPosts([]);
      }
    }
  }, [userId, profile.posts, filterStatus]);

  // Función para filtrar posts por estado
  const filterPostsByStatus = (posts, status) => {
    if (status === 'all') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => post.status === status);
      setFilteredPosts(filtered);
    }
    
    // Resetear paginación
    setPage(1);
    setHasMore(posts.length > postsPerPage);
  };

  // Manejar cambio de filtro
  const handleFilterChange = (status) => {
    setFilterStatus(status);
    filterPostsByStatus(userPosts, status);
  };

  // Manejar edición de post
  const handleEditPost = (postId, e) => {
    e.stopPropagation();
    history.push(`/edit-post/${postId}`);
  };

  // Manejar eliminación de post
  const handleDeletePost = async (postId, e) => {
    e.stopPropagation();
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este anuncio?')) {
      try {
        await dispatch(deletePost({ postId, auth }));
        
        // Actualizar la lista localmente
        const updatedPosts = userPosts.filter(post => post._id !== postId);
        setUserPosts(updatedPosts);
        filterPostsByStatus(updatedPosts, filterStatus);
        
      } catch (error) {
        console.error('Error eliminando post:', error);
        alert('Error al eliminar el anuncio');
      }
    }
  };

  // Marcar como vendido
  const handleMarkAsSold = async (postId, e) => {
    e.stopPropagation();
    
    if (window.confirm('¿Marcar este anuncio como vendido?')) {
      try {
        // Aquí llamarías a una acción para actualizar el estado del post
        // await dispatch(updatePostStatus({ postId, status: 'sold', auth }));
        
        // Actualizar localmente (ejemplo)
        const updatedPosts = userPosts.map(post => 
          post._id === postId ? { ...post, status: 'sold' } : post
        );
        setUserPosts(updatedPosts);
        filterPostsByStatus(updatedPosts, filterStatus);
        
      } catch (error) {
        console.error('Error actualizando estado:', error);
      }
    }
  };

  // Ver post
  const handleViewPost = (postId) => {
    history.push(`/post/${postId}`);
  };

  // Crear nuevo anuncio
  const handleCreatePost = () => {
    history.push('/creer-annonce');
  };

  // Cargar más posts para infinite scroll
  const loadMorePosts = useCallback(() => {
    if (filteredPosts.length > page * postsPerPage) {
      setPage(prev => prev + 1);
    } else {
      setHasMore(false);
    }
  }, [filteredPosts.length, page, postsPerPage]);

  // Posts a mostrar según la página actual
  const displayedPosts = filteredPosts.slice(0, page * postsPerPage);

  // Estadísticas
  const stats = {
    total: userPosts.length,
    active: userPosts.filter(p => p.status === 'active').length,
    sold: userPosts.filter(p => p.status === 'sold').length,
    expired: userPosts.filter(p => p.status === 'expired').length
  };

  // Estados de carga
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando tus anuncios...</p>
      </Container>
    );
  }

  // Verificar autenticación
  if (!auth.token || !userId) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <h4>Autenticación requerida</h4>
          <p>Por favor, inicia sesión para ver tus anuncios.</p>
          <Button variant="primary" onClick={() => history.push('/login')}>
            Iniciar sesión
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="mes-annoces-page">
      <Container className="py-4">
        {/* Header con título y botón crear */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="h3 fw-bold mb-1">Mis Anuncios</h2>
            <p className="text-muted mb-0">
              Gestiona todos tus anuncios publicados
            </p>
          </div>
          
          <Button 
            variant="primary" 
            className="rounded-pill px-4"
            onClick={handleCreatePost}
          >
            <Plus className="me-2" size={18} />
            Nuevo Anuncio
          </Button>
        </div>

        {/* Tarjetas de estadísticas */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <div className="stats-card bg-primary bg-opacity-10 rounded-3 p-3">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-primary bg-opacity-25 rounded-circle p-2 me-3">
                  <i className="fas fa-images text-primary"></i>
                </div>
                <div>
                  <small className="text-muted">Total</small>
                  <h4 className="mb-0 fw-bold">{stats.total}</h4>
                </div>
              </div>
            </div>
          </Col>
          
          <Col xs={6} md={3}>
            <div className="stats-card bg-success bg-opacity-10 rounded-3 p-3">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-success bg-opacity-25 rounded-circle p-2 me-3">
                  <i className="fas fa-check-circle text-success"></i>
                </div>
                <div>
                  <small className="text-muted">Activos</small>
                  <h4 className="mb-0 fw-bold">{stats.active}</h4>
                </div>
              </div>
            </div>
          </Col>
          
          <Col xs={6} md={3}>
            <div className="stats-card bg-warning bg-opacity-10 rounded-3 p-3">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-warning bg-opacity-25 rounded-circle p-2 me-3">
                  <i className="fas fa-tag text-warning"></i>
                </div>
                <div>
                  <small className="text-muted">Vendidos</small>
                  <h4 className="mb-0 fw-bold">{stats.sold}</h4>
                </div>
              </div>
            </div>
          </Col>
          
          <Col xs={6} md={3}>
            <div className="stats-card bg-secondary bg-opacity-10 rounded-3 p-3">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-secondary bg-opacity-25 rounded-circle p-2 me-3">
                  <i className="fas fa-clock text-secondary"></i>
                </div>
                <div>
                  <small className="text-muted">Expirados</small>
                  <h4 className="mb-0 fw-bold">{stats.expired}</h4>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Filtros */}
        <div className="filters-section mb-4">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="d-flex align-items-center me-2">
              <Filter className="text-muted me-2" size={18} />
              <span className="text-muted">Filtrar:</span>
            </div>
            
            <Button
              variant={filterStatus === 'all' ? 'primary' : 'outline-secondary'}
              size="sm"
              className="rounded-pill px-3"
              onClick={() => handleFilterChange('all')}
            >
              Todos <Badge bg="secondary" className="ms-1">{stats.total}</Badge>
            </Button>
            
            <Button
              variant={filterStatus === 'active' ? 'success' : 'outline-secondary'}
              size="sm"
              className="rounded-pill px-3"
              onClick={() => handleFilterChange('active')}
            >
              Activos <Badge bg="secondary" className="ms-1">{stats.active}</Badge>
            </Button>
            
            <Button
              variant={filterStatus === 'sold' ? 'warning' : 'outline-secondary'}
              size="sm"
              className="rounded-pill px-3 text-dark"
              onClick={() => handleFilterChange('sold')}
            >
              Vendidos <Badge bg="secondary" className="ms-1">{stats.sold}</Badge>
            </Button>
            
            <Button
              variant={filterStatus === 'expired' ? 'secondary' : 'outline-secondary'}
              size="sm"
              className="rounded-pill px-3"
              onClick={() => handleFilterChange('expired')}
            >
              Expirados <Badge bg="secondary" className="ms-1">{stats.expired}</Badge>
            </Button>
          </div>
        </div>

        {/* Listado de anuncios */}
        {filteredPosts.length > 0 ? (
          <InfiniteScroll
            dataLength={displayedPosts.length}
            next={loadMorePosts}
            hasMore={hasMore}
            loader={
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" size="sm" />
                <p className="mt-2 text-muted small">Cargando más anuncios...</p>
              </div>
            }
            endMessage={
              displayedPosts.length > 0 && displayedPosts.length >= filteredPosts.length && (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">Has visto todos tus anuncios</p>
                </div>
              )
            }
          >
            <Row>
              {displayedPosts.map((post) => (
                <Col key={post._id} xs={12} md={6} lg={4} className="mb-4">
                  <div className="position-relative">
                    {/* Badge de estado */}
                    <div className="position-absolute top-0 start-0 m-2" style={{ zIndex: 2 }}>
                      <Badge 
                        bg={
                          post.status === 'active' ? 'success' :
                          post.status === 'sold' ? 'warning' : 'secondary'
                        }
                        className="px-3 py-2 rounded-pill"
                      >
                        {post.status === 'active' ? 'Activo' :
                         post.status === 'sold' ? 'Vendido' : 'Expirado'}
                      </Badge>
                    </div>

                    {/* Botones de acción */}
                    <div className="position-absolute top-0 end-0 m-2 d-flex gap-2" style={{ zIndex: 2 }}>
                      <Button
                        variant="light"
                        size="sm"
                        className="rounded-circle p-2 shadow-sm"
                        onClick={(e) => handleViewPost(post._id)}
                        title="Ver anuncio"
                      >
                        <Eye size={16} />
                      </Button>
                      
                      <Button
                        variant="light"
                        size="sm"
                        className="rounded-circle p-2 shadow-sm"
                        onClick={(e) => handleEditPost(post._id, e)}
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </Button>
                      
                      {post.status === 'active' && (
                        <Button
                          variant="warning"
                          size="sm"
                          className="rounded-circle p-2 shadow-sm"
                          onClick={(e) => handleMarkAsSold(post._id, e)}
                          title="Marcar como vendido"
                        >
                          <i className="fas fa-check" style={{ fontSize: '16px' }}></i>
                        </Button>
                      )}
                      
                      <Button
                        variant="danger"
                        size="sm"
                        className="rounded-circle p-2 shadow-sm"
                        onClick={(e) => handleDeletePost(post._id, e)}
                        title="Eliminar"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>

                    {/* Tarjeta del post */}
                    <PostCard post={post} />
                  </div>
                </Col>
              ))}
            </Row>
          </InfiniteScroll>
        ) : (
          <div className="text-center py-5">
            <div className="empty-state mb-4">
              <i className="fas fa-box-open fa-4x text-muted"></i>
            </div>
            <h4 className="h5 mb-2">No tienes anuncios</h4>
            <p className="text-muted mb-4">
              {filterStatus !== 'all' 
                ? `No hay anuncios ${filterStatus === 'active' ? 'activos' : filterStatus === 'sold' ? 'vendidos' : 'expirados'}`
                : 'Comienza publicando tu primer anuncio'}
            </p>
            <Button 
              variant="primary" 
              className="rounded-pill px-4"
              onClick={handleCreatePost}
            >
              <Plus className="me-2" size={18} />
              Publicar Anuncio
            </Button>
          </div>
        )}
      </Container>

      <style jsx="true">{`
        .stats-card {
          transition: transform 0.2s;
        }
        .stats-card:hover {
          transform: translateY(-2px);
        }
        .stats-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .empty-state {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

export default MesAnnoces;