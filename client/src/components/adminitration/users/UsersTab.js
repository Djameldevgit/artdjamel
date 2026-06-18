// src/components/administration/Users/UsersTab.jsx - VERSIÓN COMPLETA CON CHANNEL PLAN
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Container,
  Table,
  Dropdown,
  Badge,
  Spinner,
  Button,
  Modal,
  Row,
  Col,
  Card,
  Accordion,
  Form,
  InputGroup,
  Tabs,
  Tab,
  Alert
} from "react-bootstrap";
import {
  TrashFill,
  CheckCircleFill,
  XCircleFill,
  ThreeDotsVertical,
  Search,
  XCircle,
  StarFill,
  CalendarCheck,
  CreditCard,
  BoxArrowUpRight
} from "react-bootstrap-icons";
import moment from "moment";
import "moment/locale/fr";
import { debounce } from 'lodash';

import { getDataAPI, patchDataAPI } from "../../../utils/fetchData";
import {
  deleteUser,
  toggleVerification,
  activatePro,
  deactivatePro,
  updateUserPlan,
  getUserTransactions,
  USER_TYPES
} from "../../../redux/actions/userAction";
import { MESS_TYPES } from "../../../redux/actions/messageAction";
import { GLOBALTYPES } from "../../../redux/actions/globalTypes";

import LoadMoreBtn from "../../LoadMoreBtn";
import UserCard from "../../UserCard";

// ✅ Configuración de planes
const PLAN_CONFIG = {
  free: { label: "Gratuit", color: "secondary", icon: "🆓", badgeVariant: "secondary" },
  basic: { label: "Basic", color: "info", icon: "📹", badgeVariant: "info" },
  pro: { label: "Pro", color: "primary", icon: "⭐", badgeVariant: "primary" },
  business: { label: "Business", color: "success", icon: "🏢", badgeVariant: "success" }
};

