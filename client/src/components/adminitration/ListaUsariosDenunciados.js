import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getReports } from "../../redux/actions/reportUserAction";
import {
  Container,
  Table,
  ButtonGroup,
  Dropdown,
  Spinner,
  Alert,
  Card,
  Row,
  Col,
  Badge,
  Button,
  Modal
} from "react-bootstrap";
import {
 
  TrashFill,
  UnlockFill,
  ThreeDotsVertical,
  EyeFill,
  CheckCircleFill,
  XCircleFill,
  ClockHistory,
  LockFill
} from "react-bootstrap-icons";

// Importamos el hook y los modales
import { useUserActions } from "./useUserActions";
import BloqueModalUser from "./BloqueModalUser";

const ListaUsuariosDenunciados = () => {
  const { auth, languageReducer } = useSelector((state) => state);
  const { reports, loading } = useSelector((state) => state.reportReducer);
  const dispatch = useDispatch();
 
  const { t, i18n } = useTranslation('listausariosdenunciados');
 
  // Cambiar el idioma activamente si es diferente
  const lang = languageReducer.language || 'es';
  if (i18n.language !== lang) i18n.changeLanguage(lang);
  
  const isArabic = lang === "ar";
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [filterStatus, setFilterStatus] = useState("all");
  const [localReports, setLocalReports] = useState([]);

  // Usamos el hook de acciones de usuario
  const {
    showBlockModal,
    showDeleteModal,
    selectedUser,
    setShowDeleteModal,
    handleOpenBlockModal,
    handleCloseBlockModal,
    confirmDelete,
    handleDeleteUser,
    handleBlockUser,
    handleUnblockUser,
    handleToggleActiveStatus,
  } = useUserActions();

  // Detectar cambios en el tamaño de la pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        await dispatch(getReports(auth.token));
      } catch (err) {
        setError(t("errors.fetchError"));
      }
    };
    fetchReports();
  }, [dispatch, auth.token, t]);

  // Sincronizar reports con estado local para reflejar cambios
  useEffect(() => {
    if (reports && Array.isArray(reports)) {
      setLocalReports([...reports]);
    }
  }, [reports]);

  // Función para actualizar el estado de un usuario en los reportes locales
  const updateUserStatusInReports = (userId, updates) => {
    setLocalReports(prevReports => 
      prevReports.map(report => {
        if (report.userId && report.userId._id === userId) {
          return {
            ...report,
            userId: {
              ...report.userId,
              ...updates
            }
          };
        }
        return report;
      })
    );
  };

  const handleShowDetails = (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedReport(null);
  };

  const handleResolve = (reportId) => {
    console.log("Marcar reporte como resuelto:", reportId);
  };

  const handleReject = (reportId) => {
    console.log("Rechazar reporte:", reportId);
  };

  // Versiones de las funciones que actualizan la UI
  const handleToggleStatus = async (userId) => {
    try {
      await handleToggleActiveStatus(userId);
      // Actualizar el estado local
      updateUserStatusInReports(userId, { 
        isActive: !localReports.find(r => r.userId?._id === userId)?.userId?.isActive 
      });
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const handleUnblock = async (user) => {
    try {
      await handleUnblockUser(user);
      // Actualizar el estado local
      updateUserStatusInReports(user._id, { esBloqueado: false });
    } catch (error) {
      console.error("Error al desbloquear:", error);
    }
  };

  const handleBlock = async (user) => {
    handleOpenBlockModal(user);
  };

  // Función que se ejecuta después de bloquear exitosamente
  const onBlockSuccess = () => {
    if (selectedUser) {
      updateUserStatusInReports(selectedUser._id, { esBloqueado: true });
    }
  };

  const handleDelete = async (userId) => {
    try {
      await handleDeleteUser();
      // Eliminar el reporte de la lista local
      setLocalReports(prevReports => 
        prevReports.filter(report => report.userId?._id !== userId)
      );
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const filteredReports =
    filterStatus === "all"
      ? localReports
      : localReports.filter((report) => report.status === filterStatus);

  if (!Array.isArray(localReports)) {
    return <Alert variant="danger">{t("errors.invalidData")}</Alert>;
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case "resolved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "secondary";
    }
  };

  const UserInfo = ({ user, lang }) => {
    const { t } = useTranslation("reporteusers");
    return user ? (
      <div
        className="d-flex align-items-center"
        lang={lang === "ar" ? "ar" : "es"}
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <img
          src={user.avatar}
          alt={user.username}
          className="rounded-circle me-2"
          width="30"
          height="30"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/30";
          }}
        />
        <div>
          <div>{user.username}</div>
          <small className="text-muted">{user.email}</small>
        </div>
      </div>
    ) : (
      <span>{t("unknownUser")}</span>
    );
  };

  const UserStatusBadges = ({ user }) => {
    return (
      <div className="d-flex flex-wrap gap-1">
        <Badge bg={user.isActive ? "success" : "warning"} className="mb-1">
          {user.isActive ? t("status.active") : t("status.inactive")}
        </Badge>
        <Badge bg={user.esBloqueado ? "danger" : "success"} className="mb-1">
          {user.esBloqueado ? t("status.blocked") : t("status.notBlocked")}
        </Badge>
      </div>
    );
  };

  const renderMobileView = () => {
    return (
      <div className="reports-list">
        {filteredReports.map((report) => (
          <Card key={report._id} className="mb-3 shadow-sm">
            <Card.Body>
              <Row>
                <Col xs={8}>
                  <div className="d-flex align-items-center mb-2">
                    <img
                      src={report.reportedBy?.avatar}
                      alt={report.reportedBy?.username}
                      className="rounded-circle me-2"
                      width="30"
                      height="30"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/30";
                      }}
                    />
                    <small className="text-muted">
                      {t("tableHeaders.reporter")}:{" "}
                      {report.reportedBy?.username || t("unknownUser")}
                    </small>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <img
                      src={report.userId?.avatar}
                      alt={report.userId?.username}
                      className="rounded-circle me-2"
                      width="30"
                      height="30"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/30";
                      }}
                    />
                    <small className="text-muted">
                      {t("tableHeaders.reportedUser")}:{" "}
                      {report.userId?.username || t("unknownUser")}
                    </small>
                  </div>
                  <h6 className="mb-1">
                    {report.postId?.title || t("notAvailable")}
                  </h6>
                  <p className="text-truncate small mb-1">
                    {report.reason || t("notSpecified")}
                  </p>
                  <small className="text-muted">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </small>
                  
                  {/* Mostrar estados del usuario */}
                  {report.userId && (
                    <div className="mt-2">
                      <UserStatusBadges user={report.userId} />
                    </div>
                  )}
                </Col>
                <Col
                  xs={4}
                  className="d-flex flex-column justify-content-between align-items-end"
                >
                  <Dropdown drop={isArabic ? "end" : "start"}>
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      size="sm"
                      id={`dropdown-${report._id}`}
                      className="p-1"
                    >
                      <ThreeDotsVertical />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleShowDetails(report)}>
                        <EyeFill
                          className={`me-2 ${isArabic ? "ms-2" : ""}`}
                        />
                        {t("actions.view")}
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="text-success"
                        onClick={() => handleResolve(report._id)}
                      >
                        <CheckCircleFill
                          className={`me-2 ${isArabic ? "ms-2" : ""}`}
                        />
                        {t("actions.resolve")}
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="text-danger"
                        onClick={() => handleReject(report._id)}
                      >
                        <XCircleFill
                          className={`me-2 ${isArabic ? "ms-2" : ""}`}
                        />
                        {t("actions.reject")}
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="text-warning"
                        onClick={() => handleToggleStatus(report.userId?._id)}
                      >
                        <UnlockFill
                          className={`me-2 ${isArabic ? "ms-2" : ""}`}
                        />
                        {report.userId?.isActive ? t("actions.deactivate") : t("actions.activate")}
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="text-danger"
                        onClick={() => confirmDelete(report.userId?._id)}
                      >
                        <TrashFill
                          className={`me-2 ${isArabic ? "ms-2" : ""}`}
                        />
                        {t("actions.delete")}
                      </Dropdown.Item>
                      {report.userId?.esBloqueado ? (
                        <Dropdown.Item
                          className="text-success"
                          onClick={() => handleUnblock(report.userId)}
                        >
                          <UnlockFill className={`me-2 ${isArabic ? "ms-2" : ""}`} />
                          {t("actions.unblock")}
                        </Dropdown.Item>
                      ) : (
                        <Dropdown.Item
                          className="text-danger"
                          onClick={() => handleBlock(report.userId)}
                        >
                          <LockFill className={`me-2 ${isArabic ? "ms-2" : ""}`} />
                          {t("actions.block")}
                        </Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                  <Badge bg={getStatusVariant(report.status)} className="mt-2">
                    {t(`status.${report.status}`)}
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
      </div>
    );
  };

  const renderDesktopView = () => {
    return (
      <div className="table-responsive" style={{ overflow: "visible" }}>
        <Table striped bordered hover className="align-middle">
          <thead className="table-dark">
            <tr>
              <th>{t("tableHeaders.reporter")}</th>
              <th>{t("tableHeaders.reportedUser")}</th>
              <th>{t("tableHeaders.postTitle")}</th>
              <th>{t("tableHeaders.reason")}</th>
              <th>{t("tableHeaders.date")}</th>
              <th>{t("tableHeaders.status")}</th>
              <th>{t("tableHeaders.userStatus")}</th>
              <th>{t("tableHeaders.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report._id}>
                <td>
                  <UserInfo user={report.reportedBy} lang={lang} />
                </td>
                <td>
                  <UserInfo user={report.userId} lang={lang} />
                </td>
                <td>{report.postId?.title || t("notAvailable")}</td>
                <td>{report.reason || t("notSpecified")}</td>
                <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                <td>
                  <Badge bg={getStatusVariant(report.status)}>
                    {t(`status.${report.status}`)}
                  </Badge>
                </td>
                <td>
                  {report.userId ? (
                    <UserStatusBadges user={report.userId} />
                  ) : (
                    <span className="text-muted">N/A</span>
                  )}
                </td>
                <td>
                  <div className="d-flex">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-1"
                      onClick={() => handleShowDetails(report)}
                    >
                      <EyeFill />
                    </Button>
                    <Dropdown drop={isArabic ? "end" : "start"}>
                      <Dropdown.Toggle
                        variant="outline-secondary"
                        size="sm"
                        id={`dropdown-${report._id}`}
                        className="p-1"
                      >
                        <ThreeDotsVertical />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          className="text-success"
                          onClick={() => handleResolve(report._id)}
                        >
                          <CheckCircleFill
                            className={`me-2 ${isArabic ? "ms-2" : ""}`}
                          />
                          {t("actions.resolve")}
                        </Dropdown.Item>
                        <Dropdown.Item
                          className="text-danger"
                          onClick={() => handleReject(report._id)}
                        >
                          <XCircleFill
                            className={`me-2 ${isArabic ? "ms-2" : ""}`}
                          />
                          {t("actions.reject")}
                        </Dropdown.Item>
                        <Dropdown.Item
                          className="text-warning"
                          onClick={() => handleToggleStatus(report.userId?._id)}
                        >
                          <UnlockFill
                            className={`me-2 ${isArabic ? "ms-2" : ""}`}
                          />
                          {report.userId?.isActive ? t("actions.deactivate") : t("actions.activate")}
                        </Dropdown.Item>
                        <Dropdown.Item
                          className="text-danger"
                          onClick={() => confirmDelete(report.userId?._id)}
                        >
                          <TrashFill
                            className={`me-2 ${isArabic ? "ms-2" : ""}`}
                          />
                          {t("actions.delete")}
                        </Dropdown.Item>
                        {report.userId?.esBloqueado ? (
                          <Dropdown.Item
                            className="text-success"
                            onClick={() => handleUnblock(report.userId)}
                          >
                            <UnlockFill className={`me-2 ${isArabic ? "ms-2" : ""}`} />
                            {t("actions.unblock")}
                          </Dropdown.Item>
                        ) : (
                          <Dropdown.Item
                            className="text-danger"
                            onClick={() => handleBlock(report.userId)}
                          >
                            <LockFill className={`me-2 ${isArabic ? "ms-2" : ""}`} />
                            {t("actions.block")}
                          </Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };

  return (
    <Container
      fluid
      className="py-4 report-container"
      style={{ direction: isArabic ? "rtl" : "ltr" }}
    >
      <h2 className="mb-4">{t("header.title")}</h2>

      <div className="d-flex justify-content-between mb-3 flex-wrap gap-2">
        <ButtonGroup className="flex-wrap">
          <Button
            variant={filterStatus === "all" ? "primary" : "outline-primary"}
            onClick={() => setFilterStatus("all")}
            className="mb-1"
          >
            {t("filters.all")}
          </Button>
          <Button
            variant={filterStatus === "pending" ? "warning" : "outline-warning"}
            onClick={() => setFilterStatus("pending")}
            className="mb-1"
          >
            <ClockHistory className="me-1" /> {t("filters.pending")}
          </Button>
          <Button
            variant={
              filterStatus === "resolved" ? "success" : "outline-success"
            }
            onClick={() => setFilterStatus("resolved")}
            className="mb-1"
          >
            <CheckCircleFill className="me-1" /> {t("filters.resolved")}
          </Button>
          <Button
            variant={filterStatus === "rejected" ? "danger" : "outline-danger"}
            onClick={() => setFilterStatus("rejected")}
            className="mb-1"
          >
            <XCircleFill className="me-1" /> {t("filters.rejected")}
          </Button>
        </ButtonGroup>
        <Badge bg="secondary" className="d-flex align-items-center mb-1">
          {t("totalReports")}: {localReports.length}
        </Badge>
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">{t("loading")}</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : filteredReports.length === 0 ? (
        <Alert variant="info">{t("noReports")}</Alert>
      ) : (
        <>{isMobile ? renderMobileView() : renderDesktopView()}</>
      )}

      {/* Modal de detalles */}
      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t("reportDetails")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReport && (
            <Row>
              <Col md={6}>
                <h6>{t("tableHeaders.reporter")}</h6>
                <UserInfo user={selectedReport.reportedBy} lang={lang} />

                <h6 className="mt-3">{t("tableHeaders.reportedUser")}</h6>
                <UserInfo user={selectedReport.userId} lang={lang} />

                <h6 className="mt-3">{t("tableHeaders.date")}</h6>
                <p>{new Date(selectedReport.createdAt).toLocaleString()}</p>

                <h6 className="mt-3">{t("tableHeaders.status")}</h6>
                <Badge bg={getStatusVariant(selectedReport.status)}>
                  {t(`status.${selectedReport.status}`)}
                </Badge>

                <h6 className="mt-3">{t("tableHeaders.userStatus")}</h6>
                {selectedReport.userId ? (
                  <UserStatusBadges user={selectedReport.userId} />
                ) : (
                  <span className="text-muted">N/A</span>
                )}
              </Col>
              <Col md={6}>
                <h6>{t("tableHeaders.postTitle")}</h6>
                <p>{selectedReport.postId?.title || t("notAvailable")}</p>

                <h6>{t("tableHeaders.reason")}</h6>
                <p>{selectedReport.reason || t("notSpecified")}</p>

                <h6>{t("additionalInfo")}</h6>
                <p>{selectedReport.additionalInfo || t("notProvided")}</p>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailsModal}>
            {t("close")}
          </Button>
          <Button
            variant="success"
            onClick={() => handleResolve(selectedReport?._id)}
          >
            <CheckCircleFill className="me-1" /> {t("actions.resolve")}
          </Button>
          <Button
            variant="danger"
            onClick={() => handleReject(selectedReport?._id)}
          >
            <XCircleFill className="me-1" /> {t("actions.reject")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('deleteModal.title', { ns: 'users' })}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('deleteModal.message', { ns: 'users' })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('deleteModal.cancel', { ns: 'users' })}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t('deleteModal.confirm', { ns: 'users' })}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de bloqueo */}
      {showBlockModal && selectedUser && (
        <BloqueModalUser
          show={showBlockModal}
          handleClose={handleCloseBlockModal}
          handleBlock={async (datosBloqueo) => {
            await handleBlockUser(datosBloqueo);
            onBlockSuccess();
          }}
          user={selectedUser}
        />
      )}
    </Container>
  );
};

export default ListaUsuariosDenunciados;