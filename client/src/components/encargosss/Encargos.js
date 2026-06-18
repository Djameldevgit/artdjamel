import React from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge,
  Alert,
  ListGroup,
  Accordion 
} from 'react-bootstrap';
import { 
  FaPalette, 
  FaRuler, 
  FaEuroSign, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaShieldAlt,
  FaPaperPlane, 
  FaComments,
  FaUserCircle
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Encargos = () => {
  const { t, i18n } = useTranslation('encargos');
  const { auth, languageReducer } = useSelector(state => state);
 
  // Cambiar el idioma activamente si es diferente
  const lang = languageReducer.language || 'es';
  if (i18n.language !== lang) i18n.changeLanguage(lang);

  const requirements = [
    { icon: FaPalette, title: t('requirements.style.title'), items: t('requirements.style.items', { returnObjects: true }) },
    { icon: FaRuler, title: t('requirements.measurements.title'), items: t('requirements.measurements.items', { returnObjects: true }) },
    { icon: FaPalette, title: t('requirements.technique.title'), items: t('requirements.technique.items', { returnObjects: true }) },
    { icon: FaPalette, title: t('requirements.theme.title'), items: t('requirements.theme.items', { returnObjects: true }) },
    { icon: FaPalette, title: t('requirements.support.title'), items: t('requirements.support.items', { returnObjects: true }) },
    { icon: FaPalette, title: t('requirements.reference.title'), items: t('requirements.reference.items', { returnObjects: true }) }
  ];

  const processSteps = [
    { step: 1, title: t('process.consultation.title'), description: t('process.consultation.description') },
    { step: 2, title: t('process.quote.title'), description: t('process.quote.description') },
    { step: 3, title: t('process.deposit.title'), description: t('process.deposit.description') },
    { step: 4, title: t('process.creation.title'), description: t('process.creation.description') },
    { step: 5, title: t('process.approval.title'), description: t('process.approval.description') },
    { step: 6, title: t('process.payment.title'), description: t('process.payment.description') },
    { step: 7, title: t('process.shipping.title'), description: t('process.shipping.description') }
  ];

  // Textos dinámicos para el prefill del formulario de contacto
  const getCommissionPrefillData = () => {
    return {
      title: t('commissionPrefill.title'),
      message: t('commissionPrefill.message')
    };
  };

  return (
    <Container className="py-5" style={{
      direction: lang === 'ar' ? 'rtl' : 'ltr',
      textAlign: lang === 'ar' ? 'right' : 'left'
    }}>
      {/* Header Section */}
      <Row className="text-center mb-5">
        <Col>
          <h1 className="display-4 fw-bold text-primary mb-3">
            <FaPalette className="me-3" />
            {t('title')}
          </h1>
          <p className="lead">{t('subtitle')}</p>
          <Badge bg="success" className="fs-6 p-2">
            {t('specialOffer')}
          </Badge>
        </Col>
      </Row>

      {/* Alert importante */}
      <Alert variant="info" className="mb-4">
        <FaExclamationTriangle className="me-2" />
        <strong>{t('importantNote')}</strong>
        <br />
        {t('importantDescription')}
      </Alert>

      {/* Introducción */}
      <Row className="mb-5">
        <Col lg={8} className="mx-auto">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4">{t('welcome.title')}</h3>
              <p className="fs-5">{t('welcome.description1')}</p>
              <p className="fs-5">{t('welcome.description2')}</p>
              
              <Alert variant="success" className="mt-3">
                <FaCheckCircle className="me-2" />
                <strong>{t('guarantee.title')}</strong>: {t('guarantee.description')}
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Requisitos de Especificación */}
      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">{t('specificationRequirements')}</h2>
          <p className="text-center mb-4">{t('specificationDescription')}</p>
          
          <Row>
            {requirements.map((req, index) => (
              <Col md={6} lg={4} key={index} className="mb-3">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <req.icon className="text-primary me-2" size={24} />
                      <h5 className="mb-0">{req.title}</h5>
                    </div>
                    <ListGroup variant="flush">
                      {Array.isArray(req.items) && req.items.map((item, idx) => (
                        <ListGroup.Item key={idx} className="px-0 py-1 border-0">
                          • {item}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Proceso de Encargo */}
      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">{t('process.title')}</h2>
          
          <div className="timeline">
            {processSteps.map((step, index) => (
              <Card key={index} className="mb-3 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <Badge bg="primary" className="me-3 fs-5" style={{ width: '40px', height: '40px' }}>
                      {step.step}
                    </Badge>
                    <div>
                      <h5 className="mb-1">{step.title}</h5>
                      <p className="mb-0 text-muted">{step.description}</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </Col>
      </Row>

      {/* Información de Pagos */}
      <Row className="mb-5">
        <Col lg={10} className="mx-auto">
          <Card className="border-warning">
            <Card.Header className="bg-warning text-dark">
              <h4 className="mb-0">
                <FaEuroSign className="me-2" />
                {t('payment.title')}
              </h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h5>{t('payment.deposit.title')}</h5>
                  <p>{t('payment.deposit.description')}</p>
                  <ul>
                    <li>{t('payment.deposit.points.secure')}</li>
                    <li>{t('payment.deposit.points.materials')}</li>
                    <li>{t('payment.deposit.points.reservation')}</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h5>{t('payment.final.title')}</h5>
                  <p>{t('payment.final.description')}</p>
                  <ul>
                    <li>{t('payment.final.points.balance')}</li>
                    <li>{t('payment.final.points.shipping')}</li>
                    <li>{t('payment.final.points.secure')}</li>
                  </ul>
                </Col>
              </Row>
              
              <Alert variant="info" className="mt-3">
                <FaShieldAlt className="me-2" />
                <strong>{t('payment.guarantee.title')}</strong>: {t('payment.guarantee.description')}
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tiempos de Entrega */}
      <Row className="mb-5">
        <Col lg={8} className="mx-auto">
          <Card className="border-info">
            <Card.Header  >
              <h4 className="mb-0">
                <FaClock className="me-2" />
                {t('delivery.title')}
              </h4>
            </Card.Header>
            <Card.Body>
              <p>{t('delivery.description')}</p>
              <Row>
                <Col md={6}>
                  <h6>{t('delivery.standard.title')}</h6>
                  <p className="text-muted">{t('delivery.standard.time')}</p>
                </Col>
                <Col md={6}>
                  <h6>{t('delivery.express.title')}</h6>
                  <p className="text-muted">{t('delivery.express.time')}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* FAQ Section */}
      <Row className="mb-5">
        <Col lg={10} className="mx-auto">
          <h2 className="text-center mb-4">{t('faq.title')}</h2>
          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header>{t('faq.q1.question')}</Accordion.Header>
              <Accordion.Body>{t('faq.q1.answer')}</Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>{t('faq.q2.question')}</Accordion.Header>
              <Accordion.Body>{t('faq.q2.answer')}</Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>{t('faq.q3.question')}</Accordion.Header>
              <Accordion.Body>{t('faq.q3.answer')}</Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>

      {/* Call to Action */}
      <Row className="text-center">
        <Col>
          <Card className="bg-primary text-white">
            <Card.Body className="py-5">
              <h3 className="mb-3">{t('cta.title')}</h3>
              <p className="fs-5 mb-4">{t('cta.description')}</p>

              <div className="d-flex flex-wrap justify-content-center gap-3">
                {/* Botón Contacto - CORREGIDO */}
                <Button 
                  as={Link} 
                  to={{
                    pathname: "/users/contactt",
                    state: {
                      fromEncargos: true,
                      prefillTitle: t('commissionPrefill.title'),
                      prefillMessage: t('commissionPrefill.message')
                    }
                  }}
                  variant="light" 
                  size="lg"
                  className="d-flex align-items-center"
                >
                  <FaPaperPlane className="me-2" />
                  {t('cta.emailButton')}
                </Button>

                {/* Botón Chat Directo */}
                {auth.user ? (
                  <Button 
                    as={Link}
                    to="/message?type=commission&to=admin"
                    variant="outline-light" 
                    size="lg"
                    className="d-flex align-items-center"
                  >
                    <FaComments className="me-2" />
                    {t('cta.chatButton')}
                  </Button>
                ) : (
                  <Button 
                    variant="outline-light" 
                    size="lg"
                    className="d-flex align-items-center"
                    onClick={() => {
                      localStorage.setItem('redirectAfterLogin', '/encargos');
                      localStorage.setItem('chatAfterLogin', 'commission');
                      window.location.href = '/login';
                    }}
                  >
                    <FaUserCircle className="me-2" />
                    {t('cta.loginButton')}
                  </Button>
                )}

                {/* Botón Galería */}
                <Button 
                  variant="outline-light" 
                  size="lg"
                  as={Link}
                  to="/djamelartgaleria"
                  className="d-flex align-items-center"
                >
                  <FaPalette className="me-2" />
                  {t('cta.galleryButton')}
                </Button>
              </div>

              <div className="mt-4 text-center">
                <small>
                  <FaClock className="me-1" />
                  <strong>{t('cta.responseTime')}</strong> • 
                  <FaEuroSign className="ms-2 me-1" />
                  <strong>{t('cta.freeQuote')}</strong>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Encargos;