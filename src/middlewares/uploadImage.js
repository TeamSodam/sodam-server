//  사용방법
//  - 라우터 로직에 들어가기 전에 사용
//  - 폼 데이터에서 이미지 키 값으로 'image'를 사용해야 함
//  - req.imageUrls에 결과 값 들어있음

const multer = require('multer');
const dayjs = require('dayjs');
const path = require('path');

const util = require('../lib/util');
const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');

const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const dotenv = require('dotenv');
dotenv.config();

//bucket 정보
const bucketname = process.env.S3_BUCKET_NAME; //AWS bucket name을 작성
const maxSize = 5 * 1024 * 1024; //최대 5MB로 제한
const bucketRegion = 'ap-northeast-2';

// S3와 연동
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: bucketRegion,
});

// 이 함수는 boolean 값과 함께 `cb`를 호출함으로써 해당 파일을 업로드 할지 여부를 나타낼 수 있음
const fileFilter = (req, file, cb) => {
  let ext = path.extname(file.originalname).toLowerCase();

  // 이미지 확장자가 아니라면
  if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
    // 이 파일을 거부
    cb(null, false);
    // 이미지가 아닌 경우에 대한 에러 전달
    cb(new Error('IS_NOT_IMAGE'));
    return; // 리턴 없으면 다음 미들웨어로 넘어감
  }
  // 이미지가 맞다면 이 파일을 허용
  cb(null, true);
};

// path: 파일이 저장되는 경로(폴더)
const uploadImage = (folder) => {
  // 경로 설정
  let uploadPath = 'original';
  if (folder) {
    uploadPath = folder;
  }

  return (req, res, next) => {
    // 업로드 함수
    const upload = multer({
      storage: multerS3({
        s3: new AWS.S3(),
        bucket: bucketname,
        key: (req, file, cb) => {
          // 파일 이름
          const imgname = `${uploadPath}/${dayjs().format('YYYYMMDD-HHmmss-SSS-')}${path.basename(file.originalname)}`;
          cb(null, imgname);
        },
      }),
      fileFilter: fileFilter,
      limits: { maxSize },
    }).array('image'); // 파일 여러개 입력 받음

    upload(req, res, (err) => {
      if (err) {
        if (err.message === 'IS_NOT_IMAGE') {
          // 이미지가 아님
          return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ONLY_IMAGE_AVAILABLE));
        }
      }

      // form-data의 key가 하나도 없음
      if (!req.files) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_IMAGE));
      }
      // 정상적으로 완료됨
      console.log('업로드 성공');

      // 이미지가 저장된 Url 배열
      const imageUrls = req.files.map((file) => file.location);
      // req에 넣어서 다음 미들웨어에서 사용할 수 있게
      req.imageUrls = imageUrls;

      next();
    });
  };
};

module.exports = { uploadImage };
