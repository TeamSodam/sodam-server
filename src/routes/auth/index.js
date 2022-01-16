const express = require('express');
const router = express.Router();

router.post('/login/email',require('./authLoginEmailPOST'));

module.exports = router;