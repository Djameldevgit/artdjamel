 
import { FaEnvelope , FaArrowLeft  } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Card, Container,   Button } from "react-bootstrap";
import { useHistory } from 'react-router-dom';

const ContactoComunicacion = () => {
  const { languageReducer } = useSelector(state => state);
  const { t } = useTranslation('info');  
  const history = useHistory()
  const lang = languageReducer.language || 'es';
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
        <FaEnvelope className="me-2" style={{ color: "#6f42c1" }} />
        <span style={{ color: "#6f42c1" }}>{t('tituloPrincipalll', { lng: lang })}</span>
      </h3>

      <Card className="shadow-sm border-0 bg-light">
        <Card.Body className="p-1">
          <p className="fs-5">
            {t('descripcionPlataforma', { lng: lang })}
          </p>

          <div>
            <dl className="row">
              <dt className="col-sm-3">{t('formularioContacto', { lng: lang })}</dt>
              <dd className="col-sm-9">
                {t('descripcionFormulario.parte1', { lng: lang })} <strong>{t('autenticadoVerificado', { lng: lang })}</strong>{" "}
                {t('descripcionFormulario.parte2', { lng: lang })} <strong>{t('formularioContacto', { lng: lang })}</strong>.{" "}
                {t('descripcionFormulario.parte3', { lng: lang })} <em>{t('titulo', { lng: lang })}</em>{" "}
                {t('y', { lng: lang })} <em>{t('descripcionAsunto', { lng: lang })}</em>,{" "}
                {t('descripcionFormulario.parte4', { lng: lang })} <strong>{t('enviar', { lng: lang })}</strong>{" "}
                {t('descripcionFormulario.parte5', { lng: lang })}
              </dd>

              <dt className="col-sm-3">{t('chatAdministradores', { lng: lang })}</dt>
              <dd className="col-sm-9">
                {t('descripcionChat.parte1', { lng: lang })} <strong>{t('chatTiempoReal', { lng: lang })}</strong>{" "}
                {t('descripcionChat.parte2', { lng: lang })}
              </dd>

              <dt className="col-sm-3">{t('atencionPersonalizada', { lng: lang })}</dt>
              <dd className="col-sm-9">
                {t('descripcionAtencion.parte1', { lng: lang })} <strong>{t('comunicacionCercana', { lng: lang })}</strong>{" "}
                {t('descripcionAtencion.parte2', { lng: lang })}
              </dd>
            </dl>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ContactoComunicacion;