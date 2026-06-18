// src/components/administration/Roles/RolesTab.jsx
import { useSelector, useDispatch } from 'react-redux'; 
import UserCard from '../../UserCard';
import { roleuserautenticado, rolemoderador, userPro, roleadmin } from '../../../redux/actions/roleAction';
import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Table,
  Form,
  Card,
  Badge,
  Spinner,
  Alert,
  Row,
  Col,
  Button,
  InputGroup
} from 'react-bootstrap';
import { Shield, Search, XCircle } from 'react-bootstrap-icons';

import { getDataAPI, patchDataAPI } from '../../../utils/fetchData';
import { USER_TYPES } from '../../../redux/actions/userAction';
import LoadMoreBtn from "../../LoadMoreBtn";
import { debounce } from 'lodash';
import { GLOBALTYPES } from '../../../redux/actions/globalTypes';

const RolesTab = ({ filters = {}, token: propToken }) => {
  const { homeUsers, auth, alert, languageReducer, socket } = useSelector(state => state);
  const dispatch = useDispatch();
  
  const authToken = propToken || auth?.token;
  const lang = languageReducer?.language || 'es';

  const [selectedRoles, setSelectedRoles] = useState({});
  const [selectedPlans, setSelectedPlans] = useState({});
  const [loading, setLoading] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState(false);

  const [load, setLoad] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreSearch, setHasMoreSearch] = useState(false);

  // ✅ Planes disponibles
  const plans = [
    { id: 'free', name: 'Gratuit', price: 0, color: '#6c757d', icon: '🆓' },
    { id: 'basic', name: 'Basic', price: 400, color: '#667eea', icon: '⭐' },
    { id: 'pro', name: 'Pro', price: 700, color: '#f093fb', icon: '🚀' },
    { id: 'business', name: 'Business', price: 1300, color: '#f6b93b', icon: '👑' }
  ];

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      console.log('Filtros aplicados en Roles:', filters);
    }
  }, [filters]);

  const isProtectedUser = (user) => {
    if (user._id === auth.user?._id && auth.user?.role === 'admin') {
      return true;
    }
    return false;
  };

  const getUserPlan = (user) => {
    return user.channelPlan || 'free';
  };

  const getPlanBadge = (planId) => {
    const plan = plans.find(p => p.id === planId) || plans[0];
    return (
      <Badge 
        style={{ 
          background: plan.color, 
          color: 'white',
          padding: '5px 10px',
          borderRadius: '20px',
          fontSize: '11px'
        }}
        className="ms-2"
      >
        {plan.icon} {plan.name}
        {plan.price > 0 && ` - ${plan.price} DA`}
      </Badge>
    );
  };

  // Búsqueda de usuarios
  const searchUsers = useCallback(
    debounce(async (searchTerm, page = 1) => {
      if (!authToken) return;
      
      try {
        setIsSearching(true);
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();
        
        if (normalizedSearchTerm.length === 0) {
          setSearchResults([]);
          setHasMoreSearch(false);
          return;
        }
        
        const query = `users/search?username=${encodeURIComponent(normalizedSearchTerm)}&page=${page}&limit=9`;
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
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [authToken]
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

  // Fetch inicial de usuarios
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
        console.error("Error fetching users for roles:", err);
      } finally {
        setLoad(false);
        setInitialLoad(false);
      }
    };

    if (initialLoad && authToken) {
      fetchUsers();
    }
  }, [authToken, dispatch, initialLoad]);

  const handleLoadMore = async () => {
    setLoad(true);
    try {
      const res = await getDataAPI(`users?limit=9&page=${homeUsers.page + 1}`, authToken);
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

  // ✅ FUNCIÓN PARA ACTUALIZAR PLAN (llamada directa a API)
  const updateUserPlanDirect = async (userId, planId) => {
    setUpdatingPlan(true);
    try {
      const response = await patchDataAPI(`admin/update-plan/${userId}`, { planId }, authToken);
      console.log(`✅ Plan ${planId} actualizado para usuario ${userId}`, response.data);
      return true;
    } catch (error) {
      console.error("❌ Error updating plan:", error);
      dispatch({ 
        type: GLOBALTYPES.ALERT, 
        payload: { error: error.response?.data?.msg || "Erreur lors du changement de plan" } 
      });
      return false;
    } finally {
      setUpdatingPlan(false);
    }
  };

  // ✅ FUNCIÓN PARA ACTUALIZAR ROL (llamada directa a API)
  const updateRoleDirect = async (userId, role, planId = null) => {
    let endpoint = '';
    let body = {};
    
    switch (role) {
      case 'user':
        endpoint = `user/${userId}/roleuser`;
        body = { role: 'user' };
        break;
      case 'userpro':
        endpoint = `user/${userId}/roleuserpro`;
        body = { role: 'userpro', planId: planId || 'basic' };
        break;
      case 'Moderateur':
        endpoint = `user/${userId}/rolemoderador`;
        body = { role: 'moderator' };
        break;
      case 'admin':
        endpoint = `user/${userId}/roleadmin`;
        body = { role: 'admin' };
        break;
      default:
        return false;
    }
    
    try {
      const response = await patchDataAPI(endpoint, body, authToken);
      console.log(`✅ Rol ${role} actualizado para usuario ${userId}`, response.data);
      return true;
    } catch (error) {
      console.error("❌ Error updating role:", error);
      dispatch({ 
        type: GLOBALTYPES.ALERT, 
        payload: { error: error.response?.data?.msg || "Erreur lors du changement de rôle" } 
      });
      return false;
    }
  };

  // ✅ MANEJAR CAMBIO DE ROL
  const handleRoleChange = async (user, selectedRole) => {
    if (isProtectedUser(user)) {
      dispatch({ 
        type: GLOBALTYPES.ALERT, 
        payload: { error: "Cet utilisateur ne peut pas être modifié" } 
      });
      return;
    }

    const selectedPlan = selectedPlans[user._id] || getUserPlan(user);
    
    console.log('📤 handleRoleChange:', { userId: user._id, selectedRole, selectedPlan });
    
    setSelectedRoles(prev => ({ ...prev, [user._id]: selectedRole }));
    setLoading(true);
    
    // Actualizar UI inmediatamente (optimista)
    const updatedUserData = { 
      ...user, 
      role: selectedRole, 
      channelPlan: selectedRole === 'userpro' ? selectedPlan : 'free' 
    };
    
    // Actualizar en homeUsers
    if (homeUsers.users) {
      const updatedUsers = homeUsers.users.map(u => 
        u._id === user._id ? updatedUserData : u
      );
      dispatch({
        type: USER_TYPES.GET_USERS,
        payload: { ...homeUsers, users: updatedUsers }
      });
    }
    
    // Actualizar en búsqueda
    if (search.trim() !== "") {
      setSearchResults(prev => 
        prev.map(u => u._id === user._id ? updatedUserData : u)
      );
    }
    
    // Actualizar auth si es el mismo usuario
    if (user._id === auth.user?._id) {
      dispatch({
        type: GLOBALTYPES.AUTH,
        payload: { ...auth, user: { ...auth.user, role: selectedRole, channelPlan: selectedRole === 'userpro' ? selectedPlan : 'free' } }
      });
    }
    
    try {
      // Llamada a la API para cambiar rol
      const roleSuccess = await updateRoleDirect(user._id, selectedRole, selectedPlan);
      
      if (roleSuccess && selectedRole === 'userpro' && selectedPlan && selectedPlan !== 'free') {
        // Si es userpro, actualizar el plan también
        await updateUserPlanDirect(user._id, selectedPlan);
      }
      
      dispatch({ 
        type: GLOBALTYPES.ALERT, 
        payload: { success: `Rôle changé à ${selectedRole}` } 
      });
      
    } catch (error) {
      console.error("Error:", error);
      // Revertir cambios locales
      if (homeUsers.users) {
        const revertedUsers = homeUsers.users.map(u => 
          u._id === user._id ? user : u
        );
        dispatch({
          type: USER_TYPES.GET_USERS,
          payload: { ...homeUsers, users: revertedUsers }
        });
      }
      if (user._id === auth.user?._id) {
        dispatch({
          type: GLOBALTYPES.AUTH,
          payload: { ...auth, user }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ MANEJAR CAMBIO DE PLAN SOLAMENTE
  const handlePlanChange = async (user, planId) => {
    if (isProtectedUser(user)) {
      dispatch({ 
        type: GLOBALTYPES.ALERT, 
        payload: { error: "Cet utilisateur ne peut pas être modifié" } 
      });
      return;
    }
    
    console.log('📤 Cambiando plan:', { userId: user._id, planId });
    
    // Actualizar UI inmediatamente
    setSelectedPlans(prev => ({ ...prev, [user._id]: planId }));
    
    if (homeUsers.users) {
      const updatedUsers = homeUsers.users.map(u => 
        u._id === user._id ? { ...u, channelPlan: planId } : u
      );
      dispatch({
        type: USER_TYPES.GET_USERS,
        payload: { ...homeUsers, users: updatedUsers }
      });
    }
    
    if (user._id === auth.user?._id) {
      dispatch({
        type: GLOBALTYPES.AUTH,
        payload: { ...auth, user: { ...auth.user, channelPlan: planId } }
      });
    }
    
    // Si el usuario ya es userpro, actualizar en el servidor
    if (user.role === 'userpro') {
      const success = await updateUserPlanDirect(user._id, planId);
      if (!success) {
        // Revertir si hay error
        const originalPlan = getUserPlan(user);
        setSelectedPlans(prev => ({ ...prev, [user._id]: originalPlan }));
        if (homeUsers.users) {
          const revertedUsers = homeUsers.users.map(u => 
            u._id === user._id ? { ...u, channelPlan: originalPlan } : u
          );
          dispatch({
            type: USER_TYPES.GET_USERS,
            payload: { ...homeUsers, users: revertedUsers }
          });
        }
      } else {
        dispatch({ 
          type: GLOBALTYPES.ALERT, 
          payload: { success: `Plan changé à ${planId}` } 
        });
      }
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      'admin': { bg: 'danger', icon: '👑', text: 'Administrateur' },
      'Moderateur': { bg: 'warning', icon: '🛡️', text: 'Modérateur' },
      'Super-utilisateur': { bg: 'info', icon: '⭐', text: 'Super Utilisateur' },
      'userpro': { bg: 'success', icon: '💎', text: 'User Pro' },
      'user': { bg: 'secondary', icon: '👤', text: 'Utilisateur' }
    };

    const config = variants[role] || { bg: 'light', icon: '👤', text: 'Utilisateur' };

    return (
      <Badge 
        bg={config.bg} 
        className="text-capitalize px-3 py-2"
        style={{ fontSize: '0.9rem' }}
      >
        {config.icon} {config.text}
      </Badge>
    );
  };

  const usersToShow = search.trim() !== "" ? searchResults : homeUsers.users;
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
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <Card.Body className="py-4">
              <h2 className="text-white mb-3 fw-bold">
                <Shield size={32} className="me-2" />
                Gestion des Rôles et Plans
              </h2>
              <p className="text-white-50 mb-3">
                Assignez un rôle ET un plan (Basic/Pro/Business) aux utilisateurs UserPro
              </p>
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
                    <Shield className="me-2" />
                    {search.trim() !== "" 
                      ? `${searchResults.length} résultats`
                      : `${homeUsers.users.length} utilisateurs`
                    }
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {alert?.error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" dismissible className="shadow-sm">
              {alert.error}
            </Alert>
          </Col>
        </Row>
      )}

      {isSearching && search.trim() !== "" && (
        <Row className="mb-3">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-4">
                <Spinner animation="border" variant="primary" className="mb-2" />
                <p className="mb-0 text-muted">Recherche d'utilisateurs...</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                <tr>
                  <th className="text-white border-0 py-3" style={{ width: '35%' }}>Utilisateur</th>
                  <th className="text-white border-0 py-3 text-center" style={{ width: '20%' }}>Rôle Actuel</th>
                  <th className="text-white border-0 py-3 text-center" style={{ width: '20%' }}>Plan</th>
                  <th className="text-white border-0 py-3" style={{ width: '25%' }}>Changer Rôle / Plan</th>
                </tr>
              </thead>
              <tbody>
                {usersToShow.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <Shield size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                      <p className="mb-0 text-muted fs-5">
                        {search ? "Aucun utilisateur trouvé" : "Aucun utilisateur disponible"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  usersToShow.map((user, index) => {
                    const currentPlan = selectedPlans[user._id] || getUserPlan(user);
                    const currentRole = selectedRoles[user._id] || user.role;
                    const isUserPro = currentRole === 'userpro' || user.role === 'userpro';
                    
                    return (
                      <tr key={user._id || index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td className="py-3">
                          <UserCard user={user} />
                          {isProtectedUser(user) && (
                            <Badge bg="warning" text="dark" className="ms-2">Protégé</Badge>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          {getRoleBadge(currentRole)}
                        </td>
                        <td className="py-3 text-center">
                          {getPlanBadge(currentPlan)}
                          {isUserPro && currentPlan === 'free' && (
                            <Badge bg="warning" className="ms-2">⚠️ Plan requis</Badge>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="d-flex flex-column gap-2">
                            <div className="d-flex align-items-center gap-2">
                              {loading && selectedRoles[user._id] ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <i className="fas fa-user-cog text-primary"></i>
                              )}
                              <Form.Select
                                size="sm"
                                onChange={(e) => handleRoleChange(user, e.target.value)}
                                value={currentRole}
                                disabled={loading || isProtectedUser(user)}
                                style={{
                                  maxWidth: '180px',
                                  borderRadius: '10px',
                                  border: '2px solid #e0e0e0',
                                  fontWeight: '500'
                                }}
                              >
                                <option value="user">👤 Utilisateur</option>
                                <option value="Super-utilisateur">⭐ Super Utilisateur</option>
                                <option value="Moderateur">🛡️ Modérateur</option>
                                <option value="admin">👑 Administrateur</option>
                                <option value="userpro">💎 User Pro</option>
                              </Form.Select>
                            </div>
                            
                            {(currentRole === 'userpro' || user.role === 'userpro') && (
                              <div className="d-flex align-items-center gap-2 mt-2">
                                <i className="fas fa-box text-success"></i>
                                <Form.Select
                                  size="sm"
                                  value={currentPlan}
                                  onChange={(e) => handlePlanChange(user, e.target.value)}
                                  disabled={updatingPlan || isProtectedUser(user)}
                                  style={{
                                    maxWidth: '160px',
                                    borderRadius: '10px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '12px'
                                  }}
                                >
                                  <option value="free">🆓 Gratuit - 0 DA</option>
                                  <option value="basic">⭐ Basic - 400 DA/mois</option>
                                  <option value="pro">🚀 Pro - 700 DA/mois</option>
                                  <option value="business">👑 Business - 1300 DA/mois</option>
                                </Form.Select>
                                {updatingPlan && selectedPlans[user._id] && (
                                  <Spinner animation="border" size="sm" className="ms-1" />
                                )}
                              </div>
                            )}
                            
                            {isProtectedUser(user) && (
                              <small className="text-muted d-block mt-1">
                                <i className="fas fa-info-circle me-1"></i>
                                Cet utilisateur ne peut pas être modifié
                              </small>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

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

export default RolesTab;