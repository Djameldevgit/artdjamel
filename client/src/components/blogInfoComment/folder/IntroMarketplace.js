import React from "react";
import { Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Card,   Button } from "react-bootstrap"; 
 import { useHistory } from 'react-router-dom';
 import { FaArrowLeft } from "react-icons/fa";
const IntroMarketplace = () => {


  const { languageReducer } = useSelector(state => state); 
   const history = useHistory()
  const { t } = useTranslation('info');
  const lang = languageReducer.language || 'es';
   const handleGoBack = () => {
    history.push("/bloginfo");
  };
  return (
    <div className="my-2">


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
            <div className="p-1 text-center">
              {/* Título destacado */}
              <h1 className="fw-bold display-5 mb-3 text-gradient">
                 <span className="text-primary">{t('tassili')}</span>  <span className="text-primary">{t('tituloPrincipaleparte3')}</span>
              </h1>

              {/* Subtítulo breve */}
           

              {/* Descripción por secciones */}
              <p className="fs-6">
                {t('tecnologias.parte1')} <strong>{t('tecnologias.parte2')}</strong>,{" "}
                {t('tecnologias.parte3')}
              </p>

              <p className="fs-6">
                {t('disponibilidad.parte1')} <strong>{t('disponibilidad.parte2')}</strong>{" "}
                {t('disponibilidad.parte3')} <strong>{t('disponibilidad.parte4')}</strong>,{" "}
                {t('disponibilidad.parte5')}
              </p>

              <p className="fs-6">
                {t('pwa.parte1')} <strong>{t('pwa.parte2')}</strong>{" "}
                {t('pwa.parte3')}
              </p>

              {/* Cierre inspirador */}
           
            </div>
          </Card>
        </Col>
      </Row>

      {/* Estilo adicional con CSS inline o en archivo */}
      <style>
        {`
          .text-gradient {
            background: linear-gradient(90deg, #6a11cb, #2575fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        `}
      </style>
    </div>
  );
};

export default IntroMarketplace;