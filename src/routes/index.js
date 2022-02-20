const express = require('express');
const router = express.Router();

router.use('/user', require('./user'));
router.use('/shop', require('./shop'));
router.use('/review', require('./review'));
router.use('/auth', require('./auth'));
router.use('/my', require('./my'));
router.use('/admin', require('./admin'));

module.exports = router;
