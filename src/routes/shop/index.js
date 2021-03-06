const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

// TODO: auth API 완성되면 checkUser 넣으면 됨
router.get('/bookmark', checkUser, require('./bookmarkGET'));
router.post('/bookmark', checkUser, require('./bookmarkPOST'));
router.get('/category', require('./shopCategoryGET'));
router.get('/recommend', require('./shopRecommendGET'));
router.get('/search', require('./shopSearchGET'));
router.get('/', checkUser, require('./shopGET'));
router.get('/:shopId/location', require('./shopShopIdLocationGET'));
router.get('/:shopId/review/:reviewId', checkUser, require('./shopReviewIdGET'));
router.get('/:shopId', checkUser, require('./shopShopIdGET'));

module.exports = router;
