const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB, reviewDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');

module.exports = async (req, res) => {
  // ~~ params 확인
  const { shopId } = req.params;

  if (!shopId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  // ~~ query 확인
  let { sort, offset, limit } = req.query;
  if (!offset || !limit) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  const pageOffset = offset - 1;

  let client;

  try {
    client = await db.connect(req);

    let result;
    // sort에 따라 db에 요청 보내기
    if (sort === 'save') {
      result = await reviewDB.getReviewByShopIdOrderByScrap(client, shopId, limit, pageOffset);
    } else if (sort === 'recent') {
      result = await reviewDB.getReviewByShopIdOrderByRecent(client, shopId, limit, pageOffset);
    } else {
      // sort === "like"
      result = await reviewDB.getReviewByShopIdOrderByLike(client, shopId, limit, pageOffset);
    }

    // 성공: 탐색은 잘 했는데 리뷰가 없는 경우
    if (result.length === 0) {
      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_REVIEW_OF_SHOP_SUCCESS, result));
    }

    // 성공: 리뷰 있음
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_REVIEW_OF_SHOP_SUCCESS, result));
  } catch (error) {
    console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
