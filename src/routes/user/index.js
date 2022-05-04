const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');
const { uploadImage } = require('../../middlewares/uploadImage');
const uploadPath = require('../../constants/uploadPath');

router.get('/info', checkUser, require('./userInfoGET'));
router.get('/image', checkUser, require('./userImageGET'));
router.get('/theme', checkUser, require('./userThemeGET'));

router.delete('/image', checkUser, require('./userImageDELETE'));

router.put('/theme', checkUser, require('./userThemePUT'));
router.put('/image', checkUser, uploadImage(uploadPath.USERIMAGE), require('./userImagePUT'));
router.put('/nickname', checkUser, require('./userNicknamePUT'));

module.exports = router;
