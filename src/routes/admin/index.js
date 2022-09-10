const express = require('express');
const router = express.Router();
const { checkAdminUser } = require('../../middlewares/adminAuth');
const { uploadImage } = require('../../middlewares/uploadImage');
const uploadPath = require('../../constants/uploadPath');

router.post('/login', require('./adminLoginPOST'));
router.put('/review/:reviewId', checkAdminUser, require('./adminReviewDelete'));
router.get('/shop/all', checkAdminUser, require('./allShopGET'));
router.get('/shop/data', checkAdminUser, require('./shopDataGET'));
router.get('/review/all', checkAdminUser, require('./allReviewGET'));
router.put('/shop/existshop',checkAdminUser, uploadImage(uploadPath.SHOP),require('./existShopDataPUT'));
router.post('/shop/newshop', checkAdminUser, uploadImage(uploadPath.SHOP),require('./newShopDataPOST')); 
router.get('/shop/:shopId',checkAdminUser,require('./adminShopDELETE'));

module.exports = router;
