const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');

module.exports = async (req, res) => {
  // params 확인
  const { shopId } = req.params;

  if (!shopId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);
    // shop 데이터 불러오기
    const shop = await shopDB.getShopByShopId(client, shopId);

    // shop 데이터 결과 없으면 실패
    if (shop.length === 0) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_SHOP));
    }

    // 나머지 데이터 불러오기
    let category = await shopDB.getCategoryByShopId(client, shopId);
    let theme = await shopDB.getThemeByShopId(client, shopId);
    let image = await shopDB.getImageByShopId(client, shopId);

    // 북마크 여부
    let isBookmarked = false;

    // 로그인 했으면 db에서 데이터 가져오기
    if (req.user) {
      const bookmark = await shopDB.getShopBookmarkByUserId(client, shopId, req.user[0].id);
      if (bookmark.length !== 0) isBookmarked = true;
    }

    // shop 데이터와 category, theme, image 합치기
    // 객체를 배열로 펼쳐주기
    category = category.map((item) => item.name);
    theme = theme.map((item) => item.name);
    image = image.map((item) => item.image);

    // shop의 id키 이름을 shopId로 변경
    if (shop[0].hasOwnProperty('id')) {
      shop[0].shopId = Number(shop[0].id);
      delete shop[0].id;
    }

    // 데이터 합치기
    const result = {
      ...shop[0],
      isBookmarked,
      category,
      theme,
      image,
    };

    // 성공 response 보내기
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_ONE_SHOP_SUCCESS, result));
  } catch (error) {
    console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
