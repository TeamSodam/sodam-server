const e = require('express');
const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const slackAPI = require('../../middlewares/slackAPI');

module.exports = async (req, res) => {
  // params 확인
  const { shopId } = req.params;

  if (!shopId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  if (isNaN(shopId)) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    // 불러올 데이터 개수 제한
    const limit = 20;
    // shop 데이터 불러오기
    const targetShop = await shopDB.getShopByShopId(client, shopId);

    // shop 데이터 결과 없으면 실패
    if (targetShop.length === 0) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_SHOP));
    }

    // 지하철역에 해당하는 샵 정보 20개 얻기
    // 소품샵 상세페이지에 나온 소품샵과 같은 소품샵 제외
    const nearShop = await shopDB.getShopBySubwayNotShopIdLimit(client, targetShop[0].subway, shopId, limit);

    // 지하철역에 해당하는 샵이 0개임
    if (nearShop.length === 0) {
      // response 데이터 합치기
      const result = {
        subway: targetShop[0].subway,
        shopList: nearShop,
      };

      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.RECOMMEND_BY_SUBWAY_SUCCESS, result));
    }

    // 지하철역에 해당하는 소품샵 정보 배열 만들기 (최소 1개, 최대 20개)
    const nearSubwayShopList = await Promise.all(
      nearShop.map(async (shop) => {
        let category = await shopDB.getCategoryByShopId(client, shop.shopId);
        let image = await shopDB.getPreviewImageByShopId(client, shop.shopId);

        // 객체를 배열로 펼쳐주기
        category = category.map((item) => item.name);

        // 이미지가 없는 경우
        if (image.length === 0) {
          image = [];
        } else {
          image = [image[0].image];
        }

        // 데이터 모양 맞춰주기
        const shopData = {
          shopId: Number(shop.shopId),
          shopName: shop.shopName,
          category,
          image,
        };

        return shopData;
      }),
    );

    // response 데이터 합치기
    const result = {
      subway: targetShop[0].subway,
      shopList: nearSubwayShopList,
    };

    // 성공 response 보내기
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.RECOMMEND_BY_SUBWAY_SUCCESS, result));
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
