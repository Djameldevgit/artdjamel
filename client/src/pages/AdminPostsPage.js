// 📂 pages/AdminPostsPage.js

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Button, Badge, 
  Spinner, Table, Form, Alert, Pagination
} from 'react-bootstrap';
import { 
  FaCheck, FaTrash, FaClipboardList, FaExclamationTriangle,
  FaCheckDouble, FaEye, FaCheckCircle
} from 'react-icons/fa';
import { 
  getPostsPendientes, 
  aprovarPostPendiente,
  loadMorePendientes 
} from '../redux/actions/postAproveAction';
import { deletePost } from '../redux/actions/postAction';

const AdminPostsPage = () => {
  const dispatch = useDispatch();
  const { postsPendientes, loading, total, page, totalPages, hasMore } = useSelector(state => state.postAprove);
  const { auth, socket } = useSelector(state => state);
  
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showMessage, setShowMessage] = useState({ show: false, text: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  
  const categoriaAdmin = auth.user?.categoriaAsignada || 'todos';
  
  const postsFiltrados = categoriaAdmin === 'todos' 
    ? postsPendientes 
    : postsPendientes?.filter(p => p.categorie === categoriaAdmin) || [];

  // Cargar posts cuando cambia la página
  useEffect(() => {
    dispatch(getPostsPendientes(auth.token, currentPage, postsPerPage));
  }, [dispatch, auth.token, currentPage]);

  // Resetear selección cuando cambian los posts
  useEffect(() => {
    setSelectedPosts([]);
    setSelectAll(false);
  }, [postsPendientes]);

  const handleSelectPost = (postId) => {
    setSelectedPosts(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(currentPosts.map(post => post._id));
    }
    setSelectAll(!selectAll);
  };

  const handleApproveSelected = () => {
    if (selectedPosts.length === 0) {
      setShowMessage({ show: true, text: 'Selecciona al menos un post', type: 'warning' });
      setTimeout(() => setShowMessage({ show: false, text: '', type: '' }), 3000);
      return;
    }

    if (window.confirm(`¿Aprobar ${selectedPosts.length} posts seleccionados?`)) {
      selectedPosts.forEach(postId => {
        const post = postsPendientes.find(p => p._id === postId);
        if (post) {
          dispatch(aprovarPostPendiente({ post, estado: 'aprobado', auth, socket }));
        }
      });
      setShowMessage({ show: true, text: `${selectedPosts.length} posts aprobados`, type: 'success' });
      setSelectedPosts([]);
      setSelectAll(false);
      setTimeout(() => setShowMessage({ show: false, text: '', type: '' }), 3000);
    }
  };

  const handleAprobar = (post) => {
    if (window.confirm(`¿Aprobar el post "${post.title}"?`)) {
      dispatch(aprovarPostPendiente({ post, estado: 'aprobado', auth, socket }));
      setShowMessage({ show: true, text: 'Post aprobado', type: 'success' });
      setTimeout(() => setShowMessage({ show: false, text: '', type: '' }), 2000);
    }
  };

  const handleDeletePost = (post) => {
    if (window.confirm(`¿Eliminar el post "${post.title}"?`)) {
      dispatch(deletePost({ post, auth, socket }));
      setShowMessage({ show: true, text: 'Post eliminado', type: 'success' });
      setTimeout(() => setShowMessage({ show: false, text: '', type: '' }), 2000);
    }
  };

  // Calcular posts de la página actual (ya vienen del backend paginados)
  const currentPosts = postsFiltrados;

  if (loading && postsPendientes.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando posts pendientes...</p>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light py-4">
      <Container>
        {/* Header */}
        <div className="mb-4">
          <h2 className="fw-bold d-flex align-items-center">
            <FaClipboardList className="me-3 text-primary" />
            Posts Pendientes
            <Badge bg="warning" className="ms-2">{total}</Badge>
          </h2>
          {categoriaAdmin !== 'todos' && (
            <p className="text-muted">📍 Administrando categoría: <strong>{categoriaAdmin}</strong></p>
          )}
        </div>

        {/* Alertas */}
        {showMessage.show && (
          <Alert 
            variant={showMessage.type} 
            dismissible 
            onClose={() => setShowMessage({ show: false, text: '', type: '' })}
            className="mb-4"
          >
            {showMessage.text}
          </Alert>
        )}

        {/* Tarjetas de estadísticas */}
        <Row className="mb-4 g-3">
          <Col xs={12} md={4}>
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="bg-primary text-white rounded-3">
                <FaExclamationTriangle className="fs-3 mb-2" />
                <h4 className="fw-bold mb-1">{total}</h4>
                <small>Pendientes</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={4}>
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="bg-success text-white rounded-3">
                <FaCheckCircle className="fs-3 mb-2" />
                <h4 className="fw-bold mb-1">{selectedPosts.length}</h4>
                <small>Seleccionados</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={4}>
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className={`rounded-3 text-white ${selectedPosts.length > 0 ? 'bg-warning' : 'bg-secondary'}`}>
                <FaCheckDouble className="fs-3 mb-2" />
                <h4 className="fw-bold mb-1">{selectedPosts.length}</h4>
                <small>Listos para acción</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Barra de acciones masivas */}
        {selectedPosts.length > 0 && (
          <Card className="border-0 shadow-sm mb-4 bg-light">
            <Card.Body className="p-3">
              <Row className="align-items-center">
                <Col xs={12} md={6} className="mb-3 mb-md-0">
                  <h6 className="fw-bold mb-0">
                    <FaCheckCircle className="me-2 text-success" />
                    {selectedPosts.length} posts seleccionados
                  </h6>
                </Col>
                <Col xs={12} md={6}>
                  <div className="d-flex gap-2">
                    <Button variant="success" onClick={handleApproveSelected} className="flex-grow-1">
                      <FaCheckDouble className="me-2" /> Aprobar Seleccionados
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Tabla de posts */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-0 py-3">
            <Row className="align-items-center">
              <Col xs={12} md={6}>
                <h5 className="mb-0 fw-bold">Lista de Posts Pendientes</h5>
                <small className="text-muted">
                  Mostrando página {page} de {totalPages} - Total: {total} posts
                </small>
              </Col>
              <Col xs={12} md={6} className="text-md-end">
                <Form.Check
                  type="checkbox"
                  label="Seleccionar Todos"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="fw-semibold"
                  disabled={currentPosts.length === 0}
                />
              </Col>
            </Row>
          </Card.Header>
          
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '40px' }} className="text-center">
                    <Form.Check type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                  </th>
                  <th style={{ width: '60px' }}>Imagen</th>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Usuario</th>
                  <th>Precio</th>
                  <th>Fecha</th>
                  <th style={{ width: '120px' }} className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentPosts.length > 0 ? (
                  currentPosts.map((post) => (
                    <tr key={post._id} className={selectedPosts.includes(post._id) ? 'table-primary' : ''}>
                      <td className="text-center">
                        <Form.Check
                          type="checkbox"
                          checked={selectedPosts.includes(post._id)}
                          onChange={() => handleSelectPost(post._id)}
                        />
                       </td>
                      <td>
                        {post.images?.[0]?.url ? (
                          <img 
                            src={post.images[0].url} 
                            alt="post" 
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                          />
                        ) : (
                          <div className="bg-secondary bg-opacity-25 rounded d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                            <small>Sin img</small>
                          </div>
                        )}
                      </td>
                      <td>
                        <Link to={`/post/${post._id}`} className="text-decoration-none fw-medium">
                          {post.title?.length > 40 ? post.title.substring(0, 40) + '...' : post.title}
                        </Link>
                      </td>
                      <td>
                        <Badge bg="info" className="rounded-pill">
                          {post.categorie} / {post.subCategory}
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted">{post.user?.username}</small>
                      </td>
                      <td className="fw-bold text-primary">
                        {post.price?.toLocaleString()} DA
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <Button 
                            as={Link} 
                            to={`/post/${post._id}`}
                            variant="outline-primary" 
                            size="sm"
                            title="Ver detalle"
                          >
                            <FaEye />
                          </Button>
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            onClick={() => handleAprobar(post)}
                            title="Aprobar"
                          >
                            <FaCheck />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeletePost(post)}
                            title="Eliminar"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <FaClipboardList className="fs-1 mb-3 opacity-50" />
                      <h5>No hay posts pendientes</h5>
                      <p className="mb-0">Todos los posts han sido revisados</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              <Pagination.Prev 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                if (totalPages <= 7 || 
                    pageNum === 1 || 
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)) {
                  return (
                    <Pagination.Item 
                      key={pageNum}
                      active={pageNum === currentPage}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                } else if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                  return <Pagination.Ellipsis key={pageNum} />;
                }
                return null;
              })}
              <Pagination.Next 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        )}
      </Container>
    </div>
  );
};

export default AdminPostsPage;