const express = require('express');
const router = express.Router();

router.post('/signup', require('./authSignupPOST'));
router.post('/login', require('./authLoginPOST'));

module.exports = router;
