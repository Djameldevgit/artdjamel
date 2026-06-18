import React from "react";
import { Link, useHistory } from "react-router-dom";
import {
  PersonCircle,
  ShieldShaded,
  CodeSlash,
  JournalText,
  Search,
  Globe,
  Envelope,
  House,
  Gear,
  Bell,
  ChatDots // Nuevo ícono para comentarios
} from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const AccordionTitles = () => {
  const history = useHistory();
  const { languageReducer } = useSelector(state => state);
  const lang = languageReducer.language || "es";
  const { t } = useTranslation("info");

  const goToSection = (section) => {
    history.push("/infoaAplicacion", { scrollTo: section });
  };

  const mainTitles = [
    { label: t("titulos.intro", { lng: lang }), path: "intro", icon: House },
    { label: t("titulos.registro", { lng: lang }), path: "registro", icon: PersonCircle },
    { label: t("titulos.seguridad", { lng: lang }), path: "seguridadInfo", icon: ShieldShaded },
    { label: t("titulos.publicaciones", { lng: lang }), path: "publicaciones", icon: JournalText },
    { label: t("titulos.busqueda", { lng: lang }), path: "busqueda", icon: Search },
    { label: t("titulos.contacto", { lng: lang }), path: "contacto", icon: Envelope },
    { label: t("titulos.idioma", { lng: lang }), path: "lenguaje", icon: Globe },
    { label: t("titulos.administracion", { lng: lang }), path: "admin", icon: Gear },
    { label: t("titulos.blog", { lng: lang }), path: "blog", icon: JournalText },
    { label: t("titulos.actualizaciones", { lng: lang }), path: "actualizaciones", icon: Bell },
    { label: t("titulos.desarrollo", { lng: lang }), path: "tecnologias", icon: CodeSlash },
    // Nuevo elemento para comentarios
    { label: t("titulos.comentarios", { lng: lang }), path: "/commentss", icon: ChatDots, external: true }
  ];

  const colors = [
    "#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b",
    "#6f42c1", "#fd7e14", "#20c9a6", "#3498db", "#9b59b6", "#2ecc71", "#e84393" // Color adicional para comentarios
  ];

  return (
    <div style={{marginTop:'10'}} >
      <h2 className="text-center mb-3 fw-bold text-primary" style={{ fontSize: "1.5rem" }}>
        {t("centroAyuda.titulo", { lng: lang })}
      </h2>
      <p className="text-center text-muted mb-4" style={{ fontSize: "0.9rem" }}>
        {t("centroAyuda.descripcion", { lng: lang })}
      </p>

      <div className="row g-1 justify-content-center">
        {mainTitles.map((title, index) => {
          const IconComponent = title.icon;
          const bgColor = colors[index % colors.length];
          
          // Si es un enlace externo (como el de comentarios)
          if (title.external) {
            return (
              <div key={index} className="col-6 col-sm-4 col-md-3 col-lg-2">
                <Link 
                  to={title.path}
                  className="btn w-100 border-0 p-2 d-block text-decoration-none"
                  style={{
                    backgroundColor: bgColor,
                    color: "white",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    minHeight: "70px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "800",
                    fontSize: "1rem",
                    boxShadow: `0 2px 4px ${bgColor}40`,
                    margin: "2px"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = `0 4px 8px ${bgColor}60`;
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = `0 2px 4px ${bgColor}40`;
                  }}
                >
                  <IconComponent size={16} className="mb-1" />
                  <span style={{ lineHeight: "1.1" }}>{title.label}</span>
                </Link>
              </div>
            );
          }
          
          // Para los botones normales que navegan dentro de la misma página
          return (
            <div key={index} className="col-6 col-sm-4 col-md-3 col-lg-2">
              <button
                className="btn w-100 border-0 p-2"
                style={{
                  backgroundColor: bgColor,
                  color: "white",
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  minHeight: "70px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "800",
                  fontSize: "1rem",
                  boxShadow: `0 2px 4px ${bgColor}40`,
                  margin: "2px"
                }}
                onClick={() => goToSection(title.path)}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = `0 4px 8px ${bgColor}60`;
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = `0 2px 4px ${bgColor}40`;
                }}
              >
                <IconComponent size={16} className="mb-1" />
                <span style={{ lineHeight: "1.1" }}>{title.label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccordionTitles;