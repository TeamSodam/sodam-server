const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

router.get('/info', checkUser, require('./userInfoGET'));
router.get('/image', checkUser, require('./userImageGET'));

module.exports = router;
