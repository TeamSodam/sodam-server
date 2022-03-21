const express = require('express');
const router = express.Router();

router.post('/', require('./signupPOST'));
router.post('/sendmail', require('./signupSendmailPOST'));

module.exports = router;
