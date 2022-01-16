const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

// TODO: auth API 완성되면 checkUser 넣으면 됨
router.get('/bookmark', require('./bookmarkGET'));
// TODO: auth API 완성되면 checkUser 넣으면 됨
router.post('/bookmark', require('./bookmarkPOST'));
router.get('/:shopId', require('./shopShopIdGET'));
router.get('/:shopId/review/:reviewId', require('./shopReviewIdGET'));
router.get('/', require('./shopGET'));

module.exports = router;
