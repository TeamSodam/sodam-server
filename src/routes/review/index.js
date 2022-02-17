const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');
const { uploadImage } = require('../../middlewares/uploadImage');

// TODO: auth API 완성되면 checkUser 넣으면 됨
router.post('/', checkUser, uploadImage, require('./reviewPOST'));
router.get('/recent', require('./reviewRecentGET'));
router.post('/:reviewId/like', checkUser, require('./reviewLikePOST'));
router.post('/:reviewId/scrap', checkUser, require('./reviewScrapPOST'));
router.get('/:shopId', require('./reviewShopIdSortOffsetLimitGET'));

module.exports = router;
