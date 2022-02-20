const express = require('express');
const router = express.Router();

router.get('/shop/all', require('./allShopGET'));

module.exports = router;