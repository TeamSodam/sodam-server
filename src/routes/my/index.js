const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

// TODO: auth API 완성되면 checkUser 넣으면 됨
router.get('/review/scrap/:userId',require('./myScrapGET'))
router.get('/review/write/:userId', require('./myReviewGET'));


module.exports = router;

