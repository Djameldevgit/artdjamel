// components/SlidersCategories/CategoryCarousel.jsx
import React, { useState, useEffect, memo } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { Container, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom'; // por si acaso

// Mapeo con URLs DIRECTAS de Cloudinary (copia las tuyas aquí)
const IMAGES_BY_CATEGORY = {
  vehicules: {
    main: [
      "https://res.cloudinary.com/dfjipgj2o/image/upload/v1773266802/caoumiajj_rnev3f.jpg",
      'https://res.cloudinary.com/dfjipgj2o/image/upload/v1773123129/caoumiajj_ywdbrh.jpg',
       "https://images.unsplash.com/photo-1508798179027-a00aa5326443?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHZlaGljdWxlc3xlbnwwfHwwfHx8MA%3D%3D"
    ],
    side: [
      'https://plus.unsplash.com/premium_photo-1742418773865-5b8956a240c6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHZlaGljdWxlc3xlbnwwfHwwfHx8MA%3D%3D',
      'https://www.google.com/imgres?imgurl=https%3A%2F%2Fimg.freepik.com%2Fvector-premium%2Fmotocicleta-deportiva-azul-negra-aislada-sobre-fondo-transparente_1190923-3559.jpg%3Fsemt%3Dais_rp_50_assets%26w%3D740%26q%3D80&tbnid=UWuv9qsIDeRZcM&vet=10CAUQxiAoAWoXChMI4MGg_-yYkwMVAAAAAB0AAAAAEAc..i&imgrefurl=https%3A%2F%2Fwww.freepik.es%2Fvectores%2Fmotos-png%2F3&docid=Qj-3xghxPDvAsM&w=740&h=740&q=motos%20png&ved=0CAUQxiAoAWoXChMI4MGg_-yYkwMVAAAAAB0AAAAAEAc',
    "https://plus.unsplash.com/premium_photo-1661963005592-182d602c6a3f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fG1vdG9zfGVufDB8fDB8fHww"
    ]
  },
  vetements: {
    main: [
      'https://res.cloudinary.com/dfjipgj2o/image/upload/v1773190250/caoumiajj2jkkj_d5aupo.jpg',
      'https://res.cloudinary.com/dfjipgj2o/image/upload/v1773190404/caoumiajj2jk_vlvrcr.jpg',
    ],
    side: [
      'https://res.cloudinary.com/dfjipgj2o/image/upload/v1773190618/images_7_kde9te.jpg',
      
      'https://res.cloudinary.com/dfjipgj2o/image/upload/v1773190860/vetementshj_cyuuax.jpg',
    ]
  },
  electromenager: {
    main: [
      'https://res.cloudinary.com/dfjipgj2o/image/upload/v1773123380/informatiqueh_oyusnb.png',
      'https://images.unsplash.com/photo-1593642634367-d91a135587b5?auto=format&fit=crop&w=1200&q=80',
    ],
    side: [
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
    ]
  },
  immobilier: {
    main: [
      'https://res.cloudinary.com/dfjipgj2o/image/upload/v1773108619/caoumiajj2j5_fyk8cb.png',
      'https://res.cloudinary.com/dfjipgj2o/image/upload/v1773109156/caoumiajj2j5_upqzol.png',
    ],
    side: [
      'https://res.cloudinary.com/dfjipgj2o/image/upload/v1773110425/carousjhjhj_q9ff3p.png',
      'https://res.cloudinary.com/dfjipgj2o/image/upload/v1773110423/carousjhjhj2_j7hxqx.png',
    ]
  },
  alimentaires: {
    main: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80',
    ],
    side: [
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=600&q=80',
    ]
  },
  emploi: {
    main: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80',
    ],
    side: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1573495612937-f0195ee9d2bf?auto=format&fit=crop&w=600&q=80',
    ]
  },
  informatique: {
    main: [
      'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80',
    ],
    side: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=600&q=80',
    ]
  },
  loisirs: {
    main: [
      'https://images.unsplash.com/photo-1511882150382-4210563a7220?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?auto=format&fit=crop&w=1200&q=80',
    ],
    side: [
      'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    ]
  },
  materiaux: {
    main: [
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&w=1200&q=80',
    ],
    side: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    ]
  },
  meubles: {
    main: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928501493-82e4ec4b0fa0?auto=format&fit=crop&w=1200&q=80',
    ],
    side: [
      'https://images.unsplash.com/photo-1567016432779-094069958ea1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    ]
  },
  'pieces-detachees': {
    main: [
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1619642751034-7656df90394b?auto=format&fit=crop&w=1200&q=80',
    ],
    side: [
      'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&w=600&q=80',
    ]
  },
  'sante-beaute': {
    main: [
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=80',
    ],
    side: [
      'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    ]
  },
  services: {
    main: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80',
    ],
    side: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1573495612937-f0195ee9d2bf?auto=format&fit=crop&w=600&q=80',
    ]
  },
  sport: {
    main: [
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    ],
    side: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80',
    ]
  },
  voyages: {
    main: [
      'https://agenciaune.com/wp-content/uploads/2020/02/a6b425_48880d306dd5487ab1f9fed9a4ab7f91_mv2.jpg',
      "https://res.cloudinary.com/dfjipgj2o/image/upload/v1773191664/0000000000000000hj_lzx59w.png",
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    ],
    side: [
      'https://res.cloudinary.com/dfjipgj2o/image/upload/v1773191664/0000000000000000hj_lzx59w.png',
      'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=600&q=80',
      'https://img.freepik.com/vector-gratis/fondo-vacaciones-dias-festivos-maleta-globo-realista-camara-fotos_1284-10476.jpg?semt=ais_hybrid&w=740&q=80',
    ]
  },
  boutiques: {
    main: [
      'https://res.cloudinary.com/dfjipgj2o/image/upload/v1773123759/boutiue_cj6v8e.png',
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1200&q=80',
    ],
    side: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1447958374760-1ce70cf11ee3?auto=format&fit=crop&w=600&q=80',
    ]
  },
  telephone: {
    main: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80',
    ],
    side: [
      'https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=600&q=80',
    ]
  }
};

