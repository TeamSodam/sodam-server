const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB, reviewDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const { convertStringToNum } = require('../../lib/convertStringToNum');
const slackAPI = require('../../middlewares/slackAPI');

module.exports = async (req, res) => {
  if (!req.user) {
    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NEED_LOGIN));
  }
  let client;

  try {
    let responseData;
    client = await db.connect(req);
    let allShopCount = await shopDB.getShopCounts(client);
    let allReviewCount = await reviewDB.getReviewCounts(client);
    let shopCategoryCount = await shopDB.getShopCategoryCount(client);
    let shopThemeCount = await shopDB.getShopThemeCount(client);
    let shopAreaCount = await shopDB.getShopAreaCount(client);
    allShopCount = convertStringToNum(allShopCount, 'count');
    allReviewCount = convertStringToNum(allReviewCount, 'count');
    shopCategoryCount = convertStringToNum(shopCategoryCount, 'count');
    shopThemeCount = convertStringToNum(shopThemeCount, 'count');
    shopAreaCount = convertStringToNum(shopAreaCount, 'count');

    responseData = {
      allShopCount: [{ name: '전체 소품샵 수', ...allShopCount[0] }],
      allReviewCount: [{ name: '전체 리뷰 수', ...allReviewCount[0] }],
      shopCategoryCount: shopCategoryCount,
      shopThemeCount: shopThemeCount,
      shopAreaCount: shopAreaCount,
    };

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_SHOP_DATA_SUCCESS, responseData));
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
