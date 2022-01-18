const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

// TODO: auth API 완성되면 checkUser 넣으면 됨
router.get('/review/scrap',checkUser, require('./myScrapGET'))
router.get('/review/write', checkUser, require('./myReviewGET'));


module.exports = router;

