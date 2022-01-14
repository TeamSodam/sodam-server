const express = require('express');
const router = express.Router();

router.get('/', require('./shopGET'));

module.exports = router;
