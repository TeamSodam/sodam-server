const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const { duplicatedDataClean } = require('../../lib/convertRawDataToProccessedData');
const slackAPI = require('../../middlewares/slackAPI');

const typeArray = ['문구팬시', '인테리어소품', '주방용품', '패션소품', '공예품', '인형장난감'];

function randomItem(a) {
  return a[Math.floor(Math.random() * a.length)];
}

module.exports = async (req, res) => {
  const { type } = req.query;
  if (!type) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  let client;

  try {
    client = await db.connect(req);
    let shopIdArr;
    if (type == 'random') {
      const randomType = randomItem(typeArray);
      //해당 타입을 가지는 shop들의 리스트를 가져옴
      shopIdArr = await shopDB.getShopIdByCategory(client, randomType);
    } else {
      shopIdArr = await shopDB.getShopIdByCategory(client, type);
    }

    // console.log('shopIdArr', shopIdArr);

    const shopAllList = await Promise.all(
      //소품샵 아이디 리스트가 있으면 해당 리스트들을 돌면서 shop정보를 가져옴
      shopIdArr.map(async (item) => {
        let shopArr = await shopDB.getShopListByShopId(client, item.shopId);
        //console.log('shopArr', shopArr);
        let cleanData = duplicatedDataClean(shopArr, 'shopId', 'category');
        return cleanData[0];
      }),
    );

    // console.log('shopAllList', shopAllList);

    const imagePromise = shopAllList.map((item) => {
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

    shopAllList.map((item) => {
      if (!item.image) {
        item.image = null;
      }
    });

    // console.log(shopAllList);
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SHOP_BY_CATEGORY_SUCCESS, shopAllList));
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
