const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const { duplicatedDataClean } = require('../../lib/convertRawDataToProccessedData');
const router = require('../user');
const slackAPI = require('../../middlewares/slackAPI');

module.exports = async (req, res) => {
  const { type } = req.query;

  if (!type) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  let client;
  let shopArr = [];

  try {
    client = await db.connect(req);
    const numArr = [];
    const num = await shopDB.getShopCounts(client);
    // console.log(num);
    if (type === 'random') {
      //랜덤 숫자 20개 골라서 getShopById 이용해서 정보 불러오기
      for (i = 0; i < 20; i++) {
        randomNum = Math.floor(Math.random() * num[0].count);
        numArr.push(randomNum);
      }
      shopArr = await Promise.all(
        numArr.map(async (value) => {
          const shop = await shopDB.getShopByShopId(client, value);
          const shopId = shop[0].shopId;
          const shopName = shop[0].shopName;
          if (shop.length === 0) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_SHOP));
          }

          let category = await shopDB.getCategoryByShopId(client, value);
          let theme = await shopDB.getThemeByShopId(client, value);
          let image = await shopDB.getImageByShopId(client, value);

          category = category.map((item) => item.name);
          theme = theme.map((item) => item.name);
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
      const rankList = await shopDB.getShopBookmarkByCounts(client);
      let responseRankData = duplicatedDataClean(rankList, 'shopId', 'category');
      const imagePromise = responseRankData.map((item) => {
        const shopId = item.shopId;
        return shopDB.getPreviewImageByShopId(client, shopId);
      });

      // // TODO 이미지 데이터 들어오는 포맷 보고 데이터 붙이기
      // Promise.allSettled(imagePromise).then((image) => {
      //   image.forEach((result) => {
      //     if (result.status === 'fulfilled') {
      //       console.log('성공함');
      //     } else if (result.status === 'rejected') {
      //       //     console.log('리젝티드됨');
      //     }
      //   });
      // });

      // responseRankData.map((item) => {
      //   if (!item.image) {
      //     item.image = null;
      //   }
      // });

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
      responseRankData.map((item) => {
        if (previewImageObj[item.shopId]) {
          item.image = previewImageObj[item.shopId].image;
        }
        if (!item.image) {
          item.image = null;
        }
      });

      responseData = duplicatedDataClean(responseRankData, 'shopId', 'image');
      console.log(responseData);
      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_SHOP_RECOMMEND_SUCCESS, responseData));
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
