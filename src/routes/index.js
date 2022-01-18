const express = require('express');
const router = express.Router();

router.use('/user', require('./user'));
router.use('/shop', require('./shop'));
router.use('/review', require('./review'));
router.use('/my',require('./my'));
router.use('/auth', require('./auth'));

module.exports = router;
