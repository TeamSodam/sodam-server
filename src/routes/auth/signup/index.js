const express = require('express');
const router = express.Router();

router.post('/', require('./signupPOST'));
router.post('/nickname', require('./signupNicknamePOST'));

module.exports = router;
