const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { reviewDB, userDB, shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const JSON = require('JSON');

module.exports = async (req, res) => {
  // 업로드된 이미지의 url이 들어있음
  const imageUrls = req.imageUrls;
  console.log(imageUrls);
  // 이미지 없으면 fail
  if (imageUrls.length === 0) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CREATE_REVIEW_SUCCESS, imageUrls));
  } catch (error) {
    console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