// Fallback con Unsplash
const FALLBACK_IMAGES = {
  main: [
    'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
  ],
  side: [
    'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=600&q=80',
  ]
};

const CategoryCarousel = memo(({ categorySlug }) => {
  // Si no nos pasan la prop, intentamos obtenerlo de la URL
  const params = useParams();
  const slug = categorySlug || params.category || params.slug;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mainImages, setMainImages] = useState([]);
  const [sideImages, setSideImages] = useState([]);

  useEffect(() => {
    console.log('🎯 CategoryCarousel - slug recibido:', slug);
    const images = IMAGES_BY_CATEGORY[slug] || FALLBACK_IMAGES;
    console.log('📸 Imágenes seleccionadas:', images);
    setMainImages(images.main);
    setSideImages(images.side?.length ? images.side : images.main);
    setCurrentIndex(0);
  }, [slug]);

  // Autoplay
  useEffect(() => {
    if (mainImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % mainImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [mainImages]);

  if (mainImages.length === 0) {
    console.log('⚠️ No hay imágenes para mostrar');
    return null;
  }

  const slidesText = [
    { title: slug?.toUpperCase() || 'Marketplace', description: 'Découvrez nos meilleures offres' },
    { title: 'Nouveautés', description: 'Les dernières tendances' },
    { title: 'Promotions', description: 'Jusqu’à -50%' }
  ];

  // Versión móvil
  if (isMobile) {
    return (
      <Container fluid style={{ padding: '5px' }}>
        <Carousel activeIndex={currentIndex} onSelect={setCurrentIndex} fade indicators controls>
          {mainImages.map((src, index) => (
            <Carousel.Item key={index}>
              <img
                src={src}
                alt={slidesText[index]?.title}
                style={{ width: '100%', height: '164px', objectFit: 'cover', borderRadius: '10px' }}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <Carousel.Caption>
                <h6>{slidesText[index]?.title}</h6>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>
    );
  }

  // Versión escritorio
  return (
    <Container fluid style={{ padding: '7px' }}>
      <Row className="g-0">
        <Col lg={9} style={{ paddingRight: '5px' }}>
          <Carousel activeIndex={currentIndex} onSelect={setCurrentIndex} fade indicators controls>
            {mainImages.map((src, index) => (
              <Carousel.Item key={index}>
                <img
                  src={src}
                  alt={slidesText[index]?.title}
                  style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '12px' }}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                <Carousel.Caption>
                  <h3>{slidesText[index]?.title}</h3>
                  <p>{slidesText[index]?.description}</p>
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>
        <Col lg={3} className="d-none d-lg-block" style={{ paddingLeft: 0 }}>
          <Carousel activeIndex={currentIndex} onSelect={setCurrentIndex} indicators={false} controls={false}>
            {sideImages.map((src, index) => (
              <Carousel.Item key={index}>
                <img
                  src={src}
                  alt="side"
                  style={{ width: '100%', height: '250px', objectFit: 'cover'  ,borderRadius: '12px' }}
                  loading="lazy"
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>
      </Row>
    </Container>
  );
});

export default CategoryCarousel;