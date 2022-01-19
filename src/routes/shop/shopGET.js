const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const { duplicatedDataClean } = require('../../lib/convertRawDataToProccessedData');
const slackAPI = require('../../middlewares/slackAPI');

module.exports = async (req, res) => {
  //sort쿼리 popular, mysave (지역별에서) , popular, review(테마별에서)
  const { area, theme, offset, limit, sort } = req.query;
  let pageOffset;
  let pageLimit;

  if (theme && !offset) {
    pageOffset = 0;
  }
  if (theme && !limit) {
    pageLimit = 20;
  }
  pageOffset = Number((offset - 1) * limit);
  pageLimit = limit;
  if (!area && !theme) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    let responseData;
    client = await db.connect(req);
    if (area) {
      const areaArr = await shopDB.getShopByArea(client, area, sort);
      responseData = duplicatedDataClean(areaArr, 'shopId', 'category');
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

      if (sort === 'mysave') {
        // 로그인 했으면 db에서 데이터 가져오기
        if (req.user) {
          // 북마크된 shopId를 가져와서 이미 가져온 responseData에서 해당 shopId에 해당하는 소품샵만 반환
          const bookmarkedShopId = await shopDB.getBookmarkedShopIdByUserIdAndArea(client, area, req.user.id);
          if (bookmarkedShopId.length === 0) {
            responseData = [];
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SAVED_SHOP_EMPTY, responseData));
          }
          const bookmarkedShopIdArr = bookmarkedShopId.map((obj) => obj.shopId);
          if (bookmarkedShopIdArr.length === 0) {
            const responseData = [];
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SAVED_SHOP_EMPTY, responseData));
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
      const themeArr = await shopDB.getShopByTheme(client, theme, sort, pageOffset, pageLimit);
      responseData = duplicatedDataClean(themeArr, 'shopId', 'category');
      // console.log('responseData',responseData);
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

      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SHOP_BY_THEME_SUCCESS, responseData));
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
