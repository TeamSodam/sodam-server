const express = require('express');
const router = express.Router();
const { uploadImage } = require('../../middlewares/uploadImage');

router.post('/upload', uploadImage, require('./manageUploadPOST'));

module.exports = router;
