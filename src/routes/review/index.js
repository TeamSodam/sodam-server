const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');
const { uploadImage } = require('../../middlewares/uploadImage');
const uploadPath = require('../../constants/uploadPath');

router.post('/', checkUser, uploadImage(uploadPath.REVIEW), require('./reviewPOST'));
router.get('/recent', require('./reviewRecentGET'));
router.post('/:reviewId/like', checkUser, require('./reviewLikePOST'));
router.post('/:reviewId/scrap', checkUser, require('./reviewScrapPOST'));
router.get('/:shopId', require('./reviewShopIdSortOffsetLimitGET'));

module.exports = router;
