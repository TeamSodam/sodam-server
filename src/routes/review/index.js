const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');
const { uploadImage } = require('../../middlewares/uploadImage');

// TODO: auth API 완성되면 checkUser 넣으면 됨
router.post('/', checkUser, uploadImage, require('./reviewPOST'));
router.post('/:reviewId/like', require('./reviewLikePOST'));
router.post('/:reviewId/scrap', require('./reviewScrapPOST'));
router.get('/:shopId', require('./reviewShopIdSortPageGET'));

module.exports = router;
