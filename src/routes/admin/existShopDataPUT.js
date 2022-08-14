const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { adminUserDB, shopDB, themeDB, categoryDB, userDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const jwtHandlers = require('../../lib/jwtHandlers');
const slackAPI = require('../../middlewares/slackAPI');
const shopDataGET = require('./shopDataGET');
const { duplicatedDataClean } = require('../../lib/convertRawDataToProccessedData');

module.exports = async (req, res) => {
  const { shopName, subway, roadAddress, landAddress, time, close, phone, homepage, instagram, blog, store, area, category, theme} = req.body;
  if(!shopName || !subway || !roadAddress || !landAddress || !area || !category || !theme){
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  
  //데이터 파싱 후 새 변수로 저장
  const parsedTheme = JSON.parse(theme);
  const parsedCategory = JSON.parse(category);

  const imageUrls = req.imageUrls;
  if(imageUrls.length === 0) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NO_IMAGE));
  }
  
  let shopId;
  let client;
    try {
        client = await db.connect(req);

        //shopName 통해서 검색해서 shopId 받아오기 
        if(shopName){
            let shopArr = await shopDB.getShopByName(client, shopName);
            if(shopArr){
                shopArr = duplicatedDataClean(shopArr,'shopId','category');
                shopId = await shopArr[0].shopId;
            }
        }

        // 1.테마 관련
        //새로운 테마를 받아와서 테마번호 배열로 바꿔주기 
        let allTheme = await themeDB.getAllTheme(client);
        const newTheme = [];
        allTheme.forEach((element) => {
            if(parsedTheme.includes(element.name)){
                newTheme.push(element.id);
            }
        });

        //shopId 통해서 기존 테마, 카테고리, 이미지 가져와서 비교하고, delete 후 새로운 내용 update
        let originalTheme = await shopDB.getThemeIdByShopId(client, shopId);
        originalTheme = originalTheme.map((item) => item.themeId);

        const toDelete = originalTheme.filter((x) => !newTheme.includes(x)); //삭제할 theme들 골라내기 
        const toAdd = newTheme.filter((x) => !originalTheme.includes(x)); //추가할 theme들 골라내기

        toDelete.forEach((item) => {
            shopDB.deleteThemeByShopIdAndThemeId(client, shopId, Number(item));
        })

        toAdd.forEach((item) => {
            shopDB.postThemeByShopIdAndThemeId(client, shopId, Number(item))
        })

        // 2. 카테고리 관련
        let allCategory = await categoryDB.getAllCategory(client);
        const newCategory = [];
        allCategory.forEach((element) => {
            if(parsedCategory.includes(element.name)){
                newCategory.push(element.id);
            }
        });

        let originalCategory = await shopDB.getCategoryIdByShopId(client, shopId);
        originalCategory = originalCategory.map((item) => item.categoryId);

        const toDeleteCategory = originalCategory.filter((x) => !newCategory.includes(x));
        const toAddCategory = newCategory.filter((x) => !originalCategory.includes(x));

        toDeleteCategory.forEach((item) => {
            shopDB.deleteCategoryByShopIdAndCategoryId(client, shopId, Number(item));
        })

        toAddCategory.forEach((item) => {
            shopDB.postCategoryByShopIdAndCategoryId(client, shopId, Number(item));
        })

        const closeDay = close; 
        const existShop = await shopDB.updateShopData(client, shopId, subway, roadAddress, landAddress, time, closeDay, phone, homepage, instagram, blog, store, area);
        //새로운 shop 데이터 저장 후 다시 받아와서 id값 파악, 이후 이미지, category, theme 저장시에 사용

        // 3. 이미지 관련 
        await shopDB.deleteShopImageByShopId(client, shopId);
        await shopDB.insertShopImage(client, shopId, imageUrls[0], true);
        imageUrls.slice(1).map(async (url) => {
            const createdShopImage = await reviewDB.insertShopImage(client, shopId, url);
        });

        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_SHOP_DATA));

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
