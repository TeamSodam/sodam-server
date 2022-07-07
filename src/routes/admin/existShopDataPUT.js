const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { adminUserDB, shopDB, themeDB, categoryDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const jwtHandlers = require('../../lib/jwtHandlers');
const slackAPI = require('../../middlewares/slackAPI');
const shopDataGET = require('./shopDataGET');
const { duplicatedDataClean } = require('../../lib/convertRawDataToProccessedData');

module.exports = async (req, res) => {
  const { shopName, subway, roadAddress, landAddress, time, close, phone, homepage, instagram, blog, store, area, category, theme, image} = req.body;
  if(!shopName || !subway || !roadAddress || !landAddress || !area || !category || !theme){
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  
//   const imageUrls = req.imageUrls;
//   if(imageUrls.length === 0) {
//       return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NO_IMAGE));
//   }
  
  let shopId;
  let client;
    try {
        client = await db.connect(req);
        if(shopName){
            let shopArr = await shopDB.getShopByName(client, shopName);
            if(shopArr){
                shopArr = duplicatedDataClean(shopArr,'shopId','category');
                shopId = await shopArr[0].shopId;
            }
        }
        console.log(shopId);
        const closeDay = close; 
        const existShop = await shopDB.updateShopData(client, shopId, subway, roadAddress, landAddress, time, closeDay, phone, homepage, instagram, blog, store, area);
        //새로운 shop 데이터 저장 후 다시 받아와서 id값 파악, 이후 이미지, category, theme 저장시에 사용
        console.log(existShop);
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
