import React from "react";
import { Row, Col, Card,   Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";

const Admin = () => {
  const { languageReducer } = useSelector(state => state);
  const { t } = useTranslation('info'); 
   const history = useHistory()
  const lang = languageReducer.language || 'es';
   const handleGoBack = () => {
    history.push("/bloginfo");
  };
  return (
    <div>
      <Row className="justify-content-center">
   
  <div className="mb-3">
  <Button
    variant="outline-primary"
    onClick={handleGoBack}
    className="d-flex align-items-center"
    style={{
      borderRadius: "20px",
      padding: "0.3rem 1rem",
      fontSize: "0.9rem",
      fontWeight: "500"
    }}
  >
  <FaArrowLeft className="me-1 mt-1 d-none d-sm-inline" />
  {t("atras", { lng: lang })}
  </Button>
</div>

        <Col>
          <Card className="shadow-lg border-0 rounded-4">
            <div className="p-4 text-center">
              <h2 className="fw-bold mb-3">{t('tituloPrincipal0', { lng: lang })}</h2>

              <p className="text-muted fs-5">
                🔒 {t('descripcionPlataformaa', { lng: lang })}
              </p>

              <p className="fs-6">
                {t('equipoAdmin.parte1', { lng: lang })} <strong>{t('evaluarPosts', { lng: lang })}</strong>,{" "}
                <strong>{t('moderarComentarios', { lng: lang })}</strong> {t('y', { lng: lang })} <strong>{t('supervisarUsuarios', { lng: lang })}</strong>,{" "}
                {t('equipoAdmin.parte2', { lng: lang })}
              </p>

              <p className="fs-6">
                {t('sistemaSeguridad.parte1', { lng: lang })} <strong>{t('correosReportes', { lng: lang })}</strong>.{" "}
                {t('sistemaSeguridad.parte2', { lng: lang })}
              </p>

              <p className="fs-6">
                {t('funcionalidadApp.parte1', { lng: lang })} <strong>{t('adminUnClic', { lng: lang })}</strong>.{" "}
                {t('funcionalidadApp.parte2', { lng: lang })}
              </p>

              <p className="fw-semibold mt-3">
                🛡️ {t('garantiaFinal', { lng: lang })}
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Admin;