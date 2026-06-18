import React from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Palette, Code, Award, Globe, Brush, Lightbulb, Heart, Rocket } from "react-bootstrap-icons";

const BlogPortafolio= () => {
  const { languageReducer } = useSelector(state => state);
  const lang = languageReducer.language || "es";
  const { t } = useTranslation("info");

  return (
    <Container className="my-5 py-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          {/* Encabezado */}
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-primary mb-3">Djamel Baouali</h1>
            <p className="lead text-muted">{t("subtituloo", { lng: lang })}</p>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <Badge bg="primary" className="p-2 fs-6">
                <Palette className="me-1" /> {t("badgeArtista", { lng: lang })}
              </Badge>
              <Badge bg="info" className="p-2 fs-6">
                <Code className="me-1" /> {t("badgeDesarrollador", { lng: lang })}
              </Badge>
            </div>
          </div>

          {/* Sección de Introducción */}
          <Row className="mb-5">
            <Col md={12}>
              <Card className="border-0 shadow-sm bg-light">
                <Card.Body className="p-4 text-center">
                  <Heart size={36} className="text-danger mb-3" />
                  <h4 className="card-title mb-3">{t("introduccionTitulo", { lng: lang })}</h4>
                  <p className="card-text">{t("introduccionTexto", { lng: lang })}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Trayectoria Artística */}
          <Row className="align-items-center mb-5">
            <Col md={6}>
              <div className="p-4 rounded bg-light shadow-sm h-100">
                <h3 className="mb-4 fw-bold">{t("tituloTrayectoria", { lng: lang })}</h3>
                <p className="mb-4">{t("trayectoria1", { lng: lang })}</p>
                <p className="mb-4">{t("trayectoria2", { lng: lang })}</p>
                
                <div className="d-flex align-items-center mb-3">
                  <Award className="text-warning me-3" size={24} />
                  <span>{t("premio", { lng: lang })}</span>
                </div>
              </div>
            </Col>
            <Col md={6} className="text-center">
              <div className="p-3">
                <Palette size={80} className="text-primary mb-3" />
                <Code size={80} className="text-info" />
              </div>
            </Col>
          </Row>

          {/* Dualidad Artística-Técnica */}
          <Row className="mb-5">
            <Col md={12}>
              <Card className="border-0 shadow-sm bg-gradient-primary text-white">
                <Card.Body className="p-4">
                  <h4 className="card-title mb-4">
                    <Lightbulb className="me-2" size={24} />
                    {t("dualidadTitulo", { lng: lang })}
                  </h4>
                  <p className="card-text">{t("dualidadDescripcion", { lng: lang })}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Motivación y Desafíos */}
          <Row className="mb-5">
            <Col md={12}>
              <h3 className="mb-4 fw-bold text-center">{t("motivacionTitulo", { lng: lang })}</h3>
              <p className="mb-4">{t("motivacion1", { lng: lang })}</p>
              <p className="mb-4">{t("motivacion2", { lng: lang })}</p>
              <p className="mb-4">{t("motivacion3", { lng: lang })}</p>
            </Col>
          </Row>

          {/* Solución Técnica */}
          <Row className="mb-5">
            <Col md={12}>
              <Card className="border-0 shadow-sm bg-info text-white">
                <Card.Body className="p-4">
                  <h4 className="card-title mb-4">
                    <Rocket className="me-2" size={24} />
                    {t("solucionTitulo", { lng: lang })}
                  </h4>
                  <p className="card-text">{t("solucionTexto", { lng: lang })}</p>
                  <p className="card-text">{t("solucionTexto2", { lng: lang })}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Visión de Futuro */}
          <Row>
            <Col md={12}>
              <Card className="border-0 shadow-sm bg-light">
                <Card.Body className="p-4 text-center">
                  <Globe size={48} className="text-success mb-3" />
                  <h4 className="card-title mb-3">{t("visionTitulo", { lng: lang })}</h4>
                  <p className="card-text">{t("visionDescripcion", { lng: lang })}</p>
                  <p className="card-text fst-italic">{t("visionFinal", { lng: lang })}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default BlogPortafolio