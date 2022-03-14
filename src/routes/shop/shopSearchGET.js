const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const { duplicatedDataClean } = require('../../lib/convertRawDataToProccessedData');
const { response } = require('express');
const slackAPI = require('../../middlewares/slackAPI');

module.exports = async (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);
    if (keyword) {
      let shopArr = await shopDB.getShopByName(client, keyword);
      shopArr = duplicatedDataClean(shopArr, 'shopId', 'category');

      const imagePromise = shopArr.map((item) => {
        const shopId = item.shopId;
        return shopDB.getPreviewImageByShopId(client, shopId);
      });

      const previewImageObj = {};
      await Promise.allSettled(imagePromise).then((image) => {
        image.map((result) => {
          if (result.status === 'fulfilled') {
            if (result.value.length >= 1) {
              previewImageObj[Number(result.value[0]?.shopId)] = result.value[0];
              return result.value[0];
            }
          }
        });
      });

      shopArr.map((item) => {
        if (previewImageObj[item.shopId]) {
          item.image = previewImageObj[item.shopId].image;
        }
        if (!item.image) {
          item.image = null;
        }
      });

      const responseData = duplicatedDataClean(shopArr, 'shopId', 'image');
      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_SHOP_BY_NAME, responseData));
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