const UsersTab = ({ filters = {}, token: propToken }) => {
  const { homeUsers, auth, socket, online } = useSelector((state) => state);
  const dispatch = useDispatch();
  
  const authToken = propToken || auth?.token;
  
  const [load, setLoad] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [activeTab, setActiveTab] = useState('all');

  // ✅ MODAL: Gestión de planes (channelPlan)
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedUserForPlan, setSelectedUserForPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [planDuration, setPlanDuration] = useState(1);
  const [planExpiryDate, setPlanExpiryDate] = useState("");
  const [planModalLoading, setPlanModalLoading] = useState(false);

  // ✅ MODAL: Ver transacciones
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [selectedUserTransactions, setSelectedUserTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Modal legacy para Usuario Pro (mantener por compatibilidad)
  const [showProModal, setShowProModal] = useState(false);
  const [selectedUserForPro, setSelectedUserForPro] = useState(null);
  const [proExpiryDate, setProExpiryDate] = useState("");
  const [proActionType, setProActionType] = useState('activate');

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreSearch, setHasMoreSearch] = useState(false);

  moment.locale('fr');

  // ========== EFECTOS ==========
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!socket || !auth?.user) return;

    socket.emit("checkUserOnline", auth.user);

    socket.on("checkUserOnlineToClient", (data) => {
      dispatch({ type: GLOBALTYPES.ONLINE, payload: data });
    });

    socket.on("CheckUserOffline", (data) => {
      dispatch({ type: MESS_TYPES.UPDATE_USER_STATUS, payload: data });
    });

    return () => {
      socket.off("checkUserOnlineToClient");
      socket.off("CheckUserOffline");
    };
  }, [socket, auth?.user, dispatch]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoad(true);
        const res = await getDataAPI(`users?limit=9`, authToken);
        dispatch({
          type: USER_TYPES.GET_USERS,
          payload: { ...res.data, page: 1 },
        });
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoad(false);
        setInitialLoad(false);
      }
    };

    if (initialLoad && authToken) {
      fetchUsers();
    }
  }, [authToken, dispatch, initialLoad]);

  // ========== FUNCIONES DE FILTRADO ACTUALIZADAS ==========
  const getFilteredUsers = () => {
    const users = search.trim() !== "" ? searchResults : homeUsers.users;
    
    switch (activeTab) {
      case 'all':
        return users || [];
      case 'free':
        return users?.filter(user => user.channelPlan === 'free' || (!user.channelPlan && !user.isPro)) || [];
      case 'basic':
        return users?.filter(user => user.channelPlan === 'basic') || [];
      case 'pro':
        return users?.filter(user => user.channelPlan === 'pro' || user.isPro === true) || [];
      case 'business':
        return users?.filter(user => user.channelPlan === 'business') || [];
      default:
        return users || [];
    }
  };

  // ========== BÚSQUEDA ==========
  const searchUsers = useCallback(
    debounce(async (searchTerm, page = 1) => {
      if (!authToken) return;

      try {
        setIsSearching(true);
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();

        if (normalizedSearchTerm.length === 0) {
          setSearchResults([]);
          return;
        }

        const query = `users/search?username=${encodeURIComponent(normalizedSearchTerm)}&page=${page}&limit=9&caseInsensitive=true`;
        const res = await getDataAPI(query, authToken);

        if (page === 1) {
          setSearchResults(res.data.users || []);
        } else {
          setSearchResults(prev => [...prev, ...(res.data.users || [])]);
        }

        setSearchPage(page);
        setHasMoreSearch(res.data.users && res.data.users.length === 9);
      } catch (err) {
        console.error("Error searching users:", err);
        dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { error: "Erreur lors de la recherche" }
        });
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [authToken, dispatch]
  );

  useEffect(() => {
    if (search.trim() !== "") {
      searchUsers(search, 1);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [search, searchUsers]);

  const handleLoadMoreSearch = async () => {
    if (!authToken || search.trim() === "") return;
    try {
      setLoad(true);
      await searchUsers(search, searchPage + 1);
    } catch (err) {
      console.error("Error loading more search results:", err);
    } finally {
      setLoad(false);
    }
  };

  const handleLoadMore = async () => {
    setLoad(true);
    try {
      const res = await getDataAPI(
        `users?limit=9&page=${homeUsers.page + 1}`,
        authToken
      );
      dispatch({
        type: USER_TYPES.GET_USERS,
        payload: { ...res.data, page: homeUsers.page + 1 },
      });
    } catch (err) {
      console.error("Error loading more users:", err);
    } finally {
      setLoad(false);
    }
  };

  // ========== CRUD USUARIOS ==========
  const confirmDelete = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    try {
      await dispatch(deleteUser({ id: userToDelete, auth: { token: authToken } }));
      setShowDeleteModal(false);

      if (search.trim() !== "") {
        setSearchResults(prev => prev.filter(user => user._id !== userToDelete));
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleToggleVerification = async (userId) => {
    try {
      await dispatch(toggleVerification(userId, authToken));
    } catch (err) {
      console.error("Error toggling verification:", err);
    }
  };

  // ========== ✅ NUEVO: Gestión de PLANES (channelPlan) ==========
  const handleOpenPlanModal = (user) => {
    setSelectedUserForPlan(user);
    setSelectedPlan(user.channelPlan || 'free');
    
    // Si tiene fecha de expiración, usarla
    if (user.channelPlanExpiresAt && user.channelPlan !== 'free') {
      const expiryDate = new Date(user.channelPlanExpiresAt);
      setPlanExpiryDate(expiryDate.toISOString().slice(0, 16));
      // Calcular duración aproximada
      const today = new Date();
      const monthsLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24 * 30));
      setPlanDuration(Math.max(1, monthsLeft));
    } else {
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 1);
      setPlanExpiryDate(defaultDate.toISOString().slice(0, 16));
      setPlanDuration(1);
    }
    
    setShowPlanModal(true);
  };

  const handleConfirmPlanUpdate = async () => {
    setPlanModalLoading(true);
    try {
      let expiresAt = null;
      if (selectedPlan !== 'free') {
        expiresAt = planExpiryDate ? new Date(planExpiryDate) : null;
      }
      
      const result = await dispatch(updateUserPlan(
        selectedUserForPlan._id,
        {
          plan: selectedPlan,
          duration_months: planDuration,
          expires_at: expiresAt,
          reason: `Admin ${auth.user?.username || 'action'}`
        },
        authToken
      ));
      
      if (result?.success) {
        dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { success: `Plan ${PLAN_CONFIG[selectedPlan]?.label} activé avec succès` }
        });
        setShowPlanModal(false);
      }
    } catch (err) {
      console.error("Error updating plan:", err);
    } finally {
      setPlanModalLoading(false);
    }
  };

  // ========== ✅ NUEVO: Ver transacciones ==========
  const handleViewTransactions = async (user) => {
    setSelectedUserForPlan(user);
    setTransactionsLoading(true);
    setShowTransactionsModal(true);
    
    try {
      const transactions = await dispatch(getUserTransactions(user._id, authToken));
      setSelectedUserTransactions(transactions || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setSelectedUserTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // ========== LEGACY: Usuario Pro (mantener compatibilidad) ==========
  const handleOpenProModal = (user, action) => {
    setSelectedUserForPro(user);
    setProActionType(action);
    if (action === 'activate') {
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() + 1);
      setProExpiryDate(defaultDate.toISOString().slice(0, 16));
    } else {
      setProExpiryDate("");
    }
    setShowProModal(true);
  };

  const handleConfirmProAction = async () => {
    if (proActionType === 'activate') {
      await dispatch(activatePro(selectedUserForPro._id, proExpiryDate || null, authToken));
    } else {
      await dispatch(deactivatePro(selectedUserForPro._id, authToken));
    }
    setShowProModal(false);
    setSelectedUserForPro(null);
    setProExpiryDate("");
  };

  // ========== FUNCIONES AUXILIARES ==========
  const getPlanBadge = (user) => {
    const planId = user.channelPlan || (user.isPro ? 'pro' : 'free');
    const config = PLAN_CONFIG[planId] || PLAN_CONFIG.free;
    
    const isExpired = user.channelPlanExpiresAt && new Date(user.channelPlanExpiresAt) < new Date();
    
    return (
      <Badge bg={isExpired ? 'danger' : config.badgeVariant} className="px-3 py-2">
        <span className="me-1">{config.icon}</span> {config.label}
        {isExpired && <span className="ms-1">(Expiré)</span>}
      </Badge>
    );
  };

  const getPlanExpiryInfo = (user) => {
    if (!user.channelPlanExpiresAt || user.channelPlan === 'free') return null;
    const expiryDate = new Date(user.channelPlanExpiresAt);
    const today = new Date();
    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) return <Badge bg="danger" className="ms-1">Expiré</Badge>;
    if (daysLeft <= 7) return <Badge bg="warning" className="ms-1">{daysLeft}j restants</Badge>;
    return <small className="text-muted ms-1">{expiryDate.toLocaleDateString()}</small>;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTransactionAmount = (amount) => {
    return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(amount);
  };

  // Estadísticas para tabs
  const getPlanCount = (plan) => {
    const users = search.trim() !== "" ? searchResults : homeUsers.users;
    if (!users) return 0;
    
    switch(plan) {
      case 'free': return users.filter(u => u.channelPlan === 'free' || (!u.channelPlan && !u.isPro)).length;
      case 'basic': return users.filter(u => u.channelPlan === 'basic').length;
      case 'pro': return users.filter(u => u.channelPlan === 'pro' || u.isPro === true).length;
      case 'business': return users.filter(u => u.channelPlan === 'business').length;
      default: return users.length;
    }
  };

  const usersToShow = getFilteredUsers();
  const hasMore = search.trim() !== "" ? hasMoreSearch : homeUsers.result >= 9;

  if (initialLoad) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
          <p className="mt-3 text-muted fw-semibold">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header con búsqueda */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm bg-gradient" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <Card.Body className="py-4">
              <Row className="align-items-center g-3">
                <Col lg={8} md={7}>
                  <InputGroup size="lg">
                    <InputGroup.Text className="bg-white border-0">
                      <Search className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Rechercher un utilisateur par nom ou email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="border-0 shadow-sm"
                      style={{ fontSize: "1rem" }}
                    />
                    {search.trim() !== "" && (
                      <Button variant="light" onClick={() => setSearch("")} className="border-0">
                        <XCircle />
                      </Button>
                    )}
                  </InputGroup>
                </Col>
                <Col lg={4} md={5} className="text-md-end">
                  <Badge bg="light" text="dark" className="py-2 px-3 fs-6">
                    <i className="bi bi-person-check me-2"></i>
                    {usersToShow.length} {search.trim() !== "" ? "résultats" : "utilisateurs"}
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ✅ Tabs actualizados con todos los planes */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="all" title={`📋 Tous (${getPlanCount('all')})`} />
        <Tab eventKey="free" title={`🆓 Gratuit (${getPlanCount('free')})`} />
        <Tab eventKey="basic" title={`📹 Basic (${getPlanCount('basic')})`} />
        <Tab eventKey="pro" title={`⭐ Pro (${getPlanCount('pro')})`} />
        <Tab eventKey="business" title={`🏢 Business (${getPlanCount('business')})`} />
      </Tabs>

      {/* ========== MODALES ========== */}

      {/* MODAL: Eliminar usuario */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-danger">
            <TrashFill className="me-2" />
            Confirmer la suppression
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="mb-0">Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.</p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            <TrashFill className="me-2" />
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ MODAL: Gestión de planes (channelPlan) */}
      <Modal show={showPlanModal} onHide={() => setShowPlanModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <StarFill className="me-2" />
            Gérer l'abonnement
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">👤 Utilisateur</Form.Label>
                <Form.Control 
                  type="text" 
                  value={selectedUserForPlan?.username || ''} 
                  disabled 
                  className="bg-light"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">📧 Email</Form.Label>
                <Form.Control 
                  type="text" 
                  value={selectedUserForPlan?.email || ''} 
                  disabled 
                  className="bg-light"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">📦 Plan actuel</Form.Label>
            <div>
              {getPlanBadge(selectedUserForPlan || {})}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">🎯 Nouveau plan</Form.Label>
            <div className="d-flex gap-3 flex-wrap">
              {['free', 'basic', 'pro', 'business'].map(plan => (
                <div key={plan} className="form-check">
                  <Form.Check
                    type="radio"
                    id={`plan-${plan}`}
                    label={
                      <span>
                        {PLAN_CONFIG[plan].icon} {PLAN_CONFIG[plan].label}
                      </span>
                    }
                    value={plan}
                    checked={selectedPlan === plan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                  />
                </div>
              ))}
            </div>
          </Form.Group>

          {selectedPlan !== 'free' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">⏱️ Durée (mois)</Form.Label>
                <Form.Select 
                  value={planDuration} 
                  onChange={(e) => {
                    const months = parseInt(e.target.value);
                    setPlanDuration(months);
                    const newDate = new Date();
                    newDate.setMonth(newDate.getMonth() + months);
                    setPlanExpiryDate(newDate.toISOString().slice(0, 16));
                  }}
                >
                  {[1, 3, 6, 12, 24].map(months => (
                    <option key={months} value={months}>
                      {months} mois {months >= 12 ? `(${Math.floor(months/12)} an${months>=24?'s':''})` : ''}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">📅 Date d'expiration</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={planExpiryDate}
                  onChange={(e) => setPlanExpiryDate(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Laissez vide pour un abonnement sans expiration
                </Form.Text>
              </Form.Group>
            </>
          )}

          <Alert variant="info" className="mt-2">
            <span className="me-2">ℹ️</span>
            {selectedPlan === 'free' 
              ? "L'utilisateur reviendra au plan gratuit. Il perdra les fonctionnalités premium."
              : `Le passage au plan ${PLAN_CONFIG[selectedPlan]?.label} sera effectif immédiatement.`}
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPlanModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmPlanUpdate}
            disabled={planModalLoading}
          >
            {planModalLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Traitement...
              </>
            ) : (
              <>
                <CheckCircleFill className="me-2" />
                Confirmer
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ MODAL: Ver transacciones */}
      <Modal show={showTransactionsModal} onHide={() => setShowTransactionsModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <CreditCard className="me-2" />
            Historique des paiements - {selectedUserForPlan?.username}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {transactionsLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Chargement...</p>
            </div>
          ) : selectedUserTransactions.length === 0 ? (
            <Alert variant="info" className="text-center">
              Aucune transaction enregistrée
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover size="sm">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Plan</th>
                    <th>Durée</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th>Expiration</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUserTransactions.map(tx => (
                    <tr key={tx._id}>
                      <td>{formatDate(tx.createdAt)}</td>
                      <td>{PLAN_CONFIG[tx.plan_id]?.label || tx.plan_name}</td>
                      <td>{tx.duration_months} mois</td>
                      <td className={tx.amount > 0 ? 'text-success fw-bold' : 'text-muted'}>
                        {tx.amount > 0 ? `${tx.amount} DA` : 'Admin'}
                      </td>
                      <td>
                        <Badge bg={tx.status === 'paid' ? 'success' : 'warning'}>
                          {tx.status === 'paid' ? 'Payé' : 'En attente'}
                        </Badge>
                      </td>
                      <td>{tx.plan_expires_at ? formatDate(tx.plan_expires_at) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTransactionsModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL legacy Pro (mantener por compatibilidad) */}
      <Modal show={showProModal} onHide={() => setShowProModal(false)} centered>
        <Modal.Header closeButton className={proActionType === 'activate' ? "bg-primary text-white" : "bg-warning text-dark"}>
          <Modal.Title>
            {proActionType === 'activate' ? (
              <><StarFill className="me-2" /> Activer le compte Pro</>
            ) : (
              <><XCircleFill className="me-2" /> Désactiver le compte Pro</>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Utilisateur :</strong> {selectedUserForPro?.username}
            <br />
            <strong>Email :</strong> {selectedUserForPro?.email}
          </p>
          
          {proActionType === 'activate' ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>
                  <CalendarCheck className="me-2" />
                  Date d'expiration (optionnelle)
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={proExpiryDate}
                  onChange={(e) => setProExpiryDate(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Laissez vide pour un abonnement sans expiration (à vie)
                </Form.Text>
              </Form.Group>
              <Alert variant="info" className="mt-2">
                <StarFill className="me-2" />
                L'utilisateur bénéficiera de tous les avantages Pro.
              </Alert>
            </>
          ) : (
            <Alert variant="warning" className="mt-2">
              <XCircleFill className="me-2" />
              Êtes-vous sûr de vouloir désactiver le compte Pro de cet utilisateur ?
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProModal(false)}>
            Annuler
          </Button>
          <Button 
            variant={proActionType === 'activate' ? "primary" : "danger"}
            onClick={handleConfirmProAction}
          >
            {proActionType === 'activate' ? (
              <><StarFill className="me-2" /> Activer Pro</>
            ) : (
              <><XCircleFill className="me-2" /> Désactiver Pro</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ========== VISTA MÓVIL ========== */}
      {isMobile ? (
        <Row>
          <Col>
            {usersToShow.length === 0 ? (
              <Card className="border-0 shadow-sm text-center">
                <Card.Body className="py-5">
                  <i className="bi bi-inbox" style={{ fontSize: "3rem", color: "#ccc" }}></i>
                  <p className="mt-3 mb-0 text-muted fs-5">
                    {search ? "Aucun utilisateur trouvé" : "Aucun utilisateur disponible"}
                  </p>
                </Card.Body>
              </Card>
            ) : (
              <Accordion flush>
                {usersToShow.map((user, index) => (
                  <Accordion.Item key={user._id} eventKey={user._id} className="mb-3 border-0 shadow-sm rounded">
                    <Accordion.Header className="bg-white">
                      <div className="d-flex align-items-center w-100 justify-content-between">
                        <div className="d-flex align-items-center">
                          <Badge bg="primary" className="me-3 rounded-circle" style={{ width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {index + 1}
                          </Badge>
                          <UserCard user={user} />
                        </div>
                        {user.channelPlan !== 'free' && (
                          <span className="ms-2">{PLAN_CONFIG[user.channelPlan]?.icon}</span>
                        )}
                      </div>
                    </Accordion.Header>
                    <Accordion.Body className="bg-light">
                      <Row className="g-3 mb-3">
                        <Col xs={6}>
                          <div className="p-2 bg-white rounded">
                            <small className="text-muted d-block mb-1">Statut</small>
                            {online.some((u) => u._id === user._id) ? (
                              <Badge bg="success" className="w-100">En ligne</Badge>
                            ) : user.lastDisconnectedAt ? (
                              <Badge bg="secondary" className="w-100">
                                Déconnecté {moment(user.lastDisconnectedAt).fromNow()}
                              </Badge>
                            ) : (
                              <Badge bg="secondary" className="w-100">Déconnecté</Badge>
                            )}
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="p-2 bg-white rounded">
                            <small className="text-muted d-block mb-1">Plan</small>
                            {getPlanBadge(user)}
                            {getPlanExpiryInfo(user)}
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="p-2 bg-white rounded">
                            <small className="text-muted d-block mb-1">Vérification</small>
                            {user.isVerified ? (
                              <Badge bg="success" className="w-100"><CheckCircleFill className="me-1" /> Vérifié</Badge>
                            ) : (
                              <Badge bg="danger" className="w-100"><XCircleFill className="me-1" /> Non vérifié</Badge>
                            )}
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="p-2 bg-white rounded">
                            <small className="text-muted d-block mb-1">Inscription</small>
                            <small className="text-dark fw-semibold">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                        </Col>
                      </Row>

                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="flex-grow-1"
                          onClick={() => handleOpenPlanModal(user)}
                        >
                          <StarFill className="me-1" size={12} /> Plan
                        </Button>
                        <Button 
                          variant="outline-info" 
                          size="sm" 
                          className="flex-grow-1"
                          onClick={() => handleViewTransactions(user)}
                        >
                          <CreditCard className="me-1" size={12} /> Paiements
                        </Button>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            <ThreeDotsVertical />
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={() => handleToggleVerification(user._id)}>
                              {user.isVerified ? "Dévérifier" : "Vérifier"}
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item className="text-danger" onClick={() => confirmDelete(user._id)}>
                              <TrashFill className="me-2" /> Supprimer
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </Col>
        </Row>
      ) : (
        /* ========== VISTA DESKTOP ========== */
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                  <tr>
                    <th className="text-white border-0 py-3">#</th>
                    <th className="text-white border-0 py-3">Utilisateur</th>
                    <th className="text-white border-0 py-3">Statut</th>
                    <th className="text-white border-0 py-3">Plan</th>
                    <th className="text-white border-0 py-3">Expiration</th>
                    <th className="text-white border-0 py-3">Vérification</th>
                    <th className="text-white border-0 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersToShow.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <i className="bi bi-inbox" style={{ fontSize: "3rem", color: "#ccc" }}></i>
                        <p className="mt-3 mb-0 text-muted fs-5">
                          {search ? "Aucun utilisateur trouvé" : "Aucun utilisateur disponible"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    usersToShow.map((user, index) => (
                      <tr key={user._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td className="fw-bold text-primary">{index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <UserCard user={user} />
                            {user.channelPlan !== 'free' && (
                              <span title={`Plan ${PLAN_CONFIG[user.channelPlan]?.label}`}>
                                {PLAN_CONFIG[user.channelPlan]?.icon}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {online.some((u) => u._id === user._id) ? (
                            <Badge bg="success" className="px-3 py-2">En ligne</Badge>
                          ) : user.lastDisconnectedAt ? (
                            <Badge bg="secondary" className="px-3 py-2">
                              Déconnecté {moment(user.lastDisconnectedAt).fromNow()}
                            </Badge>
                          ) : (
                            <Badge bg="secondary" className="px-3 py-2">Déconnecté</Badge>
                          )}
                        </td>
                        <td>
                          {getPlanBadge(user)}
                        </td>
                        <td>
                          {user.channelPlanExpiresAt && user.channelPlan !== 'free' ? (
                            <small className="text-muted">
                              {formatDate(user.channelPlanExpiresAt)}
                              {getPlanExpiryInfo(user)}
                            </small>
                          ) : (
                            <small className="text-muted">-</small>
                          )}
                        </td>
                        <td>
                          {user.isVerified ? (
                            <Badge bg="success" className="px-3 py-2"><CheckCircleFill className="me-1" /> Vérifié</Badge>
                          ) : (
                            <Badge bg="danger" className="px-3 py-2"><XCircleFill className="me-1" /> Non vérifié</Badge>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              title="Gérer le plan"
                              onClick={() => handleOpenPlanModal(user)}
                              style={{ width: "32px", height: "32px", padding: 0 }}
                            >
                              <StarFill size={14} />
                            </Button>
                            <Button 
                              variant="outline-info" 
                              size="sm" 
                              title="Voir les paiements"
                              onClick={() => handleViewTransactions(user)}
                              style={{ width: "32px", height: "32px", padding: 0 }}
                            >
                              <CreditCard size={14} />
                            </Button>
                            <Dropdown>
                              <Dropdown.Toggle variant="outline-secondary" size="sm" style={{ width: "32px", height: "32px", padding: 0 }}>
                                <ThreeDotsVertical size={14} />
                              </Dropdown.Toggle>
                              <Dropdown.Menu align="end">
                                <Dropdown.Item onClick={() => handleToggleVerification(user._id)}>
                                  {user.isVerified ? "Dévérifier" : "Vérifier"}
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item className="text-danger" onClick={() => confirmDelete(user._id)}>
                                  <TrashFill className="me-2" /> Supprimer
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Load More */}
      {load && (
        <Row className="my-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-3">
                <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                <span className="text-muted">Chargement...</span>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {hasMore && usersToShow.length > 0 && (
        <Row className="my-4">
          <Col className="d-flex justify-content-center">
            <LoadMoreBtn
              result={9}
              page={search.trim() !== "" ? searchPage : homeUsers.page}
              load={load}
              handleLoadMore={search.trim() !== "" ? handleLoadMoreSearch : handleLoadMore}
            />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default UsersTab;