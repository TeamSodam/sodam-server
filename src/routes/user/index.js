const express = require('express');
const router = express.Router();

router.get('/:id', require('./userGET'));

module.exports = router;
