// src/s/cart/Cart.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ListGroup, Image, Badge, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faMinus, faShoppingCart, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { getCart , updateCartItem, removeFromCart, clearCart } from '../redux/actions/cartAction';
 
import { GLOBALTYPES } from '../redux/actions/globalTypes';
 
import './Cart.css';
const Cart = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { cart, loading } = useSelector(state => state.cart);
  const { auth } = useSelector(state => state.auth || { user: null, token: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth || !auth.token) {
      history.push('/login');
      return;
    }
    dispatch(getCart());
  }, [dispatch, auth, history]);

  const handleUpdateQuantity = (videoId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    dispatch(updateCartItem(videoId, newQty));
  };

  const handleRemove = (videoId) => {
    dispatch(removeFromCart(videoId));
  };

  const handleClearCart = () => {
    if (window.confirm('Vider le panier ?')) {
      dispatch(clearCart());
    }
  };

  const handleCheckout = () => {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { info: 'Fonctionnalité de paiement bientôt disponible' } });
  };

  if (loading && !cart) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Chargement du panier...</p>
      </Container>
    );
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <Container className="py-5 text-center">
        <div className="empty-cart-icon">
          <FontAwesomeIcon icon={faShoppingCart} size="4x" className="text-muted mb-4" />
        </div>
        <h4>Votre panier est vide</h4>
        <p className="text-muted">Parcourez les œuvres et ajoutez celles qui vous plaisent.</p>
        <Button variant="primary" onClick={() => history.push('/')}>
          Découvrir les œuvres
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4 cart-page">
      <Button variant="link" className="p-0 mb-3" onClick={() => history.goBack()}>
        <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Retour
      </Button>

      <h2 className="mb-4 d-flex align-items-center">
        <FontAwesomeIcon icon={faShoppingCart} className="me-3 text-primary" />
        Mon panier
        <Badge bg="primary" className="ms-3">{cart.totalItems} article{cart.totalItems > 1 ? 's' : ''}</Badge>
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <ListGroup variant="flush">
              {cart.items.map((item) => (
                <ListGroup.Item key={item.video._id} className="cart-item py-3">
                  <Row className="align-items-center">
                    <Col xs={3} md={2}>
                      <Image
                        src={item.video.thumbnail || '/default-thumbnail.png'}
                        alt={item.video.title}
                        rounded
                        style={{ width: '100%', height: 'auto', maxHeight: '80px', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = '/default-thumbnail.png'; }}
                      />
                    </Col>
                    <Col xs={6} md={6}>
                      <h6 className="mb-1">{item.video.title}</h6>
                      <small className="text-muted">{item.video.price.toLocaleString()} DA</small>
                      {item.video.status === 'vendue' && (
                        <Badge bg="danger" className="ms-2">Vendue</Badge>
                      )}
                    </Col>
                    <Col xs={3} md={4} className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.video._id, item.quantity, -1)}
                          disabled={item.video.status === 'vendue' || item.quantity <= 1}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </Button>
                        <span className="fw-bold">{item.quantity}</span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.video._id, item.quantity, 1)}
                          disabled={item.video.status === 'vendue' || item.quantity >= item.video.stock}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemove(item.video._id)}
                          className="ms-1"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </div>
                      <div className="mt-1">
                        <small className="text-muted">
                          {item.video.stock > 0 ? `${item.video.stock} disponible${item.video.stock > 1 ? 's' : ''}` : 'Rupture de stock'}
                        </small>
                      </div>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          {cart.items.length > 1 && (
            <Button variant="outline-danger" className="mt-3" onClick={handleClearCart}>
              <FontAwesomeIcon icon={faTrash} className="me-2" /> Vider le panier
            </Button>
          )}
        </Col>

        <Col lg={4} className="mt-4 mt-lg-0">
          <Card className="shadow-sm sticky-top" style={{ top: '80px' }}>
            <Card.Body>
              <h5 className="mb-3">Résumé</h5>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Sous-total ({cart.totalItems} article{cart.totalItems > 1 ? 's' : ''})</span>
                <span>{cart.totalPrice.toLocaleString()} DA</span>
              </div>
              <div className="d-flex justify-content-between mb-3 text-muted">
                <small>Livraison</small>
                <small>À calculer</small>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3 fw-bold">
                <span>Total</span>
                <span style={{ color: '#198754' }}>{cart.totalPrice.toLocaleString()} DA</span>
              </div>
              <Button
                variant="success"
                className="w-100"
                onClick={handleCheckout}
                disabled={cart.items.some(item => item.video.status === 'vendue')}
              >
                Procéder au paiement
              </Button>
              {cart.items.some(item => item.video.status === 'vendue') && (
                <small className="text-danger d-block mt-2 text-center">
                  Certaines œuvres sont déjà vendues. Veuillez les retirer du panier.
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;