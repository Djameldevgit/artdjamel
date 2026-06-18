const CategorySection = ({ category, videos, onViewMore }) => {
  if (!videos || videos.length === 0) return null;
  
  return (
    <section className="category-section mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3 px-3">
        <h3 className="mb-0">{category.name}</h3>
        <button 
          className="btn btn-outline-primary rounded-pill px-4"
          onClick={() => onViewMore(category.slug, category.name)}
        >
          Ver más <i className="fas fa-arrow-right ms-2" />
        </button>
      </div>
      
      <Row xs={1} sm={2} md={3} lg={6} className="g-3 px-2">
        {videos.slice(0, 6).map(video => (
          <Col key={video._id}>
            <VideoCard video={video} showActions={false} />
          </Col>
        ))}
      </Row>
    </section>
  );
};