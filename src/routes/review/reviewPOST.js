const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { reviewDB, userDB, shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');

module.exports = async (req, res) => {
  const { shopId, shopName, image, item, content, tag: tagList } = req.body;

  // req.body 중 빠진 값 확인
  if (!shopId || !shopName || !image || !item || !content) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  // 로그인 안 했으면 fail
  if (!req.user) {
    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NEED_LOGIN));
  }
  const userId = req.user.id;

  let client;

  try {
    client = await db.connect(req);

    // userId가 적절한지 확인, 아니면 fail
    const writer = await userDB.getReviewWriterByUserId(client, userId);

    if (writer.length === 0) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER));
    }

    // shopId가 적절한지 확인, 아니면 fail
    const shop = await shopDB.getShopByShopId(client, shopId);

    if (writer.length === 0) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_SHOP));
    }

    const review = await reviewDB.createReview(client, shopId, userId, content);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.RENT_HISTORY_SUCCESS, user));
  } catch (error) {
    console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
