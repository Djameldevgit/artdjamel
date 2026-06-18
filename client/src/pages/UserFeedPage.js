// pages/UserFeedPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { Container, Spinner, Row, Col, Button } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ArrowLeft, Grid, Layout } from 'react-bootstrap-icons';
import VideoCard from '../components/VideoCard';
import { getUserVideos } from '../redux/actions/videoAction';
import { getUserProfile } from '../redux/actions/userAction';

const UserFeedPage = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  
  const { auth } = useSelector(state => state);
  
  useEffect(() => {
    loadUserInfo();
    loadVideos(1);
  }, [userId]);
  
  const loadUserInfo = async () => {
    const res = await dispatch(getUserProfile(userId));
    if (res?.success) {
      setUserInfo(res.user);
    }
  };
  
  const loadVideos = async (pageNum) => {
    setLoading(true);
    const res = await dispatch(getUserVideos(userId, pageNum, 12));
    if (res?.success) {
      if (pageNum === 1) {
        setVideos(res.videos);
      } else {
        setVideos(prev => [...prev, ...res.videos]);
      }
      setHasMore(res.hasMore);
      setPage(pageNum);
    }
    setLoading(false);
  };
  
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadVideos(page + 1);
    }
  }, [loading, hasMore, page]);
  
  const handleBack = () => {
    const returnPath = sessionStorage.getItem('returnToFeed') || '/';
    sessionStorage.removeItem('returnToFeed');
    history.push(returnPath);
  };
  
  if (!userInfo && loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }
  
  return (
    <div className="user-feed-page bg-light min-vh-100">
      {/* Header del usuario */}
      <div className="bg-white shadow-sm sticky-top">
        <Container className="py-3">
          <div className="d-flex align-items-center gap-3">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={handleBack}
              className="rounded-circle p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            
            <img 
              src={userInfo?.avatar || '/default-avatar.png'} 
              alt={userInfo?.username}
              className="rounded-circle"
              style={{ width: 50, height: 50, objectFit: 'cover' }}
            />
            
            <div>
              <h5 className="mb-0">@{userInfo?.username}</h5>
              <small className="text-muted">
                {userInfo?.bio || 'Aucune bio'}
              </small>
            </div>
            
            <div className="ms-auto text-end">
              <div className="fw-bold">{videos.length}</div>
              <small className="text-muted">vidéos</small>
            </div>
          </div>
        </Container>
      </div>
      
      {/* Grid de videos del usuario */}
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">📹 Vidéos de @{userInfo?.username}</h5>
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => history.push('/')}
          >
            Explorer plus
          </Button>
        </div>
        
        <InfiniteScroll
          dataLength={videos.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" size="sm" />
            </div>
          }
          endMessage={
            <div className="text-center py-4 text-muted">
              {videos.length === 0 ? 'Aucune vidéo' : 'Toutes les vidéos chargées'}
            </div>
          }
        >
          <Row className="g-3 g-md-4">
            {videos.map(video => (
              <Col key={video._id} xs={12} sm={6} md={4} lg={3}>
                <VideoCard video={video} />
              </Col>
            ))}
          </Row>
        </InfiniteScroll>
      </Container>
    </div>
  );
};

export default UserFeedPage;