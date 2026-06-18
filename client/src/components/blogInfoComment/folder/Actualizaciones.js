import React from "react";
import { Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Card, Button } from "react-bootstrap";
import { useHistory } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";

const Actualizaciones = () => {
  const { languageReducer } = useSelector(state => state);
  const { t } = useTranslation('info'); 
   const history = useHistory()
  const lang = languageReducer.language || 'es';
  const handleGoBack = () => {
    history.push("/bloginfo");
  };
  return (
    <div className="my-4">
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
        <Col md={12}>
          <Card className="shadow-lg border-0 rounded-4">
            <div className="p-4">
              <h2 className="fw-bold text-center mb-4">
                🚀 {t('tituloPrincip', { lng: lang })}
              </h2>
              <p className="text-muted text-center fs-5 mb-4">
                {t('descripcionMejoras', { lng: lang })}
              </p>

              <ul className="fs-6">
                <li>
                  🔔 <strong>{t('notificacionesTiempoReal', { lng: lang })}:</strong> {t('descNotificaciones', { lng: lang })}
                </li>
                <li>
                  💾 <strong>{t('favoritosColecciones', { lng: lang })}:</strong> {t('descFavoritos', { lng: lang })}
                </li>
                <li>
                  🔍 <strong>{t('buscadorAvanza', { lng: lang })}:</strong> {t('descBuscador', { lng: lang })}
                </li>
                <li>
                  🎨 <strong>{t('panelArtistas', { lng: lang })}:</strong> {t('descPanelArtistas', { lng: lang })}
                </li>
                <li>
                  💬 <strong>{t('mensajeriaMejorada', { lng: lang })}:</strong> {t('descMensajeria', { lng: lang })}
                </li>
                <li>
                  🌙☀️ <strong>{t('modoOscuroClaro', { lng: lang })}:</strong> {t('descModoVisual', { lng: lang })}
                </li>
                <li>
                  ✅ <strong>{t('certificacionObras', { lng: lang })}:</strong> {t('descCertificacion', { lng: lang })}
                </li>
              </ul>

              <p className="fw-semibold text-center mt-4">
                {t('compromiso', { lng: lang })}
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Actualizaciones;