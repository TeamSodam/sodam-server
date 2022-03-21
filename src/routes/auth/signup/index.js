const express = require('express');
const router = express.Router();

router.post('/', require('./signupPOST'));
router.post('/verify', require('./signupVerifyPOST'));

module.exports = router;
