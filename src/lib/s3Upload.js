// const express = require('express');
const multer = require('multer');
const path = require('path');
// const fs = require('fs');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const dayjs = require('dayjs');
const dotenv = require('dotenv');
dotenv.config();

//bucket 정보
const bucketname = 'sodam-bucket'; //AWS bucket name을 작성
const maxSize = 5 * 1024 * 1024; //최대 5MB로 제한
const bucketRegion = 'ap-northeast-2';
const s3 = new AWS.S3({ params: { Bucket: bucketname } });

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: bucketRegion,
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketname,
    key(req, file, cb) {
      const imgname = `original/${dayjs().tz('Asia/Seoul').format('YYYY-MM-DD-HH-mm-ss-SSS-')}${path.basename(file.originalname)}`;
      cb(null, imgname);
    },
  }),
  limits: { fileSize: maxSize },
});

module.exports = { upload };
