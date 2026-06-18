import React from 'react';
import { Card, Button, Container, Carousel, Image } from 'react-bootstrap';
import { FaInstagram, FaGlobe , FaArrowLeft} from 'react-icons/fa';
import { useHistory } from 'react-router-dom';

 
const ArtistProfile = () => {  
  const history = useHistory()
  // Datos del artista (puedes pasarlos como props o traerlos de tu API)
  const artistData = {
    name: "Diego Rivera",
    bio: "Pintor mexicano reconocido por sus murales de contenido social en edificios públicos.",
    technique: "Muralismo al fresco",
    years: "1886-1957",
    images: [
      process.env.PUBLIC_URL + "/djamel0.jpg",
      process.env.PUBLIC_URL + "/djamel1.jpg",
      process.env.PUBLIC_URL + "/djamel2.jpg"
    ],
    instagram: "@diegorivera.art",
    website: "www.diegorivera.org"
  };
 const handleGoBack = () => {
    history.push("/bloginfo");
  };
  return (
    <Container className="mb-5 artist-highlight">
 
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

      <Card className="border-0 shadow-sm">
        <div className="artist-grid">
          {/* Carrusel de imágenes */}
          <div className="artist-gallery">
            <Carousel fade indicators={false} interval={5000}>
              {artistData.images.filter(img => img).map((img, index) => (
                <Carousel.Item key={index}>
                  <div className="image-container">
                    <Image
                      src={img}
                      alt={`Obra ${index + 1} de ${artistData.name}`}
                      className="artist-image"
                      fluid
                      loading="lazy"
                    />
                  </div>
                  <Carousel.Caption>
                    <div className="image-caption">
                      {artistData.name} - Obra {index + 1}
                    </div>
                  </Carousel.Caption>
                </Carousel.Item>
              ))}
            </Carousel>
          </div>
          
          {/* Información del artista */}
          <div className="artist-info">
            <Card.Body>
              <h2 className="artist-name">{artistData.name}</h2>
              <div className="artist-meta">
                <span className="artist-technique">{artistData.technique}</span>
                <span className="mx-2 text-muted">•</span>
                <span className="artist-years">{artistData.years}</span>
              </div>
              
              <p className="artist-bio">{artistData.bio}</p>
              
              <div className="artist-social mt-4">
                {artistData.instagram && (
                  <Button 
                    variant="outline-dark" 
                    size="sm" 
                    href={`https://instagram.com/${artistData.instagram.replace('@', '')}`}
                    target="_blank"
                  >
                    <FaInstagram className="me-1" /> {artistData.instagram}
                  </Button>
                )}
                
                {artistData.website && (
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="ms-2"
                    href={artistData.website.startsWith('http') ? artistData.website : `https://${artistData.website}`}
                    target="_blank"
                  >
                    <FaGlobe className="me-1" /> Sitio web
                  </Button>
                )}
              </div>
            </Card.Body>
          </div>
        </div>
        
        {/* Timeline artístico */}
        <div className="artist-timeline-section p-4 border-top">
          <h5 className="mb-3">Trayectoria destacada</h5>
          <div className="timeline-container">
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="timeline-year">1922</div>
                <div>Primer mural en la Escuela Nacional Preparatoria</div>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="timeline-year">1932</div>
                <div>Exposición individual en el MoMA, Nueva York</div>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="timeline-year">1947</div>
                <div>Mural "Sueño de una tarde dominical en la Alameda Central"</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Container>
  );
};
export default ArtistProfile