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
  const userId = req.user[0].id;

  if (!userId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  let client;

  try {
    client = await db.connect(req);
    if (userId) {
      const myReviewArr = await reviewDB.getReviewByUserId(client, userId);

      const imagePromise = myReviewArr.map((item) => {
        const reviewId = item.reviewId;
        return reviewDB.getPreviewImageByReviewId(client, reviewId);
      });

      const previewImageObj = {};
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

      myReviewArr.map((item) => {
        if (previewImageObj[item.reviewId]) {
          item.image = previewImageObj[item.reviewId].image;
        }
        if (!item.image) {
          item.image = null;
        }
      });

      let responseData = [];
      responseData = myReviewArr;
      responseData = duplicatedDataClean(responseData, 'reviewId', 'image');

      responseData = await Promise.all(
        responseData.map(async (value) => {
          let shopId = value.shopId;
          let shop = await shopDB.getShopByShopId(client, shopId);
          // if (shop.length === 0) {
          //   return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_SHOP));
          // }

          let category = await shopDB.getCategoryByShopId(client, shopId);

          category = category.map((item) => item.name);

          const result = {
            ...value,
            category,
            shopName: shop[0].shopName,
          };
          return result;
        }),
      );

      if (myReviewArr.length !== 0) res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_REVIEW_OF_MINE, responseData));
      else {
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.NO_REVIEW, myReviewArr));
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
