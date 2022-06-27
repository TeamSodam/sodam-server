const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { adminUserDB, shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const jwtHandlers = require('../../lib/jwtHandlers');
const slackAPI = require('../../middlewares/slackAPI');

module.exports = async (req, res) => {
//   if (req.headers.accesstoken) {
//     return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NEED_LOGIN));
//   }
  
  const { shopName, subway, roadAddress, landAddress, time, close, phone, homepage, instagram, blog, store, area, category, theme, image} = req.body;
  if(!shopName || !subway || !roadAddress || !landAddress || !area || !category || !theme){
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
//   const imageUrls = req.imageUrls;
//   if(!imageUrls || !image) {
//       return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NULL_VALUE));
//   }

  let client;

  try {
    client = await db.connect(req);
    const closeDay = close; 
    const newShop = await shopDB.insertNewShopData(client, shopName, subway, roadAddress, landAddress, time, closeDay, phone, homepage, instagram, blog, store, area);
    //새로운 shop 데이터 저장 후 다시 받아와서 id값 파악, 이후 이미지, category, theme 저장시에 사용
    const newShopId = newShop[0].id;
    console.log(newShopId);
  } catch (error) {
    console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    // 슬랙으로 보낼 메시지
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user[0].id}` : `req.user 없음`} \n[CONTENT] ${error} \n${JSON.stringify(error)} `;

    // 슬랙 Webhook을 사용해, 에러가 발생했을 때 슬랙으로 해당 에러 내용을 담은 메시지를 보내는 코드
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
