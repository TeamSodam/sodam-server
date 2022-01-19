const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { reviewDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const { duplicatedDataClean } = require('../../lib/convertRawDataToProccessedData');
const slackAPI = require('../../middlewares/slackAPI');

module.exports = async (req, res) => {
  if (!req.user) {
    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NEED_LOGIN));
  }
  let client;
  const userId = req.user[0].id;
  try {
    client = await db.connect(req);
    let responseData = [];
    if (userId) {
      responseData = await reviewDB.getScrapedReviewByUserId(client, userId);
      responseData.map((item) => {
        if (!item.image) {
          item.image = null;
        }
      });
      responseData = duplicatedDataClean(responseData, 'shopId', 'category');
      responseData = duplicatedDataClean(responseData, 'reviewId', 'writerThumbnail');
      responseData = duplicatedDataClean(responseData, 'reviewId', 'image');

      if (responseData.length !== 0) res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_SCRAP_OF_MINE, responseData));
      else {
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.NO_REVIEW, responseData));
      }
    }
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
