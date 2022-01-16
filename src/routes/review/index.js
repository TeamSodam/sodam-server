const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

// TODO: auth API 완성되면 checkUser 넣으면 됨
router.post('/:reviewId/like', require('./reviewLikePOST'));

module.exports = router;
