//  사용방법
//  - 라우터 로직에 들어가기 전에 사용
//  - 키: 폼 데이터에서 보내는 키 값
//  upload.single('키'): 파일 1개 업로드. req.file에 결과값 반환
//  upload.array('키', 개수제한): 파일 여러개 업로드. req.files에 결과값 반환
//  upload.fields([{name: '키'}, {name: '다른 키'}]): 파일도 여러개이고 키도 여러개인 경우
//  - 예시
// const { upload } = require('../../middlewares/uploadImage');
// router.post('/imagetest', upload.array('image'), require('./reviewImageTestPOST'));

const multer = require('multer');
const dayjs = require('dayjs');
const path = require('path');

const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const dotenv = require('dotenv');
dotenv.config();

//bucket 정보
const bucketname = 'sodam-bucket'; //AWS bucket name을 작성
const maxSize = 5 * 1024 * 1024; //최대 5MB로 제한
const bucketRegion = 'ap-northeast-2';

// S3와 연동
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: bucketRegion,
});

// TODO:
// 저장 폴더도 동적으로 받게 하고 싶음
// 저장 이후 저장된 경로 url도 한 배열 안에 담아주고 싶음
const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: bucketname,
    key: (req, file, cb) => {
      const imgname = `original/${dayjs().format('YYYYMMDD-HHmmss-SSS-')}${path.basename(file.originalname)}`;
      cb(null, imgname);
    },
  }),
  limits: { maxSize },
});

module.exports = { upload };
