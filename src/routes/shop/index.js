const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

// TODO: auth API 완성되면 checkUser 넣으면 됨
router.get('/bookmark', require('./bookmarkGET'));
router.get('/:shopId', require('./shopShopIdGET'));
router.get('/', require('./shopGET'));
router.get('/:shopId/location', require('./shopShopIdLocationGET'));

module.exports = router;
