const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const { duplicatedDataClean } = require('../../lib/convertRawDataToProccessedData');

module.exports = async (req, res) => {
  //sort쿼리 popular, mysave (지역별에서) , popular, review(테마별에서)
  const { area, theme, offset, limit, sort } = req.query;

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
      let responseData = duplicatedDataClean(areaArr, 'shopId', 'category');
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

      if (sort === 'mysave') {
        // 로그인 했으면 db에서 데이터 가져오기
        if (req.user) {
          // 북마크된 shopId를 가져와서 이미 가져온 responseData에서 해당 shopId에 해당하는 소품샵만 반환
          const bookmarkedShopId = await shopDB.getBookmarkedShopIdByUserIdAndArea(client, area, req.user.id);
          const bookmarkedShopIdArr = bookmarkedShopId.map((obj) => obj.shopId);
          if (bookmarkedShopIdArr.length === 0) {
            responseData = [];
            res.status(statusCode.NO_CONTENT).send(util.success(statusCode.NO_CONTENT, responseMessage.SHOP_BY_AREA_SUCCESS, responseData));
          } else {
            responseData = responseData.filter((o) => {
              return bookmarkedShopIdArr.includes(o.shopId);
            });
          }
        } else {
          // 로그인 되어있지 않는 경우
          return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NEED_LOGIN));
        }
      }

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
