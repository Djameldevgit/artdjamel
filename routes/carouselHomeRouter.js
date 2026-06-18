 
const router = require('express').Router()
 
 
const carouselHomeCtrl = require('../controllers/carouselHomeCtrl');
const auth = require('../middleware/auth');

// El resto del código igual...
router.get('/carousel/home', carouselHomeCtrl.getHomeCarousel);

// Rutas protegidas (solo admin)
router.get('/carousel/admin/all', 
  auth, 
  carouselHomeCtrl.getAllCarouselImages
);

router.post('/carousel', 
auth,  
  carouselHomeCtrl.createCarouselImage
);

router.patch('/carousel/:id', 
auth, 
  carouselHomeCtrl.updateCarouselImage
);

router.delete('/carousel/:id', 
auth, 
  carouselHomeCtrl.deleteCarouselImage
);

 
module.exports = router;
