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
 
} from 'react-bootstrap';
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { getDataAPI } from "../../utils/fetchData";
import { USERS_TYPES_ACTION } from "../../redux/actions/usersActionAction";
import LoadMoreBtn from "../LoadMoreBtn";
import LoadIcon from "../../images/loading.gif";
import UserCard from "../UserCard";

const UsersAction = () => {
  const { usersActionReducer, auth, languageReducer } = useSelector((state) => state);
  const dispatch = useDispatch();
 
  const { t, i18n } = useTranslation('usersactions');

  // Cambiar el idioma activamente si es diferente
  const lang = languageReducer.language || 'es';
  if (i18n.language !== lang) i18n.changeLanguage(lang);

  const [load, setLoad] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(usersActionReducer.users || []);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

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
        const res = await getDataAPI(`users?limit=9`, auth.token);
        dispatch({
          type: USERS_TYPES_ACTION.GET_USERS_ACTION,
          payload: { ...res.data, page: 2 },
        });
      } catch (err) {
        console.error(err);
      }
    };

    if (auth.token && usersActionReducer.users.length === 0) {
      fetchInitialUsers();
    }
  }, [auth.token, dispatch, usersActionReducer.users.length]);

  useEffect(() => {
    setFilteredUsers(usersActionReducer.users || []);
  }, [usersActionReducer.users]);

  const handleLoadMore = async () => {
    setLoad(true);
    const res = await getDataAPI(`users?limit=${usersActionReducer.page * 9}`, auth.token);
    dispatch({
      type: USERS_TYPES_ACTION.GET_USERS_ACTION,
      payload: { ...res.data, page: usersActionReducer.page + 1 },
    });
    setLoad(false);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredResults = filteredUsers.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteUser = (user) => {
    if (window.confirm(t("deleteConfirmation"))) {
      // dispatch(deleteUser({ user, auth }));
      console.log("Delete user:", user);
    }
  };

  const handleFilter = async (criteria) => {
    try {
      setLoad(true);
      const res = await getDataAPI(`users?limit=9&filter=${criteria}`, auth.token);
      dispatch({
        type: USERS_TYPES_ACTION.GET_USERS_ACTION,
        payload: { ...res.data, page: 2 },
      });
      setLoad(false);
    } catch (err) {
      console.error(err);
      setLoad(false);
    }
  };

  // Función para formatear números
  const formatNumber = (num) => num || 0;

  return (
    <Container fluid className="mt-5 pt-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-center mb-4">{t("userManagement")}</h2>
        </Col>
      </Row>
      
      {/* Filtros y búsqueda */}
      <Row className="justify-content-between align-items-center mb-4">
        <Col md={6} className="mb-3 mb-md-0">
          <Form.Group>
            <Form.Control
              type="text"
              placeholder={t("searchUsers")}
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
              title={t("filterUsers")}
              variant="primary"
              align="end"
            >
              <Dropdown.Item onClick={() => handleFilter("latestRegistered")}>
                {t("filter.latestRegistered")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleFilter("lastLogin")}>
                {t("filter.lastLogin")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleFilter("mostLikes")}>
                {t("filter.mostLikes")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleFilter("mostComments")}>
                {t("filter.mostComments")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleFilter("mostFollowers")}>
                {t("filter.mostFollowers")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleFilter("mostPosts")}>
                {t("filter.mostPosts")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleFilter("mostReports")}>
                {t("filter.mostReports")}
              </Dropdown.Item>
            </DropdownButton>
          </ButtonGroup>
        </Col>
      </Row>

      {isMobile ? (
        // Vista para móviles con TODOS los datos
        <Row>
          <Col>
            {filteredResults.length === 0 ? (
              <Card className="text-center p-4">
                <Card.Body>
                  <p className="mb-0 text-muted">{t("noUsersFound")}</p>
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
                          <strong>{t("tableHeadd.registration")}:</strong>
                          <br />
                          <span className="text-muted">
                            {new Date(user.createdAt).toLocaleDateString(lang === "ar" ? "en-US" : lang)}
                          </span>
                        </Col>
                        <Col xs={6}>
                          <strong>{t("tableHeadd.login")}:</strong>
                          <br />
                          <span className="text-muted">
                            {user.lastLogin ? 
                              new Date(user.lastLogin).toLocaleDateString(lang === "ar" ? "en-US" : lang) : 
                              t("neverLoggedIn")}
                          </span>
                        </Col>
                      </Row>

                      {/* Estadísticas principales */}
                      <Row className="g-3 mb-3">
                        <Col xs={6} md={4}>
                          <strong>{t("tableHeadd.posts")}:</strong>
                          <br />
                          <span className="fw-bold text-primary">{formatNumber(user.postCount)}</span>
                        </Col>
                        <Col xs={6} md={4}>
                          <strong>{t("tableHeadd.reports")}:</strong>
                          <br />
                          <span className={`fw-bold ${(user.totalReportsGiven || 0) >= 2 ? "text-danger" : "text-warning"}`}>
                            {formatNumber(user.totalReportsGiven)}
                          </span>
                        </Col>
                        <Col xs={6} md={4}>
                          <strong>{t("tableHeadd.reportsReceived")}:</strong>
                          <br />
                          <span className={`fw-bold ${(user.totalReportsReceived || 0) >= 2 ? "text-danger" : "text-warning"}`}>
                            {formatNumber(user.totalReportsReceived)}
                          </span>
                        </Col>
                        <Col xs={6} md={4}>
                          <strong>{t("tableHeadd.likesGiven")}:</strong>
                          <br />
                          <span className="fw-bold text-success">{formatNumber(user.likesGiven)}</span>
                        </Col>
                        <Col xs={6} md={4}>
                          <strong>{t("tableHeadd.likesReceived")}:</strong>
                          <br />
                          <span className="fw-bold text-success">{formatNumber(user.totalLikesReceived)}</span>
                        </Col>
                        <Col xs={6} md={4}>
                          <strong>{t("tableHeadd.commentsMade")}:</strong>
                          <br />
                          <span className="fw-bold text-info">{formatNumber(user.commentsMade)}</span>
                        </Col>
                        <Col xs={6} md={4}>
                          <strong>{t("tableHeadd.commentsReceived")}:</strong>
                          <br />
                          <span className="fw-bold text-info">{formatNumber(user.totalCommentsReceived)}</span>
                        </Col>
                        <Col xs={6} md={4}>
                          <strong>{t("tableHeadd.following")}:</strong>
                          <br />
                          <span className="fw-bold text-warning">{formatNumber(user.totalFollowing)}</span>
                        </Col>
                        <Col xs={6} md={4}>
                          <strong>{t("tableHeadd.followers")}:</strong>
                          <br />
                          <span className="fw-bold text-warning">{formatNumber(user.totalFollowers)}</span>
                        </Col>
                      </Row>

                      {/* Acciones */}
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-primary" size="sm" className="w-100 mb-2">
                          {t("actio.title")}
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="w-100">
                          <Dropdown.Item>{t("actio.edit")}</Dropdown.Item>
                          <Dropdown.Item className="text-danger" onClick={() => handleDeleteUser(user)}>
                            {t("actio.delete")}
                          </Dropdown.Item>
                          <Dropdown.Item className="text-warning">{t("actio.block")}</Dropdown.Item>
                          <Dropdown.Item className="text-warning">{t("actio.mute")}</Dropdown.Item>
                          <Dropdown.Item>{t("actio.sendMessage")}</Dropdown.Item>
                          <Dropdown.Item>{t("actio.viewProfile")}</Dropdown.Item>
                          <Dropdown.Item>{t("actio.viewReports")}</Dropdown.Item>
                          <Dropdown.Item className="text-info">{t("actio.loginAsUser")}</Dropdown.Item>
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
                    <th>{t("tableHeadd.user")}</th>
                    <th>{t("tableHeadd.registration")}</th>
                    <th>{t("tableHeadd.login")}</th>
                    <th>{t("tableHeadd.posts")}</th>
                    <th>{t("tableHeadd.reports")}</th>
                    <th>{t("tableHeadd.reportsReceived")}</th>
                    <th>{t("tableHeadd.likesGiven")}</th>
                    <th>{t("tableHeadd.likesReceived")}</th>
                    <th>{t("tableHeadd.commentsMade")}</th>
                    <th>{t("tableHeadd.commentsReceived")}</th>
                    <th>{t("tableHeadd.following")}</th>
                    <th>{t("tableHeadd.followers")}</th>
                    <th>{t("tableHeadd.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan="14" className="text-center py-4">
                        <span className="text-muted">{t("noUsersFound")}</span>
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((user, index) => (
                      <tr key={user._id}>
                        <td>{index + 1}</td>
                        <td><UserCard user={user} /></td>
                        <td>{new Date(user.createdAt).toLocaleDateString(lang === "ar" ? "en-US" : lang)}</td>
                        <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString(lang === "ar" ? "en-US" : lang) : t("neverLoggedIn")}</td>
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
                              {t("actio.title")}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item>{t("actio.edit")}</Dropdown.Item>
                              <Dropdown.Item className="text-danger" onClick={() => handleDeleteUser(user)}>
                                {t("actio.delete")}
                              </Dropdown.Item>
                              <Dropdown.Item className="text-warning">{t("actio.block")}</Dropdown.Item>
                              <Dropdown.Item className="text-warning">{t("actio.mute")}</Dropdown.Item>
                              <Dropdown.Item>{t("actio.sendMessage")}</Dropdown.Item>
                              <Dropdown.Item>{t("actio.viewProfile")}</Dropdown.Item>
                              <Dropdown.Item>{t("actio.viewReports")}</Dropdown.Item>
                              <Dropdown.Item className="text-info">{t("actio.loginAsUser")}</Dropdown.Item>
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
            <img src={LoadIcon} alt="loading" />
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

export default UsersAction;