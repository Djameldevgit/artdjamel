// pages/ChannelsPage.jsx
import React, { useEffect,  useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Spinner, Button} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getApprovedChannels, clearApprovedChannels } from '../../redux/actions/channelAction';
 
import './ChannelsPage.css';  // ✅ Importamos los estilos personalizados
const ChannelsPage = () => {
    const dispatch = useDispatch();
    const { approvedChannels } = useSelector(state => state.channel);
    const { channels, loading, hasMore, page, error } = approvedChannels;
    const loaderRef = useRef(null);

    // Carga inicial
    useEffect(() => {
        if (channels.length === 0 && !loading) {
            dispatch(getApprovedChannels(1, 12));
        }
        return () => {
            dispatch(clearApprovedChannels());
        };
    }, [dispatch]);

    // Intersection Observer para infinite scroll
    useEffect(() => {
        if (!hasMore || loading) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    dispatch(getApprovedChannels(page + 1, 12));
                }
            },
            { threshold: 0.1 }
        );
        
        if (loaderRef.current) observer.observe(loaderRef.current);
        
        return () => {
            if (loaderRef.current) observer.unobserve(loaderRef.current);
        };
    }, [hasMore, loading, page, dispatch]);

    if (loading && channels.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error && channels.length === 0) {
        return (
            <div className="text-center py-5">
                <h5>⚠️ {error}</h5>
                <Button variant="primary" onClick={() => dispatch(getApprovedChannels(1, 12))}>
                    Reintentar
                </Button>
            </div>
        );
    }

    return (
        <>
           
            <Container className="py-4">
                <h2 className="mb-4 fw-bold">📺 Explorer les Chaînes</h2>
                {channels.length === 0 && !loading ? (
                    <div className="text-center py-5">
                        <p className="text-muted">Aucune chaîne approuvée pour le moment.</p>
                        <Link to="/channel/new" className="btn btn-primary rounded-pill">
                            + Créer ma chaîne
                        </Link>
                    </div>
                ) : (
                    <>
                        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                            {channels.map(channel => (
                                <Col key={channel._id}>
                                    <ChannelCard channel={channel} />
                                </Col>
                            ))}
                        </Row>
                        {hasMore && (
                            <div ref={loaderRef} className="text-center my-4">
                                <Spinner animation="border" size="sm" />
                                <span className="ms-2">Chargement...</span>
                            </div>
                        )}
                    </>
                )}
            </Container>
        </>
    );
};

const ChannelCard = ({ channel }) => {
    const avatarUrl = channel.avatar || '/default-channel.png';
    const coverUrl = channel.cover || null;
    const followers = channel.followersCount || 0;
    const formattedFollowers = followers >= 1000 ? (followers / 1000).toFixed(1) + 'k' : followers;
    
    return (
        <Link to={`/channel/${channel._id}`} className="channel-card-link">
            <div className="channel-card-custom">
                {/* Cover */}
                <div className="channel-card-cover">
                    {coverUrl ? (
                        <img src={coverUrl} alt={channel.name} />
                    ) : (
                        <div className="channel-card-cover-default">📺</div>
                    )}
                </div>
                
                {/* Avatar */}
                <div className="channel-card-avatar">
                    <img 
                        src={avatarUrl} 
                        alt={channel.name}
                        onError={(e) => (e.target.src = '/default-avatar.png')}
                    />
                </div>
                
                {/* Info */}
                <div className="channel-card-info">
                    <h3 className="channel-card-name">{channel.name}</h3>
                    <div className="channel-card-stats">
                        {channel.activity && <span>📌 {channel.activity}</span>}
                        <span>👥 {formattedFollowers} abonnés</span>
                    </div>
                    {channel.description && (
                        <p className="channel-card-description">{channel.description}</p>
                    )}
                    <div className="channel-card-btn">
                        Voir la chaîne →
                    </div>
                </div>
            </div>
        </Link>
    );
};
 

export default ChannelsPage;