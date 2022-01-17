// const { JSON } = require('sequelize');
const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { userDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const JSON = require('JSON');
module.exports = async (req, res) => {
  //   const file = req.file; //upload.single인 경우
  const files = req.files;

  // 이미지 잘 들어왔나 확인
  console.log('이미지 잘 들어왔나 확인');
  console.log(files);

  // 파일이 저장된 경로만 추출
  fileUrl = files.map((file) => file.location);
  console.log('파일이 저장된 경로');
  console.log(fileUrl);

  // 나머지 데이터 불러오기
  // req.body에 있음
  const { shopId, item, content } = req.body;

  // 추가사항: req.body의 JSON 객체 배열 파싱
  const parsedItem = JSON.parse(item);
  console.log('파싱 전 객체');
  console.log(item);

  console.log('파싱된 객체');
  console.log(parsedItem);

  const result = { shopId, parsedItem, content, fileUrl };

  return res.status(statusCode.OK).send(util.success(statusCode.OK, '이미지 업로드 성공', result));
};
