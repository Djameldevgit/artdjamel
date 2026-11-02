// src/components/administration/Roles/RolesTab.jsx
import { useSelector, useDispatch } from 'react-redux'; 
import UserCard from './UserCard';
import { roleuserautenticado, rolemoderador, userPro, roleadmin } from '../redux/actions/roleAction';
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

import { getDataAPI } from '../utils/fetchData';
import { USER_TYPES } from '../redux/actions/userAction';
import LoadMoreBtn from "./LoadMoreBtn";
import { debounce } from 'lodash';

// Recibimos props del AdminDashboard
const Roless = ({ filters = {}, token: propToken }) => {
  const { homeUsers, auth, alert, languageReducer, socket } = useSelector(state => state);
  const dispatch = useDispatch();
  
  // Token prioritario: el que viene por props o el de Redux
  const authToken = propToken || auth?.token;
  
  const lang = languageReducer?.language || 'es';

  const [selectedRoles, setSelectedRoles] = useState({});
  const [loading, setLoading] = useState(false);

  // Estados para paginación y búsqueda
  const [load, setLoad] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreSearch, setHasMoreSearch] = useState(false);

  // Efecto para aplicar filtros desde el Drawer
  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      console.log('Filtros aplicados en Roles:', filters);
      // Aquí puedes aplicar filtros específicos para roles si es necesario
    }
  }, [filters]);

  // 🛡️ FUNCIÓN PARA VERIFICAR SI EL USUARIO ES PROTEGIDO
  const isProtectedUser = (user) => {
    // El usuario admin autenticado NUNCA puede ser modificado
    if (user._id === auth.user?._id && auth.user?.role === 'admin') {
      return true;
    }
    
    // También puedes agregar más usuarios protegidos aquí si lo necesitas
    // Ejemplo: if (user._id === 'usuario_protegido_id') return true;
    
    return false;
  };

  // Función para buscar usuarios en el servidor
  const searchUsers = useCallback(
    debounce(async (searchTerm, page = 1) => {
      if (!authToken) return;
      
      try {
        setIsSearching(true);
        
        // ✅ NORMALIZACIÓN - Case insensitive
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();
        
        // ✅ Validar que el término no esté vacío
        if (normalizedSearchTerm.length === 0) {
          setSearchResults([]);
          setHasMoreSearch(false);
          return;
        }
        
        // ✅ Búsqueda con término normalizado
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

  // Efecto para realizar búsqueda cuando el término cambia
  useEffect(() => {
    if (search.trim() !== "") {
      searchUsers(search, 1);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [search, searchUsers]);

  // Handler para cargar más resultados de búsqueda
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

  // Fetch inicial de usuarios con paginación
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

  // Handler para cargar más usuarios (cuando no hay búsqueda)
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

  const handleChangeRole = async (user, selectedRole) => {
    // 🛡️ VERIFICAR SI EL USUARIO ESTÁ PROTEGIDO
    if (isProtectedUser(user)) {
      alert("Este usuario no puede ser modificado");
      return;
    }

    setLoading(true);
    try {
      switch (selectedRole) {
        case 'user':
          await dispatch(roleuserautenticado(user, auth, socket)); // ✅ Añadir socket
          break;
        case 'userpro':
          await dispatch(userPro(user, auth, socket)); // ✅ Añadir socket
          break;
        case 'Moderateur':
          await dispatch(rolemoderador(user, auth, socket)); // ✅ Añadir socket
          break;
        case 'admin':
          await dispatch(roleadmin(user, auth, socket)); // ✅ Añadir socket
          break;
        default:
          break;
      }
      
      // Actualizar resultados de búsqueda si estamos en modo búsqueda
      if (search.trim() !== "") {
        setSearchResults(prev => 
          prev.map(u => u._id === user._id ? {...u, role: selectedRole} : u)
        );
      }
    } catch (error) {
      console.error("Error changing role:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (user, selectedRole) => {
    // 🛡️ VERIFICAR SI EL USUARIO ESTÁ PROTEGIDO ANTES DE CAMBIAR
    if (isProtectedUser(user)) {
      alert("Usuario protegido, no puede ser modificado");
      return;
    }

    setSelectedRoles(prev => ({ ...prev, [user._id]: selectedRole }));
    await handleChangeRole(user, selectedRole);

    // Si el usuario editado es el autenticado => actualiza Redux auth
    if (auth.user && auth.user._id === user._id) {
      dispatch({
        type: "AUTH_UPDATE_ROLE",
        payload: selectedRole
      });
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      'admin': { bg: 'danger', icon: '👑', text: 'Administrador' },
      'Moderateur': { bg: 'warning', icon: '🛡️', text: 'Moderador' },
      'userpro': { bg: 'info', icon: '⭐', text: 'userpro' },
      'user': { bg: 'secondary', icon: '👤', text: 'Usuario' }
    };

    const config = variants[role] || { bg: 'light', icon: '👤', text: 'Usuario' };

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

  // Determinar qué usuarios mostrar
  const usersToShow = search.trim() !== "" ? searchResults : homeUsers.users;
  const hasMore = search.trim() !== "" ? hasMoreSearch : homeUsers.result >= 9;

  if (initialLoad) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
          <p className="mt-3 text-muted fw-semibold">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header con título y buscador */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm" style={{ 
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" 
          }}>
            <Card.Body className="py-4">
              <h2 className="text-white mb-3 fw-bold">
                <Shield size={32} className="me-2" />
                Gestión de Roles y Permisos
              </h2>
              <Row className="align-items-center g-3">
                <Col lg={8} md={7}>
                  <InputGroup size="lg">
                    <InputGroup.Text className="bg-white border-0">
                      <Search className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Buscar usuarios por nombre o email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="border-0 shadow-sm"
                      style={{ fontSize: "1rem" }}
                    />
                    {search.trim() !== "" && (
                      <Button 
                        variant="light" 
                        onClick={() => setSearch("")}
                        className="border-0"
                      >
                        <XCircle />
                      </Button>
                    )}
                  </InputGroup>
                </Col>
                <Col lg={4} md={5} className="text-md-end">
                  <Badge bg="light" text="dark" className="py-2 px-3 fs-6">
                    <Shield className="me-2" />
                    {search.trim() !== "" 
                      ? `${searchResults.length} resultados`
                      : `${homeUsers.users.length} usuarios`
                    }
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alertas */}
      {alert?.error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" dismissible className="shadow-sm">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {alert.error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Indicador de búsqueda */}
      {isSearching && search.trim() !== "" && (
        <Row className="mb-3">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-4">
                <Spinner animation="border" variant="primary" className="mb-2" />
                <p className="mb-0 text-muted">Buscando usuarios...</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Tabla de roles */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead style={{ 
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              }}>
                <tr>
                  <th className="text-white border-0 py-3" style={{ width: '40%' }}>
                    Usuario
                  </th>
                  <th className="text-white border-0 py-3 text-center" style={{ width: '25%' }}>
                    Rol Actual
                  </th>
                  <th className="text-white border-0 py-3" style={{ width: '35%' }}>
                    Cambiar Rol
                  </th>
                </tr>
              </thead>
              <tbody>
                {usersToShow.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-5">
                      <Shield size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                      <p className="mb-0 text-muted fs-5">
                        {search ? "No se encontraron usuarios" : "No hay usuarios disponibles"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  usersToShow.map((user, index) => (
                    <tr key={user._id || index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td className="py-3">
                        <UserCard user={user} />
                        {/* 🛡️ INDICADOR DE USUARIO PROTEGIDO */}
                        {isProtectedUser(user) && (
                          <Badge bg="warning" text="dark" className="ms-2">
                            <i className="fas fa-shield-alt me-1"></i>
                            Protegido
                          </Badge>
                        )}
                       </td>
                      <td className="py-3 text-center">
                        {getRoleBadge(selectedRoles[user._id] || user.role)}
                      </td>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-2">
                          {loading && selectedRoles[user._id] ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <i className="fas fa-user-cog text-primary"></i>
                          )}
                          <Form.Select
                            size="sm"
                            onChange={(e) => handleRoleChange(user, e.target.value)}
                            value={selectedRoles[user._id] || user.role}
                            disabled={loading || isProtectedUser(user)} // 🛡️ DESHABILITAR SI ESTÁ PROTEGIDO
                            style={{
                              maxWidth: '250px',
                              borderRadius: '10px',
                              border: '2px solid #e0e0e0',
                              fontWeight: '500',
                              backgroundColor: isProtectedUser(user) ? '#f8f9fa' : 'white',
                              cursor: isProtectedUser(user) ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <option value="user">👤 Usuario</option>
                            <option value="userpro">⭐ Utilizateur Pro</option>
                            <option value="Moderateur">🛡️ Moderador</option>
                            <option value="admin">👑 Administrador</option>
                          </Form.Select>
                        </div>
                        {/* 🛡️ MENSAJE DE PROTECCIÓN */}
                        {isProtectedUser(user) && (
                          <small className="text-muted d-block mt-1">
                            <i className="fas fa-info-circle me-1"></i>
                            Este usuario no puede ser modificado
                          </small>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Spinner mientras carga más */}
      {load && (
        <Row className="my-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-3">
                <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                <span className="text-muted">Cargando más usuarios...</span>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Botón para cargar más */}
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

export default Roless;