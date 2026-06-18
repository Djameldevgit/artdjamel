import React, { useState } from "react";
import { Card, Container, Button,  Modal, Carousel } from "react-bootstrap";
import {
 
  FaUserEdit,
 FaArrowLeft ,
  FaExternalLinkAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTimes
} from "react-icons/fa";
 
// Datos de las imágenes (ajusta los nombres según tus archivos en /public/images/)
const IMAGENES_POR_METODO = {
  google: [
    "/images/a.jpg",
    "/images/djamel1.jpg"
  ],
  facebook: [
    "/images/djamel0.jpg",
    "/images/djamel1.jpg"
  ],
  manual: [
    "/images/djamel0.jpg",
    "/images/djamel1.jpg"
  ]
};
import { useHistory } from 'react-router-dom';

const Introducion = () => {
  const [showModal, setShowModal] = useState(false);
  const [imagenesModal, setImagenesModal] = useState([]);
  const [tituloModal, setTituloModal] = useState("");
  const history = useHistory()
  const handleVerImagenes = (metodo) => {
    setImagenesModal(IMAGENES_POR_METODO[metodo]);
    setTituloModal(`Registro con ${metodo.charAt(0).toUpperCase() + metodo.slice(1)}`);
    setShowModal(true);
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
        <FaUserEdit className="me-2" style={{ color: "#6f42c1" }} />
        <span style={{ color: "#6f42c1" }}>¿Cómo registrarme?</span>
      </h3>


      <Card className="shadow-sm border-0 bg-light">
        <Card.Body className="p-1">
          <p className="fs-5">
            Para aprovechar todas las funciones de la aplicación el sistema te permite registrarse con <strong className="text-primary">3 formas</strong> difirentes:
          </p>
          <div>
            <dl className="row">

              <dt className="col-sm-3">Crear una cuenta manualmente</dt>
              <dd className="col-sm-9">  necesitas crear una cuenta gratuita con tu correo nombre de usuario y una contasena.</dd>

              <dt className="col-sm-3"> usando el button Google </dt>
              <dd className="col-sm-9">
                <p>si tienes cuenta de google simplemente hacer click sobre le button de google y estaras en un momento dentro de la aplicacion.</p>
              </dd>

              <dt className="col-sm-3">usando el button de facebook</dt>
              <dd className="col-sm-9">si tienes una cuenta de facebool simplemente hacer click sobre el button de login con facebook .</dd>


              <dd className="col-sm-9">
                <dl className="row">

                  <p className="mb-0 flex-grow-1">
                    <span
                      className="text-info d-inline-flex align-items-center cursor-pointer"
                      onClick={() => handleVerImagenes("google")}
                    >
                      <FaExternalLinkAlt className="me-1" />
                      <span className="ms-1">ver imágenes</span>
                    </span>
                  </p>   </dl>
              </dd>
            </dl>
          </div>
          <div>
            <h3 className="text-left mb-2">
         
              <span style={{ color: "#6f42c1" }}>¿Olvidaste la contasena?</span>
            </h3>

            <dl className="row">

              <dt className="col-sm-3">Crear una cuenta manualmente</dt>
              <dd className="col-sm-9">  necesitas crear una cuenta gratuita con tu correo nombre de usuario y una contasena.</dd>


              <dd className="col-sm-9">
                <dl className="row">

                  <p className="mb-0 flex-grow-1">
                    <span
                      className="text-info d-inline-flex align-items-center cursor-pointer"
                      onClick={() => handleVerImagenes("google")}
                    >
                      <FaExternalLinkAlt className="me-1" />
                      <span className="ms-1">ver imágenes</span>
                    </span>
                  </p>   </dl>
              </dd>
            </dl>




          </div>


          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            centered
            size="lg"
          >
            <Modal.Header closeButton className="border-0">
              <Modal.Title>{tituloModal}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
              <Carousel
                prevIcon={<FaChevronLeft className="text-dark" />}
                nextIcon={<FaChevronRight className="text-dark" />}
                indicators
              >
                {imagenesModal.map((imagen, index) => (
                  <Carousel.Item key={index}>
                    <img
                      className="d-block w-100 rounded"
                      src={imagen}
                      alt={`Paso ${index + 1}`}
                    />
                    <Carousel.Caption className="bg-dark bg-opacity-50 rounded">
                      <p className="mb-0">Paso {index + 1}</p>
                    </Carousel.Caption>
                  </Carousel.Item>
                ))}
              </Carousel>
            </Modal.Body>
            <Modal.Footer className="border-0 justify-content-center">
              <Button
                variant="outline-secondary"
                onClick={() => setShowModal(false)}
                className="d-flex align-items-center"
              >
                <FaTimes className="me-2" />
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Introducion;