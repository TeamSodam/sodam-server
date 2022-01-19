const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB, reviewDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const slackAPI = require('../../middlewares/slackAPI');

module.exports = async (req, res) => {
  // ~~ params 확인
  const { shopId } = req.params;

  if (!shopId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  // ~~ query 확인
  let { sort, offset, limit } = req.query;
  if (!offset || !limit) {
    // return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    offset = 1;
    limit = 9;
  }

  // offset과 limit 범위 확인
  if (Number(offset) <= 0 || Number(limit) <= 0) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
  }

  // offset: 페이지
  const pageOffset = Number(offset - 1) * limit;

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

    // 이미지 배열로 만들기
    result.map((item) => {
      item.image = [item.image];
    });

    // 성공: 리뷰 있음
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_REVIEW_OF_SHOP_SUCCESS, result));
  } catch (error) {
    console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    // 슬랙으로 보낼 메시지
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user[0].id}` : `req.user 없음`} \n[CONTENT] ${error} \n${JSON.stringify(error)} `;

    // 슬랙 Webhook을 사용해, 에러가 발생했을 때 슬랙으로 해당 에러 내용을 담은 메시지를 보내는 코드
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
