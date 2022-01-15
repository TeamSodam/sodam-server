const express = require('express');
const router = express.Router();

// TODO: auth API 완성되면 checkUser 넣으면 됨
router.get('/', require('./shopGET'));

module.exports = router;
