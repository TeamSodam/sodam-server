const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { reviewDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const slackAPI = require('../../middlewares/slackAPI');

module.exports = async (req, res) => {
  const { reviewId } = req.params;
  const { isScraped } = req.body;

  if (!reviewId || isScraped === undefined) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  if (typeof isScraped === 'string') {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);
    const scrapCount = await reviewDB.getScrapCountByReviewId(client, reviewId);
    const responseData = {};

    if (req.user) {
      const userId = req.user[0].id;

      const isDeletedBefore = await reviewDB.getCurrentScrapStatusByReviewIdAndUserId(client, reviewId, userId); //true -> 스크랩 안돼있음, false-> 스크랩 눌려있음
      // 처음으로 scrap요청을 보낸 경우
      if (isDeletedBefore.length === 0) {
        const isDeleted = await reviewDB.postReviewScrapByReviewId(client, userId, reviewId, isScraped);
        // scrap이 true인 경우
        if (!isDeleted[0].isDeleted) {
          const updateScrapCount = await reviewDB.updateReviewScrapCount(client, reviewId, scrapCount[0].scrapCount + 1);
          responseData['isScraped'] = !isDeleted[0].isDeleted;
          responseData['scrapCount'] = updateScrapCount[0].scrapCount;
        }
        // scrap이 false인 경우
        else {
          const updateScrapCount = await reviewDB.updateReviewScrapCount(client, reviewId, scrapCount[0].scrapCount - 1);
          responseData['isScraped'] = !isDeleted[0].isDeleted;
          responseData['scrapCount'] = updateScrapCount[0].scrapCount;
        }
        // 이미 보냈던 scrap요청이 있는 경우
      } else {
        if (isScraped === !isDeletedBefore[0].isDeleted) {
          // 지금 받은 isScraped상태가 기존과 같은 경우
          responseData['isScraped'] = isScraped;
          responseData['scrapCount'] = scrapCount[0].scrapCount;
          return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.REVIEW_SCRAP_POST_SUCCESS, responseData));
        } else {
          const isDeleted = await reviewDB.postReviewScrapByReviewId(client, userId, reviewId, isScraped);
          // scrap이 true인 경우
          if (!isDeleted[0].isDeleted) {
            const updateScrapCount = await reviewDB.updateReviewScrapCount(client, reviewId, scrapCount[0].scrapCount + 1);
            responseData['isScraped'] = !isDeleted[0].isDeleted;
            responseData['scrapCount'] = updateScrapCount[0].scrapCount;
          }
          // scrap이 false인 경우
          else {
            const updateScrapCount = await reviewDB.updateReviewScrapCount(client, reviewId, scrapCount[0].scrapCount - 1);
            responseData['isScraped'] = !isDeleted[0].isDeleted;
            responseData['scrapCount'] = updateScrapCount[0].scrapCount;
          }
        }
      }

      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.REVIEW_SCRAP_POST_SUCCESS, responseData));
    } else {
      return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NEED_LOGIN));
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
