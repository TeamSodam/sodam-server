const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const { duplicatedDataClean } = require('../../lib/convertRawDataToProccessedData');

module.exports = async (req, res) => {
  //sort쿼리 save, recent, review
  const { sort, offset, limit } = req.query;
  console.log('>>>', req.query);

  if (!offset || !limit) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);
    // 로그인 되어있는 경우
    if (req.user) {
      const savedShopList = await shopDB.getSavedShopList(client, sort, req.user.id, offset - 1, limit);
      let responseData = duplicatedDataClean(savedShopList, 'shopId', 'category');
      if (responseData.length === 0) {
        responseData = [];
        return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.SAVED_SHOP_EMPTY, responseData));
      }
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

      // image값이 없으면 null로 채워보내기
      responseData.map((item) => {
        if (!item.image) {
          item.image = null;
        }
      });

      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SAVED_SHOP_SUCCESS, responseData));
    } else {
      // 로그인 되어있지 않는 경우
      return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NEED_LOGIN));
    }
  } catch (error) {
    console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
