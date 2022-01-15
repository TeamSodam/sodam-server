const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const { duplicatedDataClean } = require('../../lib/convertRawDataToProccessedData');

module.exports = async (req, res) => {
  // popular, mysave (지역별에서) , popular, review(테마별에서)
  const { area, theme, offset, limit, sort } = req.query;
  // TODO 지역별 소품샵 데이터 받기에서 mysave로 sort 구현하기 (토큰 받은 이후)
  const { token } = req.header;
  if (theme && (!offset || !limit)) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  if (!area && !theme) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);
    if (area) {
      const areaArr = await shopDB.getShopByArea(client, area, sort);
      const responseData = duplicatedDataClean(areaArr, 'shopId', 'category');
      const imagePromise = responseData.map((item) => {
        const shopId = item.shopId;
        return shopDB.getPreviewImageByShopId(client, shopId);
      });

      // TODO 이미지 데이터 들어오는 포맷 보고 데이터 붙이기
      Promise.allSettled(imagePromise).then((image) => {
        image.forEach((result) => {
          if (result.status === 'fulfilled') {
            console.log('성공함');
          } else if (result.status === 'rejected') {
            // console.log('[IMAGE PROMISE REJECTED]');
          }
        });
      });

      responseData.map((item) => {
        if (!item.image) {
          item.image = null;
        }
      });

      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SHOP_BY_AREA_SUCCESS, responseData));
    }
    if (theme) {
      const themeArr = await shopDB.getShopByTheme(client, theme, sort, offset, limit);
      const responseData = duplicatedDataClean(themeArr, 'shopId', 'category');
      const imagePromise = responseData.map((item) => {
        const shopId = item.shopId;
        return shopDB.getPreviewImageByShopId(client, shopId);
      });

      // TODO 이미지 데이터 들어오는 포맷 보고 데이터 붙이기
      Promise.allSettled(imagePromise).then((image) => {
        image.forEach((result) => {
          if (result.status === 'fulfilled') {
            console.log('성공함');
          } else if (result.status === 'rejected') {
            // console.log('[IMAGE PROMISE REJECTED]');
          }
        });
      });

      responseData.map((item) => {
        if (!item.image) {
          item.image = null;
        }
      });
      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SHOP_BY_THEME_SUCCESS, responseData));
    }
  } catch (error) {
    console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
