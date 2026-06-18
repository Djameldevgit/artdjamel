import { Card, Container, Button } from "react-bootstrap";
import { FaSearch, FaExternalLinkAlt ,FaArrowLeft} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { useHistory } from 'react-router-dom';

const Search = () => {
  const { languageReducer } = useSelector((state) => state);
  const { t } = useTranslation("info");
  const lang = languageReducer.language || "es";
const history = useHistory()
  // 🔹 referencia al bloque de usuarios autenticados
  const autenticadosRef = useRef(null);

  const handleVerImagenes = () => {
    console.log("Ver imágenes de búsqueda");
  };

  const handleScrollToAutenticados = () => {
    if (autenticadosRef.current) {
      autenticadosRef.current.scrollIntoView({ behavior: "smooth" });
    }
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
        <FaSearch className="me-2" style={{ color: "#6f42c1" }} />
        <span style={{ color: "#6f42c1" }}>
          {t("comoFuncionaLaBusqueda", { lng: lang })}
        </span>
      </h3>

      <Card className="shadow-sm border-0 bg-light">
        <Card.Body className="p-1">
          <p className="fs-5">
            {t("sistemaBusquedaPart1", { lng: lang })}{" "}
            <strong className="text-primary">
              {t("busquedaInteligente", { lng: lang })}
            </strong>{" "}
            {t("sistemaBusquedaPart2", { lng: lang })}
          </p>

          <div>
            <dl className="row">
              {/* 🔹 Usuarios sin autenticación */}
              <dt className="col-sm-3">
                {t("usuariosSinAutenticacion", { lng: lang })}
              </dt>
              <dd className="col-sm-9">
                {t("descripcionBusquedaSimplePart1", { lng: lang })}{" "}
                <strong>{t("inputBusquedaSimple", { lng: lang })}</strong>{" "}
                {t("descripcionBusquedaSimplePart2", { lng: lang })}{" "}
                <em>{t("categoria", { lng: lang })}</em>,{" "}
                <em>{t("tema", { lng: lang })}</em> {t("o", { lng: lang })}{" "}
                <em>{t("estilo", { lng: lang })}</em>. {t("tambienAdmite", { lng: lang })}{" "}
                <em>{t("combinacion1", { lng: lang })}</em>{" "}
                {t("o", { lng: lang })} <em>{t("combinacion2", { lng: lang })}</em>.
              </dd>

              {/* 🔹 Usuarios autenticados con ref */}
              <dt className="col-sm-3">
                {t("usuariosAutenticados", { lng: lang })}
              </dt>
              <dd className="col-sm-9" ref={autenticadosRef}>
                {t("tienenAcceso", { lng: lang })}{" "}
                <strong>{t("buscadorAvanzado", { lng: lang })}</strong>{" "}
                {t("enTiempoReal", { lng: lang })}. {t("aquiSePueden", { lng: lang })}:
                <ul className="mb-1">
                  <li>{t("categoria", { lng: lang })}</li>
                  <li>{t("tema", { lng: lang })}</li>
                  <li>{t("estilo", { lng: lang })}</li>
                  <li>{t("titulo", { lng: lang })}</li>
                  <li>{t("fechaPublicacion", { lng: lang })}</li>
                </ul>
                {t("facilitaEncontrar", { lng: lang })}
              </dd>

              {/* 🔹 Link de ver imágenes */}
              <dd className="col-sm-9">
                <dl className="row">
                  <p className="mb-0 flex-grow-1">
                    <span
                      className="text-info d-inline-flex align-items-center cursor-pointer"
                      onClick={handleVerImagenes}
                    >
                      <FaExternalLinkAlt className="me-1" />
                      <span className="ms-1">{t("verImagenes", { lng: lang })}</span>
                    </span>
                  </p>
                </dl>
              </dd>
            </dl>
          </div>

          {/* 🔹 Botón para probar el scroll */}
          <div className="text-center mt-3">
            <Button variant="outline-primary" onClick={handleScrollToAutenticados}>
              🔎 Scroll a usuarios autenticados
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Search;
