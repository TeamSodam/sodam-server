const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

// TODO: auth API 완성되면 checkUser 넣으면 됨
router.get('/recent',require('./reviewRecentGET'));
router.post('/:reviewId/like', require('./reviewLikePOST'));
router.post('/:reviewId/scrap', require('./reviewScrapPOST'));
router.get('/:shopId', require('./reviewShopIdSortPageGET'));

module.exports = router;

