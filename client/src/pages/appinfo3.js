import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Accordion, 
  Badge,
  Button
} from 'react-bootstrap';
import {
  FaMobileAlt,
  FaChrome,
  FaDownload,
  FaRocket,
  FaShieldAlt,
  FaStore,
  FaUsers,
  FaChartLine,
  FaHome,
  FaCog,
  FaHandshake
} from 'react-icons/fa';

const appinfo3 = () => {
  const [activeKey, setActiveKey] = useState('0');

  const features = [
    {
      icon: <FaShieldAlt size={30} />,
      title: "Audiencia Real",
      description: "Filtra automáticamente cuentas falsas y conecta con clientes genuinos",
      color: "primary"
    },
    {
      icon: <FaDownload size={30} />,
      title: "Instalación Directa",
      description: "Sin tiendas de aplicaciones, instalación en un clic desde tu navegador",
      color: "success"
    },
    {
      icon: <FaHome size={30} />,
      title: "Espacio Propio",
      description: "Tu casa digital independiente de redes sociales tradicionales",
      color: "warning"
    },
    {
      icon: <FaChartLine size={30} />,
      title: "Dashboard Completo",
      description: "Monitoriza usuarios reales y sus interacciones con tus contenidos",
      color: "info"
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Primer Acceso",
      content: "Usa cualquier navegador para acceder inicialmente a la aplicación",
      icon: <FaChrome />
    },
    {
      step: 2,
      title: "Instalación",
      content: "Haz clic en el botón de instalación del navbar - proceso rápido y seguro",
      icon: <FaDownload />
    },
    {
      step: 3,
      title: "Uso Directo",
      content: "Abre tu app directamente como cualquier otra aplicación en tu dispositivo",
      icon: <FaMobileAlt />
    },
    {
      step: 4,
      title: "Registro Único",
      content: "Tus clientes se registran una vez y acceden para siempre sin repetir procesos",
      icon: <FaUsers />
    }
  ];

  return (
    <Container className="my-5">
      {/* Header Principal */}
      <Row className="text-center mb-5">
        <Col>
          <h1 className="display-4 fw-bold text-primary mb-3">
            <FaRocket className="me-3" />
            Tu Aplicación Web Progresiva
          </h1>
          <p className="lead text-muted">
            Independencia digital y control total en una plataforma moderna y fácil de usar
          </p>
          <Badge bg="success" className="fs-6 p-2 mb-4">
            🚀 Sin tiendas de aplicaciones - Instalación directa
          </Badge>
        </Col>
      </Row>

      {/* Características Principales */}
      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">
            <FaShieldAlt className="me-2" />
            ¿Qué Hace Especial Esta Plataforma?
          </h2>
          <Row>
            {features.map((feature, index) => (
              <Col md={6} lg={3} key={index} className="mb-3">
                <Card className="h-100 border-0 shadow-sm hover-lift">
                  <Card.Body className="text-center p-4">
                    <div className={`text-${feature.color} mb-3`}>
                      {feature.icon}
                    </div>
                    <h5 className="fw-bold">{feature.title}</h5>
                    <p className="text-muted small">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Proceso de Instalación */}
      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">
            <FaMobileAlt className="me-2" />
            Instalación en 4 Pasos Sencillos
          </h2>
          <Row>
            {steps.map((step, index) => (
              <Col lg={3} md={6} key={index} className="mb-4">
                <Card className="h-100 border-0 bg-light">
                  <Card.Body className="text-center p-4">
                    <Badge 
                      bg="primary" 
                      className="fs-5 mb-3"
                      style={{ width: '40px', height: '40px', lineHeight: '28px' }}
                    >
                      {step.step}
                    </Badge>
                    <div className="text-primary mb-3">
                      {step.icon}
                    </div>
                    <h6 className="fw-bold">{step.title}</h6>
                    <p className="text-muted small mb-0">{step.content}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Preguntas Frecuentes */}
      <Row>
        <Col lg={8} className="mx-auto">
          <h2 className="text-center mb-4">
            <FaCog className="me-2" />
            Preguntas Frecuentes
          </h2>
          <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
            {/* Pregunta 1 */}
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <strong>¿Necesito seguir usando Chrome después de instalar?</strong>
              </Accordion.Header>
              <Accordion.Body>
                <div className="d-flex align-items-start">
                  <FaChrome className="text-primary me-3 mt-1" />
                  <div>
                    <strong>No es necesario.</strong> Solo usas el navegador la primera vez para instalar. 
                    Después abres la aplicación directamente como cualquier otra app en tu dispositivo. 
                    Es como tener WhatsApp o Facebook directamente en tu pantalla principal.
                  </div>
                </div>
              </Accordion.Body>
            </Accordion.Item>

            {/* Pregunta 2 */}
            <Accordion.Item eventKey="1">
              <Accordion.Header>
                <strong>¿Cómo empiezo a probar la administración?</strong>
              </Accordion.Header>
              <Accordion.Body>
                <div className="d-flex align-items-start">
                  <FaChartLine className="text-success me-3 mt-1" />
                  <div>
                    <strong>Proceso gradual:</strong>
                    <ul className="mt-2 mb-0">
                      <li>Primero dominas las publicaciones básicas</li>
                      <li>Luego recibes acceso al dashboard completo</li>
                      <li>Monitorizas usuarios y sus acciones en tiempo real</li>
                      <li>Identificas clientes potenciales automáticamente</li>
                    </ul>
                  </div>
                </div>
              </Accordion.Body>
            </Accordion.Item>

            {/* Pregunta 3 */}
            <Accordion.Item eventKey="2">
              <Accordion.Header>
                <strong>¿Qué ventajas tengo sobre las redes sociales?</strong>
              </Accordion.Header>
              <Accordion.Body>
                <div className="d-flex align-items-start">
                  <FaHome className="text-warning me-3 mt-1" />
                  <div>
                    <strong>Tu espacio, tus reglas:</strong>
                    <ul className="mt-2 mb-0">
                      <li>✅ Sin algoritmos que oculten tu contenido</li>
                      <li>✅ Sin restricciones de publicación arbitrarias</li>
                      <li>✅ Cero perfiles falsos en tu comunidad</li>
                      <li>✅ Control total sobre tu audiencia</li>
                      <li>✅ Registro único para clientes de por vida</li>
                    </ul>
                  </div>
                </div>
              </Accordion.Body>
            </Accordion.Item>

            {/* Pregunta 4 */}
            <Accordion.Item eventKey="3">
              <Accordion.Header>
                <strong>¿Cómo funciona el acuerdo con el desarrollador?</strong>
              </Accordion.Header>
              <Accordion.Body>
                <div className="d-flex align-items-start">
                  <FaHandshake className="text-info me-3 mt-1" />
                  <div>
                    <strong>Filosofía transparente:</strong>
                    <ol className="mt-2 mb-0">
                      <li>Pruebas la aplicación <strong>gratuitamente</strong> hasta quedar satisfecho</li>
                      <li>Evaluamos juntos tus necesidades específicas</li>
                      <li>Personalizamos diseño y funciones a tu medida</li>
                      <li>Negociamos un precio justo basado en el valor real</li>
                    </ol>
                  </div>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>

      {/* Llamada a la Acción */}
      <Row className="mt-5">
        <Col className="text-center">
          <Card className="border-0 bg-primary text-white">
            <Card.Body className="p-5">
              <h3 className="fw-bold mb-3">
                ¿Listo para Tomar el Control de tu Presencia Digital?
              </h3>
              <p className="fs-5 mb-4">
                Comienza tu experiencia personalizada y descubre cómo podemos construir 
                juntos el hogar digital que tu negocio merece.
              </p>
              <Button variant="light" size="lg" className="fw-bold">
                Comenzar Ahora
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Estilos adicionales */}
      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
        }
        .display-4 {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </Container>
  );
};

export default appinfo3;