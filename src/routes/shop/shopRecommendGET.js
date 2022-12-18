const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const { duplicatedDataClean } = require('../../lib/convertRawDataToProccessedData');
const router = require('../user');
const slackAPI = require('../../middlewares/slackAPI');

module.exports = async (req, res) => {
  let client;
  let shopArr = [];

  const { type } = req.query;
  if (!type) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  
  try {
    client = await db.connect(req);
    const shopCount = await shopDB.getShopCounts(client);
    const numArr = [];
    const randomIdList = await shopDB.getShopByRandom(client);
    randomIdList.map((shop) => {
      numArr.push(shop.shopId);
    })
    if (type === 'random') {
        shopArr = await Promise.all(
        numArr.map(async (value) => {
            const shop = await shopDB.getShopByShopId(client, value);
            if (shop.length === 0) {
              return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_SHOP));
            }
            const shopId = shop[0].shopId;
            const shopName = shop[0].shopName;
            
            let category = await shopDB.getCategoryByShopId(client, value);
            let image = await shopDB.getPreviewImageByShopId(client, value);
            
            category = category.map((item) => item.name);
            image = image.map((item) => item.image);
            
            const result = {
              shopId,
              shopName,
              category,
              image,
            };
            return result;
        }),
      );
      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_SHOP_RECOMMEND_SUCCESS, shopArr));
    } else if (type === 'popular') {
      shopArr = await shopDB.getShopByBookmarkCounts(client,20);
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

      shopArr = duplicatedDataClean(shopArr, 'shopId', 'image');
      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_SHOP_RECOMMEND_SUCCESS, shopArr));
    } else{
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
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
