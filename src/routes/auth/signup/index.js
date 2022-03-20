const express = require('express');
const router = express.Router();

router.post('/', require('./signupPOST'));

module.exports = router;
