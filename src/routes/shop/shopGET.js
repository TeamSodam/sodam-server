const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');

module.exports = async (req, res) => {
  const { area, theme } = req.query;

  if (!area && !theme) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);
    if (area) {
      const areaArr = await shopDB.getShopByArea(client, area);
      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SHOP_BY_AREA_SUCCESS, areaArr));
    }
    if (theme) {
      const themeArr = await shopDB.getShopByTheme(client, theme);
      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SHOP_BY_THEME_SUCCESS, themeArr));
    }
  } catch (error) {
    console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
