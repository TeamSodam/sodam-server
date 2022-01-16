const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const { duplicatedDataClean } = require('../../lib/convertRawDataToProccessedData');
const router = require('../user');

module.exports = async (req, res) => {
  const { type } = req.query;

  console.log(type);
  if (!type) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  let client;
  let shopArr = [];

  try {
    client = await db.connect(req);
    const numArr = [];
    if (type == 'random') {
      //랜덤 숫자 20개 골라서 getShopById 이용해서 정보 불러오기
      for (i = 0; i < 20; i++) {
        randomNum = Math.floor(Math.random() * 433);
        numArr.push(randomNum);
      }
      console.log(numArr);
      shopArr = await Promise.all(
        numArr.map(async (value) => {
          let shop = await shopDB.getShopByShopId(client, value);
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
            ...shop[0],
            category,
            theme,
            image,
          };
          console.log(result);
          return result;
        }),
      );

      console.log(shopArr);
      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_SHOP_RECOMMEND_SUCCESS, shopArr));
    } else if (type == 'popular') {
      const rankList = await shopDB.getShopBookmarkByCounts(client);
      let responseRankData = duplicatedDataClean(rankList, 'shopId', 'category');
      const imagePromise = responseRankData.map((item) => {
        const shopId = item.shopId;
        return shopDB.getPreviewImageByShopId(client, shopId);
      });

      // TODO 이미지 데이터 들어오는 포맷 보고 데이터 붙이기
      Promise.allSettled(imagePromise).then((image) => {
        image.forEach((result) => {
          if (result.status === 'fulfilled') {
            console.log('성공함');
          } else if (result.status === 'rejected') {
            //     console.log('리젝티드됨');
          }
        });
      });

      responseRankData.map((item) => {
        if (!item.image) {
          item.image = null;
        }
      });

      console.log('responseRankData', responseRankData);
      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_SHOP_RECOMMEND_SUCCESS, responseRankData));
    }
  } catch (error) {
    console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
