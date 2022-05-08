const express = require('express');
const router = express.Router();

router.post('/', require('./signupPOST'));
router.post('/nickname', require('./signupNicknamePOST'));
router.post('/sendmail', require('./signupSendmailPOST'));

module.exports = router;
