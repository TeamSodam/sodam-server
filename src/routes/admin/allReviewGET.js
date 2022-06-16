const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { reviewDB, shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const { duplicatedDataClean } = require('../../lib/convertRawDataToProccessedData');
const slackAPI = require('../../middlewares/slackAPI');

module.exports = async (req, res) => {
  if (!req.user) {
    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NEED_LOGIN));
  }
  const { sort, offset, limit } = req.query;
  let pageOffset = Number((offset - 1) * limit);
  let pageLimit = limit;

  if (!offset) {
    pageOffset = 0;
  }
  if (!limit) {
    pageLimit = 20;
  }
  let client;

  try {
    let responseData;
    client = await db.connect(req);

    responseData = await reviewDB.getAllReview(client, sort, pageOffset, pageLimit);
    const imagePromise = responseData.map((item) => {
      const reviewId = item.reviewId;
      return reviewDB.getPreviewImageByReviewId(client, reviewId);
    });

    const categoryPromise = responseData.map((item) => {
      const shopId = item.shopId;
      return shopDB.getCategoryAndIdByShopId(client, shopId);
    });

    const previewImageObj = {};
    const categoryObj = {};
    await Promise.allSettled(imagePromise).then((image) => {
      image.map((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.length >= 1) {
            previewImageObj[Number(result.value[0]?.reviewid)] = result.value[0];
            return result.value[0];
          }
        }
      });
    });
    await Promise.allSettled(categoryPromise).then((shop) => {
      shop.map((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.length >= 1) {
            const newData = result.value.map((o) => o.name);
            categoryObj[Number(result.value[0]?.shopId)] = newData;
            return newData;
          }
        }
      });
    });

    responseData.map((item) => {
      if (previewImageObj[item.reviewId]) {
        item.image = [previewImageObj[item.reviewId].image];
        item.category = categoryObj[item.shopId];
      }
      if (!item.image) {
        item.image = null;
      }
      if (!item.category) {
        item.category = null;
      }
    });

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_ALL_REVIEW_SUCCESS, responseData));
  } catch (error) {
    console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    // 슬랙으로 보낼 메시지
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user[0].id}` : `req.user 없음`} \n[CONTENT] ${error} \n${JSON.stringify(error)} `;

    // 슬랙 Webhook을 사용해, 에러가 발생했을 때 슬랙으로 해당 에러 내용을 담은 메시지를 보내는 코드
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
