// src/pages/Login.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { login } from '../redux/actions/authAction';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Envelope, Lock, Eye, EyeSlash, ArrowRight } from 'react-bootstrap-icons';
import Loginfacegoogle from '../auth/Loginfacegoogle';
 
const Login = () => {
    const initialState = { email: '', password: '' };
    const [userData, setUserData] = useState(initialState);
    const { email, password } = userData;
    const [typePass, setTypePass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { auth } = useSelector(state => state);
    const dispatch = useDispatch();
    const history = useHistory();

    // Prevenir propagación de eventos
    const stopPropagation = (e) => {
        e.stopPropagation();
    };

    useEffect(() => {
        if (auth.token) history.push("/");
    }, [auth.token, history]);

    const handleChangeInput = e => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
        if (error) setError(null);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!email || !password) {
            setError("Veuillez remplir tous les champs");
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            await dispatch(login(userData));
        } catch (err) {
            setError(err.response?.data?.msg || "Erreur de connexion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="login-page"
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                padding: '1rem'
            }}
            onClick={stopPropagation}
        >
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} sm={10} md={8} lg={6} xl={5}>
                        <Card 
                            className="border-0 shadow-lg"
                            style={{ borderRadius: '24px', overflow: 'hidden' }}
                            onClick={stopPropagation}
                        >
                            {/* Header */}
                            <div 
                                className="text-center py-4"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}
                            >
                                <div 
                                    style={{
                                        width: '70px',
                                        height: '70px',
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                        <polyline points="10 17 15 12 10 7"/>
                                        <line x1="15" y1="12" x2="3" y2="12"/>
                                    </svg>
                                </div>
                                <h3 className="text-white fw-bold mb-0">Connexion</h3>
                            </div>

                            <Card.Body className="p-4 p-md-5" onClick={stopPropagation}>
                                {error && (
                                    <Alert variant="danger" className="mb-4" onClose={() => setError(null)} dismissible>
                                        {error}
                                    </Alert>
                                )}

                                {/* Botones sociales */}
                                <div onClick={stopPropagation} onMouseDown={stopPropagation}>
                                    <Loginfacegoogle />
                                </div>

                                {/* Divisor */}
                                <div className="position-relative my-4">
                                    <hr className="text-muted" />
                                    <span 
                                        className="position-absolute top-50 start-50 translate-middle bg-white px-3"
                                        style={{ color: '#6c757d', fontSize: '0.85rem' }}
                                    >
                                        ou continuer avec
                                    </span>
                                </div>

                                {/* Formulario */}
                                <Form onSubmit={handleSubmit} onClick={stopPropagation}>
                                    {/* Email */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold text-secondary">Adresse email</Form.Label>
                                        <div className="position-relative">
                                            <span 
                                                className="position-absolute start-0 top-0 h-100 d-flex align-items-center px-3"
                                                style={{ color: '#667eea' }}
                                            >
                                                <Envelope size={18} />
                                            </span>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={email}
                                                onChange={handleChangeInput}
                                                onClick={stopPropagation}
                                                onFocus={stopPropagation}
                                                placeholder="exemple@email.com"
                                                className="py-2 ps-5"
                                                style={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}
                                                required
                                            />
                                        </div>
                                    </Form.Group>

                                    {/* Password */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold text-secondary">Mot de passe</Form.Label>
                                        <div className="position-relative">
                                            <span 
                                                className="position-absolute start-0 top-0 h-100 d-flex align-items-center px-3"
                                                style={{ color: '#667eea' }}
                                            >
                                                <Lock size={18} />
                                            </span>
                                            <Form.Control
                                                type={typePass ? "text" : "password"}
                                                name="password"
                                                value={password}
                                                onChange={handleChangeInput}
                                                onClick={stopPropagation}
                                                onFocus={stopPropagation}
                                                placeholder="••••••••"
                                                className="py-2 ps-5 pe-5"
                                                style={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}
                                                required
                                            />
                                            <span 
                                                className="position-absolute end-0 top-0 h-100 d-flex align-items-center px-3"
                                                style={{ cursor: 'pointer', color: '#667eea' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTypePass(!typePass);
                                                }}
                                            >
                                                {typePass ? <EyeSlash size={18} /> : <Eye size={18} />}
                                            </span>
                                        </div>
                                    </Form.Group>

                                    {/* Forgot password */}
                                    <div className="text-end mb-4">
                                        <Link 
                                            to="/forgot_password" 
                                            style={{ color: '#667eea', fontSize: '0.85rem', textDecoration: 'none' }}
                                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                            onClick={stopPropagation}
                                        >
                                            Mot de passe oublié ?
                                        </Link>
                                    </div>

                                    {/* Submit button */}
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={loading || !email || !password}
                                        className="w-100 py-2 fw-bold"
                                        style={{
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            fontSize: '1rem'
                                        }}
                                        onClick={stopPropagation}
                                    >
                                        {loading ? (
                                            <Spinner as="span" animation="border" size="sm" />
                                        ) : (
                                            <>
                                                Se connecter
                                                <ArrowRight size={16} className="ms-2" />
                                            </>
                                        )}
                                    </Button>

                                    {/* Register link */}
                                    <div className="text-center mt-4">
                                        <span className="text-muted">Pas encore de compte ? </span>
                                        <Link 
                                            to="/register" 
                                            style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}
                                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                            onClick={stopPropagation}
                                        >
                                            S'inscrire
                                        </Link>
                                    </div>
                                </Form>
                            </Card.Body>

                            <Card.Footer className="bg-white border-0 text-center pb-4">
                                <small className="text-muted">
                                    🔒 Connexion sécurisée
                                </small>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Login;