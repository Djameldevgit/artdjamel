const pagination = (defaultLimit = 10, defaultPage = 1) => {
    return (req, res, next) => {
      const page = Math.max(parseInt(req.query.page) || defaultPage, 1);
      const limit = Math.min(parseInt(req.query.limit) || defaultLimit, 100);
      const skip = (page - 1) * limit;
  
      req.pagination = {
        page,
        limit,
        skip,
        sort: req.query.sort || '-createdAt'
      };
  
      // También procesar filtros dinámicos
      if (req.query.filters) {
        try {
          req.filters = JSON.parse(req.query.filters);
        } catch {
          req.filters = req.query.filters;
        }
      }
  
      if (req.query.attributes) {
        try {
          req.attributes = JSON.parse(req.query.attributes);
        } catch {
          req.attributes = req.query.attributes;
        }
      }
  
      next();
    };
  };
  
  module.exports = pagination;