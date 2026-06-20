// src/pages/cart/Cart.jsx
// 🔥 VERSIÓN CON PAGO INTEGRADO (Chargily)

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
  ListGroup,
  Image
} from 'react-bootstrap';
import { FaTrashAlt, FaShoppingCart, FaPlus, FaMinus } from 'react-icons/fa';
import { getCart, removeFromCart, updateCartItem, clearCart } from '../redux/actions/cartAction';
import { postDataAPI } from '../utils/fetchData';
import './Cart.css';

const Cart = () => {
  const dispatch = useDispatch();
  const { auth, cart } = useSelector(state => state);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [processing, setProcessing] = useState(false); // Estado para el pago

  useEffect(() => {
    if (auth?.token) {
      dispatch(getCart());
    }
  }, [auth.token, dispatch]);

  const handleRemove = async (videoId) => {
    try {
      setUpdating(true);
      await dispatch(removeFromCart(videoId));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateQuantity = async (videoId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      setUpdating(true);
      await dispatch(updateCartItem(videoId, newQty));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Vider le panier ?')) {
      try {
        setUpdating(true);
        await dispatch(clearCart());
      } catch (err) {
        setError(err.message);
      } finally {
        setUpdating(false);
      }
    }
  };

  // ============================================
  // 🛒 PAGO CON CHARGILY
  // ============================================
  const handleCheckout = async () => {
    // Validar que hay items y usuario autenticado
    if (!auth?.token) {
      setError('Veuillez vous connecter pour passer commande.');
      return;
    }
    if (!cart.items || cart.items.length === 0) {
      setError('Votre panier est vide.');
      return;
    }

    // Calcular total (ya está en cart.totalPrice, pero lo recalculamos por si acaso)
    const totalPrice = cart.items.reduce((sum, item) => sum + (item.priceAtAdd || 0) * item.quantity, 0);
    if (totalPrice <= 0) {
      setError('Le montant total doit être supérieur à 0.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Construir payload para el backend (similar a planes.js)
      const paymentData = {
        plan_id: 'cart',                  // Identificador para el backend
        plan_name: 'Panier d\'achat',
        amount: totalPrice,
        currency: 'dzd',
        cart_items: cart.items.map(item => ({
          videoId: item.videoId,
          title: item.title || item.video?.title || 'Sans titre',
          quantity: item.quantity,
          price: item.priceAtAdd || item.video?.price || 0,
          thumbnail: item.thumbnail || item.video?.thumbnail || null
        }))
      };

      // Llamar al mismo endpoint que usa Planes
      const response = await postDataAPI('create-checkout', paymentData, auth.token);
      
      // Extraer la URL de checkout (puede estar en response.data.checkout_url o response.data.data.checkout_url)
      const checkoutUrl = response.data?.checkout_url || response.data?.data?.checkout_url;
      
      if (checkoutUrl) {
        // Redirigir al usuario a la pasarela de pago
        window.location.href = checkoutUrl;
      } else {
        throw new Error('URL de paiement manquante. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('❌ Error en checkout:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors de la création du paiement.');
    } finally {
      setProcessing(false);
    }
  };

  // ============================================
  // MANEJO DE IMÁGENES (fallback)
  // ============================================
  const handleImageError = (e) => {
    const parent = e.target.parentElement;
    const placeholder = document.createElement('div');
    placeholder.className = 'cart-image-placeholder';
    placeholder.innerHTML = `
      <svg viewBox="0 0 100 100" style="width:100%;height:100%;">
        <rect width="100" height="100" fill="#e9ecef"/>
        <text x="50" y="55" font-size="12" text-anchor="middle" fill="#6c757d" font-family="sans-serif">Sans image</text>
      </svg>
    `;
    e.target.style.display = 'none';
    parent.appendChild(placeholder);
  };

  const getImageSrc = (item) => {
    if (item.thumbnail && item.thumbnail !== '/default-thumbnail.png') {
      return item.thumbnail;
    }
    if (item.video) {
      if (item.video.thumbnail) return item.video.thumbnail;
      if (item.video.images && item.video.images.length > 0) {
        const first = item.video.images[0];
        if (typeof first === 'object' && first.url) return first.url;
        if (typeof first === 'string') return first;
      }
    }
    return null;
  };

  // ============================================
  // RENDER CONDICIONAL
  // ============================================
  if (!auth.token) {
    return (
      <Container className="py-5 text-center">
        <h3>Veuillez vous connecter</h3>
        <Button as={Link} to="/login">Se connecter</Button>
      </Container>
    );
  }

  if (cart.loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p>Chargement du panier...</p>
      </Container>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <Container className="py-5 text-center cart-empty">
        <FaShoppingCart size={80} className="text-muted mb-4" />
        <h4>Votre panier est vide</h4>
        <Button as={Link} to="/" variant="primary">Découvrir les œuvres</Button>
      </Container>
    );
  }

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.items.reduce((sum, item) => sum + (item.priceAtAdd || 0) * item.quantity, 0);

  // Verificar si algún item está agotado o vendido
  const hasUnavailable = cart.items.some(item => 
    item.video?.status === 'vendue' || item.video?.stock === 0
  );

  return (
    <Container className="py-4 cart-page">
      <h2 className="mb-4">🛒 Mon panier</h2>
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {updating && <div className="text-center"><Spinner size="sm" /> Mise à jour...</div>}

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm cart-items-card">
            <ListGroup variant="flush">
              {cart.items.map((item, index) => {
                const video = item.video;
                const videoId = item.videoId || video?._id || index;
                const title = item.title || video?.title || 'Sans titre';
                const price = item.priceAtAdd || video?.price || 0;
                const imgSrc = getImageSrc(item);
                const isSold = video?.status === 'vendue' || video?.stock === 0;
                const isUnique = video?.stock === 1;

                return (
                  <ListGroup.Item key={videoId} className="cart-item py-3">
                    <Row className="align-items-center">
                      {/* Imagen */}
                      <Col xs={3} md={2} className="text-center">
                        <div style={{ position: 'relative', width: '100%' }}>
                          {imgSrc ? (
                            <Image
                              src={imgSrc}
                              alt={title}
                              rounded
                              className="cart-item-image"
                              onError={handleImageError}
                            />
                          ) : (
                            <div className="cart-image-placeholder">
                              <span>📷</span>
                            </div>
                          )}
                        </div>
                      </Col>

                      {/* Info */}
                      <Col xs={6} md={6}>
                        <div className="cart-item-title">{title}</div>
                        <div className="cart-item-meta">
                          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                            {price.toLocaleString()} DA
                          </span>
                          {isSold && <Badge bg="danger" className="ms-2">Vendue</Badge>}
                          {isUnique && !isSold && <Badge bg="warning" text="dark" className="ms-2">Œuvre unique</Badge>}
                          {video?.stock !== undefined && video.stock < 3 && !isSold && (
                            <Badge bg="warning" text="dark" className="ms-2">Stock faible</Badge>
                          )}
                        </div>
                      </Col>

                      {/* Controles */}
                      <Col xs={3} md={4} className="text-end mt-2 mt-md-0">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          <button
                            className="qty-btn"
                            onClick={() => handleUpdateQuantity(videoId, item.quantity, -1)}
                            disabled={item.quantity <= 1 || isSold || updating}
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="cart-qty">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => handleUpdateQuantity(videoId, item.quantity, 1)}
                            disabled={item.quantity >= (video?.stock || 0) || isSold || updating}
                          >
                            <FaPlus size={12} />
                          </button>
                          <button
                            className="remove-btn"
                            onClick={() => handleRemove(videoId)}
                            disabled={updating}
                          >
                            <FaTrashAlt size={12} />
                          </button>
                        </div>
                        <div className="cart-item-subtotal mt-1">
                          Sous-total: <strong>{(price * item.quantity).toLocaleString()} DA</strong>
                        </div>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Card>

          {cart.items.length > 1 && (
            <Button variant="outline-danger" className="mt-3" onClick={handleClear} disabled={updating}>
              Vider le panier
            </Button>
          )}
        </Col>

        <Col lg={4} className="mt-4 mt-lg-0">
          <Card className="shadow-sm cart-summary sticky-top" style={{ top: '80px' }}>
            <Card.Body>
              <h5 className="summary-title">Résumé</h5>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Total articles</span>
                <span><strong>{totalItems}</strong></span>
              </div>
              <div className="d-flex justify-content-between mb-3 fw-bold summary-total">
                <span>Total</span>
                <span style={{ color: '#198754' }}>{totalPrice.toLocaleString()} DA</span>
              </div>
              <Button
                variant="success"
                className="w-100 checkout-btn"
                disabled={hasUnavailable || processing || updating || totalItems === 0}
                onClick={handleCheckout}
              >
                {processing ? (
                  <>
                    <Spinner as="span" size="sm" animation="border" className="me-2" />
                    Traitement...
                  </>
                ) : (
                  'Procéder au paiement'
                )}
              </Button>
              {hasUnavailable && (
                <div className="mt-2 text-danger small">
                  Certains articles ne sont plus disponibles. Veuillez les retirer pour continuer.
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;