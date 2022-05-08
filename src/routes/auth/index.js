const express = require('express');
const router = express.Router();

router.use('/signup', require('./signup'));

router.post('/login', require('./authLoginPOST'));

module.exports = router;
