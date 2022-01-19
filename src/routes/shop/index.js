const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

// TODO: auth API 완성되면 checkUser 넣으면 됨
router.get('/bookmark', require('./bookmarkGET'));
router.post('/bookmark', checkUser, require('./bookmarkPOST'));
router.get('/category', require('./shopCategoryGET'));
router.get('/recommend', require('./shopRecommendGET'));
router.get('/search', require('./shopSearchGET'));
router.get('/', checkUser, require('./shopGET'));
router.get('/:shopId/location', require('./shopShopIdLocationGET'));
router.get('/:shopId', checkUser, require('./shopShopIdGET'));
router.get('/:shopId/review/:reviewId', require('./shopReviewIdGET'));

module.exports = router;
