import React, { useMemo, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { ArrowRight, CameraVideo, PlusCircle } from 'react-bootstrap-icons';
import VideoCardVertical from './VideoCardVertical';

const CategorySection = ({ category, videos = [], onViewMore }) => {
  const history = useHistory();

  // ===============================
  // MEMO VIDEOS (evita recalculo)
  // ===============================
  const videoList = useMemo(() => videos.slice(0, 6), [videos]);
  const hasVideos = videoList.length > 0;

  // ===============================
  // CALLBACK OPTIMIZADO
  // ===============================
  const handleCreate = useCallback(() => {
    history.push('/create-video-page');
  }, [history]);

  const handleViewMoreClick = useCallback(() => {
    onViewMore(category.slug, category.name);
  }, [onViewMore, category.slug, category.name]);

  return (
    <section className="category-section py-4">
      <Container>

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">

            {category.icon && (
              <img
                src={category.icon}
                alt={category.name}
                width={32}
                height={32}
                loading="lazy"
              />
            )}

            <div>
              <h3 className="h4 fw-bold mb-0">
                {category.name}
              </h3>

              {!hasVideos && (
                <small className="text-muted">
                  Aucune vidéo pour le moment
                </small>
              )}
            </div>
          </div>

          <Button
            variant="outline-primary"
            className="rounded-pill px-3"
            onClick={handleViewMoreClick}
          >
            Voir tout <ArrowRight size={16} />
          </Button>
        </div>

        {/* VIDEOS */}
        {hasVideos ? (
          <Row className="g-3">
            {videoList.map(video => (
              <Col key={video._id} xs={6} md={4} lg={2}>
                <VideoCardVertical video={video} />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-5 bg-light rounded-4">
            <CameraVideo size={32} className="text-muted mb-3" />

            <h5>Aucune vidéo</h5>

            <p className="text-muted small">
              Soyez le premier à publier
            </p>

            <Button
              variant="primary"
              className="rounded-pill"
              onClick={handleCreate}
            >
              <PlusCircle size={16} /> Publier
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
};

export default React.memo(CategorySection);