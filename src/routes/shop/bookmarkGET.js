const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const { duplicatedDataClean } = require('../../lib/convertRawDataToProccessedData');
const slackAPI = require('../../middlewares/slackAPI');

module.exports = async (req, res) => {
  //sort쿼리 save, recent, review
  const { sort, offset, limit } = req.query;

  // offset, limit 설정
  let pageOffset = 0;
  let pageLimit = 20;

  if (offset) {
    pageOffset = Number((offset - 1) * limit);
  }

  if (limit) {
    pageLimit = limit;
  }

  let client;

  try {
    client = await db.connect(req);
    // 로그인 되어있는 경우
    if (req.user) {
      const savedShopList = await shopDB.getSavedShopList(client, sort, req.user[0].id, pageOffset, pageLimit);
      let responseData = duplicatedDataClean(savedShopList, 'shopId', 'category');
      if (responseData.length === 0) {
        responseData = [];
        return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.SAVED_SHOP_EMPTY, responseData));
      }
      const imagePromise = responseData.map((item) => {
        const shopId = item.shopId;
        return shopDB.getPreviewImageByShopId(client, shopId);
      });
      const previewImageObj = {};
      // TODO 이미지 데이터 들어오는 포맷 보고 데이터 붙이기
      await Promise.allSettled(imagePromise).then((image) => {
        image.map((result) => {
          if (result.status === 'fulfilled') {
            if (result.value.length >= 1) {
              previewImageObj[Number(result.value[0]?.shopid)] = result.value[0];
              return result.value[0];
            }
          }
        });
      });
      responseData.map((item) => {
        if (previewImageObj[item.shopId]) {
          item.image = [previewImageObj[item.shopId].image];
        }
        if (!item.image) {
          item.image = null;
        }
      });

      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SAVED_SHOP_SUCCESS, responseData));
    } else {
      // 로그인 되어있지 않는 경우
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
