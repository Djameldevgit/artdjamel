// src/components/administration/Reports/ReportsTab.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getReports } from "../../../redux/actions/reportUserAction";
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

// Recibimos props del AdminDashboard
const ReportsTab = ({ filters = {}, token: propToken }) => {
  const { auth, languageReducer } = useSelector((state) => state);
  const { reports, loading } = useSelector((state) => state.reportReducer);
  const dispatch = useDispatch();
  
  // Token prioritario: el que viene por props o el de Redux
  const authToken = propToken || auth?.token;
  
  const lang = languageReducer?.language || 'es';
  const isArabic = lang === "ar";
  
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Ref para evitar llamadas duplicadas
  const isInitialMount = useRef(true);
  const previousFilters = useRef({});

  // Detectar cambios en el tamaño de la pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función para obtener reportes - ESTABLE con useCallback
  const fetchReports = useCallback(async () => {
    if (!authToken) return;
    
    try {
      await dispatch(getReports(authToken));
    } catch (err) {
      setError("Error al cargar los reportes");
    }
  }, [authToken, dispatch]);

  // Efecto principal para cargar reportes - SOLO UNA VEZ
  useEffect(() => {
    if (authToken && isInitialMount.current) {
      isInitialMount.current = false;
      fetchReports();
    }
  }, [authToken, fetchReports]);

  // Efecto para aplicar filtros - SOLO cuando filters cambia realmente
  useEffect(() => {
    // Verificar si los filtros realmente cambiaron
    const filtersChanged = JSON.stringify(previousFilters.current) !== JSON.stringify(filters);
    
    if (filtersChanged && Object.keys(filters).length > 0 && !isInitialMount.current) {
      console.log('Filtros aplicados en Reports:', filters);
      previousFilters.current = filters;
      // Aquí aplicas los filtros
      fetchReports();
    }
  }, [filters, fetchReports]);

  const handleShowDetails = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  const handleDelete = (userId) => {
    if (userId && window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      console.log("Eliminar usuario:", userId);
    } else if (!userId) {
      console.error("ID de usuario no válido");
    }
  };

  const handleDeactivate = (userId) => {
    if (userId && window.confirm("¿Estás seguro de que deseas desactivar este usuario?")) {
      console.log("Desactivar usuario:", userId);
    } else if (!userId) {
      console.error("ID de usuario no válido");
    }
  };

  if (!Array.isArray(reports)) {
    return <Alert variant="danger">Error: Datos de reportes inválidos</Alert>;
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

  // Función para obtener el texto del estado en español
  const getStatusText = (status) => {
    switch (status) {
      case 'Resuelto':
        return 'Resuelto';
      case 'En revisión':
        return 'En revisión';
      case 'Pendiente':
        return 'Pendiente';
      case 'Rechazado':
        return 'Rechazado';
      default:
        return 'Pendiente';
    }
  };

  // Componente de información de usuario
  const UserInfo = ({ user }) => {
    return user ? (
      <div className="d-flex align-items-center">
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
      <span>Usuario desconocido</span>
    );
  };

  // Vista para dispositivos móviles
  const renderMobileView = () => {
    return (
      <div className="reports-list">
        {reports.map((report) => (
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
                    <small className="text-muted">Reportado por: {report.reportedBy?.username || "Usuario desconocido"}</small>
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
                    <small className="text-muted">Usuario reportado: {report.userId?.username || "Usuario desconocido"}</small>
                  </div>
                  <h6 className="mb-1">{report.postId?.title || "No disponible"}</h6>
                  <p className="text-truncate small mb-1">{report.reason || "No especificado"}</p>
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
                        Ver detalles
                      </Dropdown.Item>
                      <Dropdown.Item disabled>
                        <PencilFill className={`me-2 ${isArabic ? "ms-2" : ""}`} />
                        Editar
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="text-warning"
                        onClick={() => handleDeactivate(report.userId?._id)}
                      >
                        <UnlockFill className={`me-2 ${isArabic ? "ms-2" : ""}`} />
                        Desactivar usuario
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="text-danger"
                        onClick={() => handleDelete(report.userId?._id)}
                      >
                        <TrashFill className={`me-2 ${isArabic ? "ms-2" : ""}`} />
                        Eliminar usuario
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Badge bg={getStatusVariant(report.status)} className="mt-2">
                    {getStatusText(report.status)}
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
              <th>Reportado por</th>
              <th>Usuario reportado</th>
              <th>Título del post</th>
              <th>Razón</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id}>
                <td><UserInfo user={report.reportedBy} /></td>
                <td><UserInfo user={report.userId} /></td>
                <td>{report.postId?.title || "No disponible"}</td>
                <td>{report.reason || "No especificado"}</td>
                <td>{new Date(report.createdAt).toLocaleString()}</td>
                <td>
                  <Badge bg={getStatusVariant(report.status)}>
                    {getStatusText(report.status)}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-1"
                      onClick={() => handleShowDetails(report)}
                      title="Ver detalles"
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
                          Editar
                        </Dropdown.Item>
                        <Dropdown.Item
                          className="text-warning"
                          onClick={() => handleDeactivate(report.userId?._id)}
                        >
                          <UnlockFill className={`me-2 ${isArabic ? "ms-2" : ""}`} />
                          Desactivar usuario
                        </Dropdown.Item>
                        <Dropdown.Item
                          className="text-danger"
                          onClick={() => handleDelete(report.userId?._id)}
                        >
                          <TrashFill className={`me-2 ${isArabic ? "ms-2" : ""}`} />
                          Eliminar usuario
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
    <Container fluid className="py-4 report-container" style={{ direction: isArabic ? "rtl" : "ltr" }}>
      <h2 className="mb-4">Gestión de Reportes</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Cargando reportes...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : reports.length === 0 ? (
        <Alert variant="info">No hay reportes disponibles</Alert>
      ) : (
        <>
          {isMobile ? renderMobileView() : renderDesktopView()}
        </>
      )}

      {/* Modal para detalles del reporte */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Reporte</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReport && (
            <Row>
              <Col md={6}>
                <h6>Reportado por</h6>
                <UserInfo user={selectedReport.reportedBy} />
                
                <h6 className="mt-3">Usuario reportado</h6>
                <UserInfo user={selectedReport.userId} />
                
                <h6 className="mt-3">Fecha</h6>
                <p>{new Date(selectedReport.createdAt).toLocaleString()}</p>
              </Col>
              <Col md={6}>
                <h6>Título del post</h6>
                <p>{selectedReport.postId?.title || "No disponible"}</p>
                
                <h6>Razón del reporte</h6>
                <p>{selectedReport.reason || "No especificado"}</p>
                
                <h6>Estado</h6>
                <Badge bg={getStatusVariant(selectedReport.status)}>
                  {getStatusText(selectedReport.status)}
                </Badge>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ReportsTab;