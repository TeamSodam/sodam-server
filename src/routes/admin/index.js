const express = require('express');
const router = express.Router();

router.get('/shop/all', require('./allShopGET'));
router.get('/shop/data', require('./shopDataGET'));
router.get('/review/all', require('./allReviewGET'));

module.exports = router;
