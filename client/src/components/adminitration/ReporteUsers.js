import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getReports } from "../../redux/actions/reportUserAction";
import {
  Container,
  Table,
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
  PencilFill,
  TrashFill,
  UnlockFill,
  ThreeDotsVertical,
  EyeFill
} from "react-bootstrap-icons";

const ReporteUsers = () => {
  const { auth, languageReducer } = useSelector((state) => state);
  const { reports, loading } = useSelector((state) => state.reportReducer);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation('reporteusers');

  // Cambiar el idioma activamente si es diferente
  const lang = languageReducer.language || 'es';
  if (i18n.language !== lang) i18n.changeLanguage(lang);
  const isArabic = lang === "ar";
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detectar cambios en el tamaño de la pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const handleShowDetails = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  const handleDelete = (userId) => {
    if (userId) {
      // Implementar lógica de eliminación
      console.log("Eliminar usuario:", userId);
    } else {
      console.error("ID de usuario no válido");
    }
  };

  const handleDeactivate = (userId) => {
    if (userId) {
      // Implementar lógica de desactivación
      console.log("Desactivar usuario:", userId);
    } else {
      console.error("ID de usuario no válido");
    }
  };

  if (!Array.isArray(reports)) {
    return <Alert variant="danger">{t("errors.invalidData")}</Alert>;
  }

  // Función para obtener el variant del Badge según el estado
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Resuelto':
        return 'success';
      case 'En revisión':
        return 'warning';
      case 'Pendiente':
        return 'secondary';
      case 'Rechazado':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Vista para dispositivos móviles
  const renderMobileView = () => {
    return (
      <div className="reports-list" >
        {reports.map((report) =>U (
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
                        e.target.src = 'https://via.placeholder.com/30';
                      }}
                    />
                    <small className="text-muted">{t("tableHeadersss.reporter")}: {report.reportedBy?.username || t("unknownUser")}</small>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <img
                      src={report.userId?.avatar}
                      alt={report.userId?.username}
                      className="rounded-circle me-2"
                      width="30"
                      height="30"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/30';
                      }}
                    />
                    <small className="text-muted">{t("tableHeadersss.reportedUser")}: {report.userId?.username || t("unknownUser")}</small>
                  </div>
                  <h6 className="mb-1">{report.postId?.title || t("notAvailable")}</h6>
                  <p className="text-truncate small mb-1">{report.reason || t("notSpecified")}</p>
                  <small className="text-muted">{new Date(report.createdAt).toLocaleString()}</small>
                </Col>
                <Col xs={4} className="d-flex flex-column justify-content-between align-items-end">
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
                        <EyeFill className={`me-2 ${isArabic ? "ms-2" : ""}`} />
                        {t("actions.view")}
                      </Dropdown.Item>
                      <Dropdown.Item disabled>
                        <PencilFill className={`me-2 ${isArabic ? "ms-2" : ""}`} />
                        {t("actions.edit")}
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="text-warning"
                        onClick={() => handleDeactivate(report.userId?._id)}
                      >
                        <UnlockFill className={`me-2 ${isArabic ? "ms-2" : ""}`} />
                        {t("actions.deactivate")}
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="text-danger"
                        onClick={() => handleDelete(report.userId?._id)}
                      >
                        <TrashFill className={`me-2 ${isArabic ? "ms-2" : ""}`} />
                        {t("actions.delete")}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Badge bg={getStatusVariant(report.status)} className="mt-2">
                    {report.status || t("status.pending")}
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
      </div>
    );
  };

  // Vista para escritorio
  const renderDesktopView = () => {
    return (
      <div className="table-responsive" style={{ overflow: "visible" }}>
        <Table striped bordered hover className="align-middle">
          <thead className="table-dark">
            <tr>
              <th>{t("tableHeadersss.reporter")}</th>
              <th>{t("tableHeadersss.reportedUser")}</th>
                  <th>{t("tableHeadersss.postTitle")}</th>
                  <th>{t("tableHeadersss.reason")}</th>
                  <th>{t("tableHeadersss.date")}</th>
                  <th>{t("tableHeadersss.status")}</th>
                  <th>{t("tableHeadersss.actionss")}</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id}>
                <td><UserInfo user={report.reportedBy} lang={lang} /></td>
                <td><UserInfo user={report.userId} lang={lang} /></td>
                <td>{report.postId?.title || t("notAvailable")}</td>
                <td>{report.reason || t("notSpecified")}</td>
                <td>{new Date(report.createdAt).toLocaleString()}</td>
                <td>
                  <Badge bg={getStatusVariant(report.status)}>
                    {report.status || t("status.pending")}
                  </Badge>
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
                        <Dropdown.Item disabled>
                          <PencilFill className={`me-2 ${isArabic ? "ms-2" : ""}`} />
                          {t("actions.edit")}
                        </Dropdown.Item>
                        <Dropdown.Item
                          className="text-warning"
                          onClick={() => handleDeactivate(report.userId?._id)}
                        >
                          <UnlockFill className={`me-2 ${isArabic ? "ms-2" : ""}`} />
                          {t("actions.deactivate")}
                        </Dropdown.Item>
                        <Dropdown.Item
                          className="text-danger"
                          onClick={() => handleDelete(report.userId?._id)}
                        >
                          <TrashFill className={`me-2 ${isArabic ? "ms-2" : ""}`} />
                          {t("actions.delete")}
                        </Dropdown.Item>
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
    <Container fluid className="py-4 report-container" style={{   direction: isArabic ? "rtl" : "ltr" }}>
      <h2 className="mb-4">{t("headerrr.title")}</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">{t("loading")}</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : reports.length === 0 ? (
        <Alert variant="info">{t("noReports")}</Alert>
      ) : (
        <>
          {isMobile ? renderMobileView() : renderDesktopView()}
        </>
      )}

      {/* Modal para detalles del reporte */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t("reportDetails")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReport && (
            <Row>
              <Col md={6}>
                <h6>{t("tableHeadersss.reporter")}</h6>
                <UserInfo user={selectedReport.reportedBy} lang={lang} />
                
                <h6 className="mt-3">{t("tableHeadersss.reportedUser")}</h6>
                <UserInfo user={selectedReport.userId} lang={lang} />
                
                <h6 className="mt-3">{t("tableHeadersss.date")}</h6>
                <p>{new Date(selectedReport.createdAt).toLocaleString()}</p>
              </Col>
              <Col md={6}>
                <h6>{t("tableHeadersss.postTitle")}</h6>
                <p>{selectedReport.postId?.title || t("notAvailable")}</p>
                
                <h6>{t("tableHeadersss.reason")}</h6>
                <p>{selectedReport.reason || t("notSpecified")}</p>
                
                <h6>{t("tableHeadersss.status")}</h6>
                <Badge bg={getStatusVariant(selectedReport.status)}>
                  {selectedReport.status || t("status.pending")}
                </Badge>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t("close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

const UserInfo = ({ user, lang }) => {
  const { t } = useTranslation("reporteusers");
  return user ? (
    <div className="d-flex align-items-center" lang={lang === "ar" ? "ar" : "es"}>
      <img
        src={user.avatar}
        alt={user.username}
        className="rounded-circle me-2"
        width="30"
        height="30"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/30';
        }}
      />
      <span>{user.username}</span>
    </div>
  ) : (
    <span>{t("unknownUser")}</span>
  );
};

export default ReporteUsers;