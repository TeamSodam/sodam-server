const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

router.get('/info', checkUser, require('./userInfoGET'));
router.get('/image', checkUser, require('./userImageGET'));
router.get('/theme', checkUser, require('./userThemeGET'));

router.delete('/image', checkUser, require('./userImageDELETE'));

router.put('/theme', checkUser, require('./userThemePUT'));

module.exports = router;
