const express = require('express');
const router = express.Router();

router.get('/shop/all', require('./allShopGET'));
router.get('/review/all', require('./allReviewGET'));

module.exports = router;