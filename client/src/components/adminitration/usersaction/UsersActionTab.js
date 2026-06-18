// src/components/administration/Users/UsersActionTab.jsx
import React, { useState, useEffect } from "react";
import { 
  Container, 
  Dropdown, 
  DropdownButton, 
  Form, 
  Row, 
  Col, 
  Card, 
  Table,
  ButtonGroup,
  Accordion,
  Spinner
} from 'react-bootstrap';
import { useSelector, useDispatch } from "react-redux";
import { getDataAPI } from "../../../utils/fetchData";
import { USERS_TYPES_ACTION } from "../../../redux/actions/usersActionAction";
import LoadMoreBtn from "../../LoadMoreBtn";
import LoadIcon from "../../../images/loading.gif";
import UserCard from "../../UserCard";

// Recibimos props del AdminDashboard
const UsersActionTab = ({ filters = {}, token: propToken }) => {
  const { usersActionReducer, auth, languageReducer } = useSelector((state) => state);
  const dispatch = useDispatch();
  
  // Token prioritario: el que viene por props o el de Redux
  const authToken = propToken || auth?.token;
  
  const lang = languageReducer?.language || 'es';

  const [load, setLoad] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(usersActionReducer.users || []);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  // Efecto para aplicar filtros desde el Drawer
  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      console.log('Filtros aplicados en UsersAction:', filters);
      // Aquí puedes aplicar los filtros del drawer si es necesario
      if (filters.activity) {
        handleFilter(filters.activity);
      }
    }
  }, [filters]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchInitialUsers = async () => {
      try {
        setLoad(true);
        const res = await getDataAPI(`users?limit=9`, authToken);
        dispatch({
          type: USERS_TYPES_ACTION.GET_USERS_ACTION,
          payload: { ...res.data, page: 2 },
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoad(false);
      }
    };

    if (authToken && usersActionReducer.users.length === 0) {
      fetchInitialUsers();
    }
  }, [authToken, dispatch, usersActionReducer.users.length]);

  useEffect(() => {
    setFilteredUsers(usersActionReducer.users || []);
  }, [usersActionReducer.users]);

  const handleLoadMore = async () => {
    setLoad(true);
    try {
      const res = await getDataAPI(`users?limit=${usersActionReducer.page * 9}`, authToken);
      dispatch({
        type: USERS_TYPES_ACTION.GET_USERS_ACTION,
        payload: { ...res.data, page: usersActionReducer.page + 1 },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoad(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredResults = filteredUsers.filter((user) =>
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteUser = (user) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      // dispatch(deleteUser({ user, auth: { token: authToken } }));
      console.log("Delete user:", user);
    }
  };

  const handleFilter = async (criteria) => {
    try {
      setLoad(true);
      const res = await getDataAPI(`users?limit=9&filter=${criteria}`, authToken);
      dispatch({
        type: USERS_TYPES_ACTION.GET_USERS_ACTION,
        payload: { ...res.data, page: 2 },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoad(false);
    }
  };

  // Función para formatear números
  const formatNumber = (num) => num || 0;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-center mb-4">Estadísticas de Usuarios</h2>
        </Col>
      </Row>
      
      {/* Filtros y búsqueda */}
      <Row className="justify-content-between align-items-center mb-4">
        <Col md={6} className="mb-3 mb-md-0">
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Buscar usuarios por nombre o email..."
              value={search}
              onChange={handleSearch}
              className="rounded-pill"
            />
          </Form.Group>
        </Col>
        <Col md="auto">
          <ButtonGroup>
            <DropdownButton
              as={ButtonGroup}
              id="dropdown-filter-button"
              title="Filtrar usuarios"
              variant="primary"
              align="end"
            >
              <Dropdown.Item onClick={() => handleFilter("latestRegistered")}>
                Más recientes
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleFilter("lastLogin")}>
                Último inicio de sesión
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleFilter("mostLikes")}>
                Más likes dados
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleFilter("mostComments")}>
                Más comentarios
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleFilter("mostFollowers")}>
                Más seguidores
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleFilter("mostPosts")}>
                Más publicaciones
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleFilter("mostReports")}>
                Más reportes
              </Dropdown.Item>
            </DropdownButton>
          </ButtonGroup>
        </Col>
      </Row>

      {isMobile ? (
        // Vista para móviles con Accordion
        <Row>
          <Col>
            {filteredResults.length === 0 ? (
              <Card className="text-center p-4">
                <Card.Body>
                  <p className="mb-0 text-muted">No se encontraron usuarios</p>
                </Card.Body>
              </Card>
            ) : (
              <Accordion flush>
                {filteredResults.map((user, index) => (
                  <Accordion.Item key={user._id} eventKey={user._id} className="mb-3 shadow-sm">
                    <Accordion.Header>
                      <div className="d-flex align-items-center w-100">
                        <span className="me-3 text-muted">#{index + 1}</span>
                        <UserCard user={user} />
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      {/* Información básica */}
                      <Row className="g-3 mb-3">
                        <Col xs={6}>
                          <strong>Registro:</strong>
                          <br />
                          <span className="text-muted">
                            {new Date(user.createdAt).toLocaleDateString(lang === "ar" ? "en-US" : lang)}
                          </span>
                        </Col>
                        <Col xs={6}>
                          <strong>Último login:</strong>
                          <br />
                          <span className="text-muted">
                            {user.lastLogin ? 
                              new Date(user.lastLogin).toLocaleDateString(lang === "ar" ? "en-US" : lang) : 
                              "Nunca ha iniciado sesión"}
                          </span>
                        </Col>
                      </Row>

                      {/* Estadísticas principales */}
                      <Row className="g-3 mb-3">
                        <Col xs={6} md={4}>
                          <strong>Publicaciones:</strong>
                          <br />
                          <span className="fw-bold text-primary">{formatNumber(user.postCount)}</span>
                        </Col>
                        <Col xs={6} md={4}>
                          <strong>Reportes hechos:</strong>
                          <br />
                          <span className={`fw-bold ${(user.totalReportsGiven || 0) >= 2 ? "text-danger" : "text-warning"}`}>
                            {formatNumber(user.totalReportsGiven)}
                          </span>
                        </Col>
                        <Col xs={6} md={4}>
                          <strong>Reportes recibidos:</strong>
                          <br />
                          <span className={`fw-bold ${(user.totalReportsReceived || 0) >= 2 ? "text-danger" : "text-warning"}`}>
                            {formatNumber(user.totalReportsReceived)}
                          </span>
                        </Col>
                        <Col xs={6} md={4}>
                          <strong>Likes dados:</strong>
                          <br />
                          <span className="fw-bold text-success">{formatNumber(user.likesGiven)}</span>
                        </Col>
                        <Col xs={6} md={4}>
                          <strong>Likes recibidos:</strong>
                          <br />
                          <span className="fw-bold text-success">{formatNumber(user.totalLikesReceived)}</span>
                        </Col>
                        <Col xs={6} md={4}>
                          <strong>Comentarios hechos:</strong>
                          <br />
                          <span className="fw-bold text-info">{formatNumber(user.commentsMade)}</span>
                        </Col>
                        <Col xs={6} md={4}>
                          <strong>Comentarios recibidos:</strong>
                          <br />
                          <span className="fw-bold text-info">{formatNumber(user.totalCommentsReceived)}</span>
                        </Col>
                        <Col xs={6} md={4}>
                          <strong>Siguiendo:</strong>
                          <br />
                          <span className="fw-bold text-warning">{formatNumber(user.totalFollowing)}</span>
                        </Col>
                        <Col xs={6} md={4}>
                          <strong>Seguidores:</strong>
                          <br />
                          <span className="fw-bold text-warning">{formatNumber(user.totalFollowers)}</span>
                        </Col>
                      </Row>

                      {/* Acciones */}
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-primary" size="sm" className="w-100 mb-2">
                          Acciones
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="w-100">
                          <Dropdown.Item>Editar</Dropdown.Item>
                          <Dropdown.Item className="text-danger" onClick={() => handleDeleteUser(user)}>
                            Eliminar
                          </Dropdown.Item>
                          <Dropdown.Item className="text-warning">Bloquear</Dropdown.Item>
                          <Dropdown.Item className="text-warning">Silenciar</Dropdown.Item>
                          <Dropdown.Item>Enviar mensaje</Dropdown.Item>
                          <Dropdown.Item>Ver perfil</Dropdown.Item>
                          <Dropdown.Item>Ver reportes</Dropdown.Item>
                          <Dropdown.Item className="text-info">Iniciar sesión como usuario</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </Col>
        </Row>
      ) : (
        // Vista para desktop con Table responsive
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table striped bordered hover className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Usuario</th>
                    <th>Registro</th>
                    <th>Último login</th>
                    <th>Posts</th>
                    <th>Reportes hechos</th>
                    <th>Reportes recibidos</th>
                    <th>Likes dados</th>
                    <th>Likes recibidos</th>
                    <th>Comentarios hechos</th>
                    <th>Comentarios recibidos</th>
                    <th>Siguiendo</th>
                    <th>Seguidores</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan="14" className="text-center py-4">
                        <span className="text-muted">No se encontraron usuarios</span>
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((user, index) => (
                      <tr key={user._id}>
                        <td>{index + 1}</td>
                        <td><UserCard user={user} /></td>
                        <td>{new Date(user.createdAt).toLocaleDateString(lang === "ar" ? "en-US" : lang)}</td>
                        <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString(lang === "ar" ? "en-US" : lang) : "Nunca"}</td>
                        <td>{formatNumber(user.postCount)}</td>
                        <td className={(user.totalReportsGiven || 0) >= 2 ? "text-danger fw-bold" : "text-warning fw-bold"}>
                          {formatNumber(user.totalReportsGiven)}
                        </td>
                        <td className={(user.totalReportsReceived || 0) >= 2 ? "text-danger fw-bold" : "text-warning fw-bold"}>
                          {formatNumber(user.totalReportsReceived)}
                        </td>
                        <td>{formatNumber(user.likesGiven)}</td>
                        <td>{formatNumber(user.totalLikesReceived)}</td>
                        <td>{formatNumber(user.commentsMade)}</td>
                        <td>{formatNumber(user.totalCommentsReceived)}</td>
                        <td>{formatNumber(user.totalFollowing)}</td>
                        <td>{formatNumber(user.totalFollowers)}</td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                              Acciones
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item>Editar</Dropdown.Item>
                              <Dropdown.Item className="text-danger" onClick={() => handleDeleteUser(user)}>
                                Eliminar
                              </Dropdown.Item>
                              <Dropdown.Item className="text-warning">Bloquear</Dropdown.Item>
                              <Dropdown.Item className="text-warning">Silenciar</Dropdown.Item>
                              <Dropdown.Item>Enviar mensaje</Dropdown.Item>
                              <Dropdown.Item>Ver perfil</Dropdown.Item>
                              <Dropdown.Item>Ver reportes</Dropdown.Item>
                              <Dropdown.Item className="text-info">Iniciar sesión como usuario</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
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

      {load && (
        <Row className="mt-3">
          <Col className="text-center">
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      )}
      
      {filteredResults.length > 0 && (
        <Row className="mt-4">
          <Col className="text-center">
            <LoadMoreBtn
              result={usersActionReducer.result}
              page={usersActionReducer.page}
              load={load}
              handleLoadMore={handleLoadMore}
            />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default UsersActionTab;