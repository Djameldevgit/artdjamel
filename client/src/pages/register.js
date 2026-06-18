import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory, Link } from 'react-router-dom'
import { register } from '../redux/actions/authAction'
import { useTranslation } from 'react-i18next'
import valid from '../utils/valid'
import { Container, Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap'

const Register = () => {

    const { auth, alert, languageReducer } = useSelector(state => state)
    const dispatch = useDispatch()
    const history = useHistory()
    const { t, i18n } = useTranslation('auth');
    const lang = languageReducer.language || 'es';
    if (i18n.language !== lang) i18n.changeLanguage(lang);

    const initialState = {
        username: '', email: '', password: '', cf_password: ''
    }
    const [userData, setUserData] = useState(initialState)
    const { username, email, password, cf_password } = userData

    const [typePass, setTypePass] = useState(false)
    const [typeCfPass, setTypeCfPass] = useState(false)

    useEffect(() => {
        if (auth.token) history.push("/")
    }, [auth.token, history])

    const handleChangeInput = e => {
        const { name, value } = e.target
        setUserData({ ...userData, [name]: value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const check = valid(userData)
        if (check.errLength > 0) {
            const translated = {}
            for (const key in check.errMsg) {
                translated[key] = t(check.errMsg[key], { lng: lang })
            }

            return dispatch({ type: 'ALERT', payload: translated })
        }

        dispatch(register(userData))
    }

    const isRTL = lang === "ar"

    return (
        <div 
            className={isRTL ? "rtl" : ""}
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                padding: '1rem 0.5rem'
            }}
        >
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} sm={10} md={8} lg={6} xl={5}>
                        <Card 
                            className="shadow-lg border-0"
                            style={{
                                borderRadius: '20px',
                                overflow: 'hidden',
                                background: 'rgba(255, 255, 255, 0.98)'
                            }}
                        >
                            {/* Header elegante */}
                            <div 
                                className="text-center py-2"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    position: 'relative'
                                }}
                            >
                                <div 
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        background: 'rgba(255,255,255,0.25)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem',
                                        backdropFilter: 'blur(10px)',
                                        border: '3px solid rgba(255,255,255,0.3)'
                                    }}
                                >
                                    <svg 
                                        width="40" 
                                        height="40" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="white" 
                                        strokeWidth="2"
                                    >
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                                <h3 
                                    className="text-uppercase fw-bold mb-0" 
                                    style={{ 
                                        color: 'white',
                                        letterSpacing: '1px',
                                        fontSize: '1.75rem'
                                    }}
                                >
                                    {t('nameregister', { lng: lang })}
                                </h3>
                            </div>

                            <Card.Body className="p-3 p-md-4">
                                <Form onSubmit={handleSubmit}>
                                    
                                    {/* Username */}
                                    <Form.Group className="mb-4">
                                        <Form.Label 
                                            className="fw-semibold"
                                            style={{ color: '#4a5568', fontSize: '0.95rem' }}
                                        >
                                            {t('userName', { lng: lang })}
                                        </Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text 
                                                style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    border: 'none',
                                                    borderRadius: '12px 0 0 12px'
                                                }}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="12" cy="7" r="4"></circle>
                                                </svg>
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                id="username"
                                                name="username"
                                                onChange={handleChangeInput}
                                                value={username.toLowerCase().replace(/ /g, '')}
                                                isInvalid={!!alert.username}
                                                placeholder=""
                                                style={{
                                                    borderLeft: 'none',
                                                    borderRadius: '0 12px 12px 0',
                                                    padding: '0.75rem 1rem',
                                                    fontSize: '1rem',
                                                    border: alert.username ? '2px solid #fc8181' : '2px solid #e2e8f0',
                                                    background: alert.username ? '#fff5f5' : 'white'
                                                }}
                                            />
                                        </InputGroup>
                                        {alert.username && (
                                            <Form.Text className="text-danger d-block mt-2 fw-medium">
                                                {t(alert.username, { lng: lang })}
                                            </Form.Text>
                                        )}
                                    </Form.Group>

                                    {/* Email */}
                                    <Form.Group className="mb-4">
                                        <Form.Label 
                                            className="fw-semibold"
                                            style={{ color: '#4a5568', fontSize: '0.95rem' }}
                                        >
                                            {t('emailAddress', { lng: lang })}
                                        </Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text 
                                                style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    border: 'none',
                                                    borderRadius: '12px 0 0 12px'
                                                }}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                    <polyline points="22,6 12,13 2,6"></polyline>
                                                </svg>
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="email"
                                                id="exampleInputEmail1"
                                                name="email"
                                                onChange={handleChangeInput}
                                                value={email}
                                                isInvalid={!!alert.email}
                                                placeholder=""
                                                style={{
                                                    borderLeft: 'none',
                                                    borderRadius: '0 12px 12px 0',
                                                    padding: '0.75rem 1rem',
                                                    fontSize: '1rem',
                                                    border: alert.email ? '2px solid #fc8181' : '2px solid #e2e8f0',
                                                    background: alert.email ? '#fff5f5' : 'white'
                                                }}
                                            />
                                        </InputGroup>
                                        {alert.email && (
                                            <Form.Text className="text-danger d-block mt-2 fw-medium">
                                                {t(alert.email, { lng: lang })}
                                            </Form.Text>
                                        )}
                                    </Form.Group>

                                    {/* Password */}
                                    <Form.Group className="mb-4">
                                        <Form.Label 
                                            className="fw-semibold"
                                            style={{ color: '#4a5568', fontSize: '0.95rem' }}
                                        >
                                            {t('password', { lng: lang })}
                                        </Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text 
                                                style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    border: 'none',
                                                    borderRadius: '12px 0 0 0'
                                                }}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                                </svg>
                                            </InputGroup.Text>
                                            <Form.Control
                                                type={typePass ? "text" : "password"}
                                                id="exampleInputPassword1"
                                                name="password"
                                                onChange={handleChangeInput}
                                                value={password}
                                                isInvalid={!!alert.password}
                                                placeholder=""
                                                style={{
                                                    borderLeft: 'none',
                                                    borderRight: 'none',
                                                    borderRadius: '0',
                                                    padding: '0.75rem 1rem',
                                                    fontSize: '1rem',
                                                    border: alert.password ? '2px solid #fc8181' : '2px solid #e2e8f0',
                                                    borderLeft: 'none !important',
                                                    borderRight: 'none !important',
                                                    background: alert.password ? '#fff5f5' : 'white'
                                                }}
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => setTypePass(!typePass)}
                                                style={{
                                                    borderRadius: '0 12px 12px 0',
                                                    border: alert.password ? '2px solid #fc8181' : '2px solid #e2e8f0',
                                                    borderLeft: 'none',
                                                    background: 'white',
                                                    color: '#667eea'
                                                }}
                                            >
                                                {typePass ? (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                                    </svg>
                                                ) : (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                        <circle cx="12" cy="12" r="3"></circle>
                                                    </svg>
                                                )}
                                            </Button>
                                        </InputGroup>
                                        {alert.password && (
                                            <Form.Text className="text-danger d-block mt-2 fw-medium">
                                                {t(alert.password, { lng: lang })}
                                            </Form.Text>
                                        )}
                                    </Form.Group>

                                    {/* Confirm Password */}
                                    <Form.Group className="mb-4">
                                        <Form.Label 
                                            className="fw-semibold"
                                            style={{ color: '#4a5568', fontSize: '0.95rem' }}
                                        >
                                            {t('confirmPassword', { lng: lang })}
                                        </Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text 
                                                style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    border: 'none',
                                                    borderRadius: '12px 0 0 0'
                                                }}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                                </svg>
                                            </InputGroup.Text>
                                            <Form.Control
                                                type={typeCfPass ? "text" : "password"}
                                                id="cf_password"
                                                name="cf_password"
                                                onChange={handleChangeInput}
                                                value={cf_password}
                                                isInvalid={!!alert.cf_password}
                                                placeholder=""
                                                style={{
                                                    borderLeft: 'none',
                                                    borderRight: 'none',
                                                    borderRadius: '0',
                                                    padding: '0.75rem 1rem',
                                                    fontSize: '1rem',
                                                    border: alert.cf_password ? '2px solid #fc8181' : '2px solid #e2e8f0',
                                                    borderLeft: 'none !important',
                                                    borderRight: 'none !important',
                                                    background: alert.cf_password ? '#fff5f5' : 'white'
                                                }}
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => setTypeCfPass(!typeCfPass)}
                                                style={{
                                                    borderRadius: '0 12px 12px 0',
                                                    border: alert.cf_password ? '2px solid #fc8181' : '2px solid #e2e8f0',
                                                    borderLeft: 'none',
                                                    background: 'white',
                                                    color: '#667eea'
                                                }}
                                            >
                                                {typeCfPass ? (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                                    </svg>
                                                ) : (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                        <circle cx="12" cy="12" r="3"></circle>
                                                    </svg>
                                                )}
                                            </Button>
                                        </InputGroup>
                                        {alert.cf_password && (
                                            <Form.Text className="text-danger d-block mt-2 fw-medium">
                                                {t(alert.cf_password, { lng: lang })}
                                            </Form.Text>
                                        )}
                                    </Form.Group>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-100 fw-bold text-uppercase mt-3"
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '0.875rem',
                                            fontSize: '1rem',
                                            letterSpacing: '1px',
                                            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)'
                                            e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)'
                                            e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)'
                                        }}
                                    >
                                        {t('register', { lng: lang })}
                                    </Button>

                                    {/* Login Link */}
                                    <div className="text-center mt-3">
                                        <p className="mb-0" style={{ color: '#718096' }}>
                                            {t('alreadyHaveAccount', { lng: lang })}{' '}
                                            <Link 
                                                to="/login" 
                                                style={{
                                                    color: 'crimson',
                                                    textDecoration: 'none',
                                                    fontWeight: '600',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                            >
                                                {t('loginNow', { lng: lang })}
                                            </Link>
                                        </p>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default Register