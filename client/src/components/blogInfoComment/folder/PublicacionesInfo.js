import { forwardRef, useRef, useImperativeHandle } from "react";
import { Card, Container , Button} from "react-bootstrap";
import { FaPlusCircle,FaArrowLeft } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from 'react-router-dom';

// 👇 PublicacionesInfo recibe ref y expone scrollIntoView al padre
const PublicacionesInfo = forwardRef((props, ref) => {
  const { languageReducer } = useSelector((state) => state);
  const { t } = useTranslation("info");
  const lang = languageReducer.language || "es";
const history = useHistory()
  // ref interno apuntando al título
  const titleRef = useRef(null);

  // 👇 Exponemos una función scroll al padre
  useImperativeHandle(ref, () => ({
    scrollToTitle: () => {
      if (titleRef.current) {
        titleRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }));
  const handleGoBack = () => {
    history.push("/bloginfo");
  };
  return (
    <div style={{
        direction: lang === "ar" ? "rtl" : "ltr",
        textAlign: lang === "ar" ? "right" : "left"
      }}
    >
      
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
        <h3 ref={titleRef} className="text-left mb-2">
          <FaPlusCircle className="me-2" style={{ color: "#6f42c1" }} />
          <span style={{ color: "#6f42c1" }}>
            {t("tituloPublicaciones", { lng: lang })}
          </span>
        </h3>

        <Card className="shadow-sm border-0 bg-light">
          <Card.Body className="p-1">
            <p className="fs-5">
              {t("descripcionArtistasPart1", { lng: lang })}{" "}
              <strong>{t("autenticadosVerificados", { lng: lang })}</strong>{" "}
              {t("descripcionArtistasPart2", { lng: lang })}
            </p>

            <div>
              <dl className="row">
                <dt className="col-sm-3">{t("comoPublicar", { lng: lang })}</dt>
                <dd className="col-sm-9">
                  {t("descripcionComoPublicarPart1", { lng: lang })}{" "}
                  <strong>{t("iconoPlus", { lng: lang })}</strong>{" "}
                  {t("descripcionComoPublicarPart2", { lng: lang })}{" "}
                  <strong>{t("menuAvatar", { lng: lang })}</strong>.{" "}
                  {t("alPublicar", { lng: lang })}{" "}
                  <em>{t("exitoOFracaso", { lng: lang })}</em>{" "}
                  {t("delEnvio", { lng: lang })}.
                </dd>

                <dt className="col-sm-3">
                  {t("revisionContenido", { lng: lang })}
                </dt>
                <dd className="col-sm-9">
                  {t("descripcionRevisionPart1", { lng: lang })}{" "}
                  <strong>{t("revisionAdministradores", { lng: lang })}</strong>.{" "}
                  {t("descripcionRevisionPart2", { lng: lang })}
                </dd>

                <dt className="col-sm-3">
                  {t("aprobacionVisibilidad", { lng: lang })}
                </dt>
                <dd className="col-sm-9">
                  {t("descripcionAprobacionPart1", { lng: lang })}{" "}
                  <strong>{t("home", { lng: lang })}</strong>,{" "}
                  {t("descripcionAprobacionPart2", { lng: lang })}{" "}
                  <em>{t("misPublicaciones", { lng: lang })}</em>{" "}
                  {t("descripcionAprobacionPart3", { lng: lang })}
                </dd>

                <dt className="col-sm-3">{t("gestionPost", { lng: lang })}</dt>
                <dd className="col-sm-9">
                  {t("descripcionGestionPart1", { lng: lang })}{" "}
                  <strong>{t("detallePost", { lng: lang })}</strong>{" "}
                  {t("descripcionGestionPart2", { lng: lang })}{" "}
                  <strong>{t("editar", { lng: lang })}</strong>{" "}
                  {t("o", { lng: lang })}{" "}
                  <strong>{t("eliminar", { lng: lang })}</strong>{" "}
                  {t("descripcionGestionPart3", { lng: lang })}
                </dd>

                <dt className="col-sm-3">
                  {t("interaccionTiempoReal", { lng: lang })}
                </dt>
                <dd className="col-sm-9">
                  {t("descripcionInteraccionPart1", { lng: lang })}{" "}
                  <strong>{t("comentar", { lng: lang })}</strong>, {t("dar", { lng: lang })}{" "}
                  <strong>{t("like", { lng: lang })}</strong>{" "}
                  {t("descripcionInteraccionPart2", { lng: lang })}{" "}
                  <strong>{t("chatPrivado", { lng: lang })}</strong>{" "}
                  {t("descripcionInteraccionPart3", { lng: lang })}
                </dd>
              </dl>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
});

export default PublicacionesInfo;
