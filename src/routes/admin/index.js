const express = require('express');
const router = express.Router();
const { checkAdminUser } = require('../../middlewares/adminAuth');
const { uploadImage } = require('../../middlewares/uploadImage');
const uploadPath = require('../../constants/uploadPath');

router.post('/login', require('./adminLoginPOST'));
router.get('/shop/all', checkAdminUser, require('./allShopGET'));
router.get('/shop/data', checkAdminUser, require('./shopDataGET'));
router.get('/review/all', checkAdminUser, require('./allReviewGET'));
router.post('/shop/newshop', uploadImage(uploadPath.SHOP),require('./newShopDataPOST')); // 나중에 어드민체크 추가
module.exports = router;
