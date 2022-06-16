const express = require('express');
const router = express.Router();
const { checkAdminUser } = require('../../middlewares/adminAuth');

router.post('/login', require('./adminLoginPOST'));
router.get('/shop/all', checkAdminUser, require('./allShopGET'));
router.get('/shop/data', checkAdminUser, require('./shopDataGET'));
router.get('/review/all', checkAdminUser, require('./allReviewGET'));

module.exports = router;
