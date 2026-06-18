import React, { memo, useMemo } from 'react';
import { Container, Row, Col, Image, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const HeaderAgencia = memo(({
    imageSrc = "/images/agencia.jpg",
    componentHeight = '160px',
    imageColumns = 2,
    cardColumns = 10,
    imageBorderRadius = '10px',
    cardBackground = 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    cardBorderColor = '#007bff',
    titleFontFamily = "'Playfair Display', serif"
}) => {
    const { t, i18n } = useTranslation('headeragencia');
    const currentLang = i18n.language;
    const isRTL = currentLang === 'ar';

    // Memoizar estilos para evitar recrearlos en cada render
    const imageContainerStyle = useMemo(() => ({
        height: componentHeight,
        borderRadius: imageBorderRadius,
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }), [componentHeight, imageBorderRadius]);

    const imageStyle = useMemo(() => ({
        width: '70%',
    height: '80%',
        objectFit: 'cover',
        display: 'block'
    }), []);

    const cardStyle = useMemo(() => ({
        background: cardBackground,
        borderRadius: '15px',
        borderLeft: isRTL ? 'none' : `5px solid ${cardBorderColor}`,
        borderRight: isRTL ? `5px solid ${cardBorderColor}` : 'none',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        height: componentHeight,
        display: 'flex',
        flexDirection: 'column'
    }), [cardBackground, cardBorderColor, componentHeight, isRTL]);

    const titleStyle = useMemo(() => ({
        fontFamily: titleFontFamily,
        fontStyle: 'italic',
        fontWeight: '700',
        letterSpacing: '1.5px',
        textShadow: '2px 2px 3px rgba(0,0,0,0.15)',
        background: 'linear-gradient(45deg, #007bff, #0056b3)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '0.5rem'
    }), [titleFontFamily]);

    const iconCircleStyle = useMemo(() => ({
        width: '45px',
        height: '45px',
        flexShrink: 0
    }), []);

    const textStyle = useMemo(() => ({
        fontSize: '1rem',
        lineHeight: '1.5',
        marginBottom: '0'
    }), []);

    const cardBodyStyle = useMemo(() => ({
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        flex: 1
    }), []);

    return (
        <Container fluid className="py-1" dir={isRTL ? 'rtl' : 'ltr'}>
            <Row className="align-items-stretch g-0"> {/* Added g-0 to remove gutters */}
                {/* Columna de la Imagen */}
                <Col 
                    md={imageColumns} 
                    lg={imageColumns} 
                    className={`${isRTL ? 'ps-0' : 'pe-0'} d-none d-md-block`}
                >
                    <div style={imageContainerStyle}>
                        <Image
                            src={imageSrc}
                            alt="Voyages & Découvertes"
                            style={imageStyle}
                            loading="lazy"
                            className="w-100 h-100"
                        />
                    </div>
                </Col>

                {/* Columna del Card */}
                <Col 
                    xs={12} 
                    md={cardColumns} 
                    lg={cardColumns} 
                    className={isRTL ? 'pe-md-0' : 'ps-md-0'}
                >
                    <Card className="border-0 w-100 h-100" style={cardStyle}>
                        <Card.Body style={cardBodyStyle}>
                            <Row className="align-items-center w-100 g-0"> {/* Added g-0 */}
                                <Col xs={12} md={8} className="pe-md-3">
                                    <h1 className="h4 mb-2" style={titleStyle}>
                                        {t('zemzemVoyage')}
                                    </h1>
                                    <p className="text-dark" style={textStyle}>
                                        {t('agenceDescription')}
                                    </p>
                                </Col>
                                <Col xs={12} md={4}>
                                    <div className={`d-flex align-items-center ${isRTL ? 'justify-content-start' : 'justify-content-end'}`}>
                                        <div 
                                            className={`bg-primary rounded-circle d-flex align-items-center justify-content-center ${isRTL ? 'ms-3' : 'me-3'}`}
                                            style={iconCircleStyle}
                                        >
                                            <svg 
                                                width="20" 
                                                height="20" 
                                                fill="currentColor" 
                                                className="bi bi-telephone-fill text-white" 
                                                viewBox="0 0 16 16"
                                            >
                                                <path 
                                                    fillRule="evenodd" 
                                                    d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z" 
                                                />
                                            </svg>
                                        </div>
                                        <div className={isRTL ? 'text-start' : 'text-end'}>
                                            <div className="text-muted small">
                                                {isRTL ? 'اتصل بنا' : 'Contactez-nous'}
                                            </div>
                                            <span className="text-dark fw-bold fs-6">
                                                {t('telephone')}
                                            </span>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
});

HeaderAgencia.displayName = 'HeaderAgencia';

export default HeaderAgencia;