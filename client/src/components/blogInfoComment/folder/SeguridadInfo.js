import { Card, Container , Button} from "react-bootstrap";
import { FaShieldAlt, FaExternalLinkAlt ,FaArrowLeft} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from 'react-router-dom';
 
const SeguridadInfo = () => {
  const { languageReducer } = useSelector(state => state);
  const { t } = useTranslation('info');
  const lang = languageReducer.language || 'es';
const history = useHistory()
  const handleVerImagenes = () => {
    // Lógica para mostrar imágenes
  };
const handleGoBack = () => {
    history.push("/bloginfo");
  };
  return (
    <Container className="my-3">


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

      <h3 className="text-left mb-2">
        <FaShieldAlt className="me-2" style={{ color: "#6f42c1" }} />
        <span style={{ color: "#6f42c1" }}>{t('tituloPrincipalk', { lng: lang })}</span>
      </h3>

      <Card className="shadow-sm border-0 bg-light">
        <Card.Body className="p-1">
          <p className="fs-5">
            {t('descripcionSeguridad', { lng: lang })}
          </p>

          <div>
            <dl className="row">
              <dt className="col-sm-3">{t('encriptacionDatos', { lng: lang })}</dt>
              <dd className="col-sm-9">
                {t('descripcionEncriptacion.parte1', { lng: lang })} <strong>{t('descripcionEncriptacion.parte2', { lng: lang })}</strong>,{" "}
                {t('descripcionEncriptacion.parte3', { lng: lang })}
              </dd>

              <dt className="col-sm-3">{t('registroManual', { lng: lang })}</dt>
              <dd className="col-sm-9">
                {t('descripcionRegistro.parte1', { lng: lang })} <strong>{t('descripcionRegistro.parte2', { lng: lang })}</strong>.{" "}
                {t('descripcionRegistro.parte3', { lng: lang })} <em>{t('home', { lng: lang })}</em>{" "}
                {t('descripcionRegistro.parte4', { lng: lang })}
              </dd>

              <dt className="col-sm-3">{t('verificacionCorreo', { lng: lang })}</dt>
              <dd className="col-sm-9">
                {t('descripcionVerificacion.parte1', { lng: lang })} <strong>{t('descripcionVerificacion.parte2', { lng: lang })}</strong>.{" "}
                {t('descripcionVerificacion.parte3', { lng: lang })} <strong>{t('modal', { lng: lang })}</strong>{" "}
                {t('descripcionVerificacion.parte4', { lng: lang })}
              </dd>

              <dt className="col-sm-3">{t('prevencionPerfiles', { lng: lang })}</dt>
              <dd className="col-sm-9">
                {t('descripcionPrevencion.parte1', { lng: lang })} <strong>{t('24horas', { lng: lang })}</strong>{" "}
                {t('descripcionPrevencion.parte2', { lng: lang })}
              </dd>

              <dd className="col-sm-9">
                <dl className="row">
                  <p className="mb-0 flex-grow-1">
                    <span
                      className="text-info d-inline-flex align-items-center cursor-pointer"
                      onClick={handleVerImagenes}
                    >
                      <FaExternalLinkAlt className="me-1" />
                      <span className="ms-1">{t('verImagenes', { lng: lang })}</span>
                    </span>
                  </p>
                </dl>
              </dd>
            </dl>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SeguridadInfo;