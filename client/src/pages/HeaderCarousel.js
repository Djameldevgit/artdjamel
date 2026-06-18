import React from 'react';
import { useTranslation } from 'react-i18next';
import Carousel from 'react-bootstrap/Carousel';

function HeaderCarousel() {
  const { t } = useTranslation('headercarousel');

  // Rutas de las imágenes en la carpeta public/images/
  const carouselImages = [
    '/images/banner1.jpg',
    '/images/banner2.jpg', 
    '/images/banner0.jpg',
    '/images/banner4.jpg',
    '/images/banner5.jpg',
    '/images/banner7.jpg'
  ];

  // Textos traducidos para cada slide - MISMAS CANTIDAD QUE IMÁGENES
  const slides = [
    {
      title: t('carousel.title1', 'Nouvelle Collection Printemps'),
      description: t('carousel.desc1', 'Découvrez les dernières tendances de la saison')
    },
    {
      title: t('carousel.title2', 'Soldes Exceptionnelles'),
      description: t('carousel.desc2', 'Jusqu\'à -50% sur toute la boutique')
    },
    {
      title: t('carousel.title3', 'Livraison Gratuite'),
      description: t('carousel.desc3', 'Partout en Algérie à partir de 3000 DZD')
    },
    {
      title: t('carousel.title4', 'Mode Homme & Femme'),
      description: t('carousel.desc4', 'Des styles uniques pour tous les goûts')
    },
    {
      title: t('carousel.title5', 'Qualité Garantie'),
      description: t('carousel.desc5', 'Des matériaux premium et une confection soignée')
    },
    {
      title: t('carousel.title6', 'Nouveautés Quotidiennes'),
      description: t('carousel.desc6', 'Découvrez nos nouvelles arrivées chaque jour')
    }
  ];

  return (
    <Carousel 
      data-bs-theme="light" 
      fade 
      interval={4000}
      indicators={true}
      controls={true}
      style={{
        height: 'auto',
        minHeight: '250px'
      }}
    >
      {carouselImages.map((image, index) => {
        const slide = slides[index] || {
          title: t('carousel.defaultTitle', 'Tassili Fashion'),
          description: t('carousel.defaultDesc', 'Votre destination mode préférée')
        };
        
        return (
          <Carousel.Item key={index}>
            <div 
              className="d-block w-100"
              style={{
                // 🔥 ALTURA RESPONSIVA PARA TODOS LOS DISPOSITIVOS
                height: 'calc(40vh + 10vw)', // Fórmula responsiva
                maxHeight: '300px', // Límite para PC
                minHeight: '250px', // Mínimo para móvil
                overflow: 'hidden',
                backgroundColor: '#f8f9fa'
              }}
            >
              <img
                src={image}
                alt={slide.title}  
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
                
              />
            </div>
         
            <Carousel.Caption 
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(1px)',
                borderRadius: '10px',
                padding: '20px',
                bottom: '20px',
                left: '10%',
                right: '10%',
                textAlign: 'center', // 🔥 TEXTO CENTRADO
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <h3 
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                  fontWeight: '700',
                  marginBottom: '10px',
                  color: '#D5DCE8',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                  textAlign: 'center' // 🔥 TEXTO CENTRADO
                }}
              >
                {slide.title}
              </h3>
              <p 
                style={{
                  fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                  fontWeight: '500',
                  color: '#f8f8f8',
                  marginBottom: '0',
                  textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
                  textAlign: 'center' // 🔥 TEXTO CENTRADO
                }}
              >
                {slide.description}
              </p>
            </Carousel.Caption>
          </Carousel.Item>
        );
      })}
    </Carousel>
  );
}

export default HeaderCarousel;