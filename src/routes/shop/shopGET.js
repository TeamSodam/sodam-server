const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const { duplicatedDataClean } = require('../../lib/convertRawDataToProccessedData');
const slackAPI = require('../../middlewares/slackAPI');

// 지역별 소품샵 - 쿼리로 area, sort를 받음
// 테마별 소품샵 - 쿼리로 theme, sort, offset, limit을 받음
module.exports = async (req, res) => {
  //sort쿼리 popular, mysave (지역별에서) , popular, review(테마별에서)
  const { area, theme, offset, limit, sort } = req.query;
  let pageOffset;
  let pageLimit;

  pageOffset = Number((offset - 1) * limit);
  pageLimit = limit;

  if (theme && !offset) {
    pageOffset = 0;
  }
  if (theme && !limit) {
    pageLimit = 20;
  }
  if (!area && !theme) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    let responseData;
    client = await db.connect(req);
    // 지역별 소품샵 불러오기 로직
    if (area) {
      const areaArr = await shopDB.getShopByArea(client, area, sort);
      responseData = duplicatedDataClean(areaArr, 'shopId', 'category');

      // 이미지 데이터는 promise배열로 받고 풀어서 response데이터에 붙임
      const imagePromise = responseData.map((item) => {
        const shopId = item.shopId;
        return shopDB.getPreviewImageByShopId(client, shopId);
      });
      const previewImageObj = {};

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

      // 테마별 소품샵 불러오기 로직
      if (sort === 'mysave') {
        // 로그인 했으면 db에서 데이터 가져오기
        if (req.user) {
          // 북마크된 shopId를 가져와서 이미 가져온 responseData에서 해당 shopId에 해당하는 소품샵만 반환
          const bookmarkedShopId = await shopDB.getBookmarkedShopIdByUserIdAndArea(client, area, req.user[0].id);

          // 저장된 소품샵이 없는 경우
          if (bookmarkedShopId.length === 0) {
            responseData = [];
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SAVED_SHOP_EMPTY, responseData));
          }

          // 저장된 소품샵이 있는 경우
          const bookmarkedShopIdArr = bookmarkedShopId.map((obj) => obj.shopId);
          if (bookmarkedShopIdArr.length === 0) {
            responseData = [];
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
      // 해당 테마에 해당하는 소품샵 데이터를 불러옴
      responseData = await shopDB.getShopByTheme(client, theme, sort, pageOffset, pageLimit);

      // 이미지 데이터 promise 배열로 받음
      const imagePromise = responseData.map((item) => {
        const shopId = item.shopId;
        return shopDB.getPreviewImageByShopId(client, shopId);
      });

      // 카테고리 데이터 promise 배열로 받음
      const categoryPromise = responseData.map((item) => {
        const shopId = item.shopId;
        return shopDB.getCategoryAndIdByShopId(client, shopId);
      });

      const previewImageObj = {};
      const categoryObj = {};

      // promise 배열을 순서대로 품
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

      // 풀어낸 promise 배열 데이터를 reponseData에 붙임
      responseData.map((item) => {
        if (previewImageObj[item.shopId]) {
          item.image = [previewImageObj[item.shopId].image];
          item.category = [categoryObj[item.shopId]];
        }
        if (!item.image) {
          item.image = null;
        }
        if (!item.category) {
          item.category = null;
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
