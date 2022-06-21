// 이미지 없는 소품샵 리스트_이미지 url
const { GoogleSpreadsheet } = require('google-spreadsheet');
const keys = require('../../keystoGoogleApis.json');
const db = require('../db/db');
const { sheetDB } = require('../db');
const doc = new GoogleSpreadsheet('1v4Y4g5HJ2PMmD12yPKdW0FwmmqMrYWganIV9cyHQCnY');

let client;

const authGoogleSheet = async () => {
  try {
    await doc.useServiceAccountAuth(keys);
    await doc.loadInfo();
  } catch (e) {
    console.log('AUTH ERROR', e);
  }
};

const readSheet = async () => {
  try {
    client = await db.connect();
    await authGoogleSheet();
    const sheet = await doc.sheetsByIndex[0];
    const rows = await sheet.getRows({ offset: 0, limit: 100 });
    const result = rows.map((item) => {
      // console.log('shop_image', item._rawData[0], item._rawData[1], item._rawData[2], item._rawData[3]);
      const shop_id = item._rawData[0];
      const image_no = item._rawData[1];
      const image_url = item._rawData[2];
      const is_preview = item._rawData[3];
      if (image_url.includes('search')) {
        return sheetDB.insertShopImageData(client, shop_id, image_url, is_preview);
      } else {
        console.log('wrong image', item._rawData[0], item._rawData[1]);
      }
    });
  } catch (e) {
    console.log('>>>>>>>>e', e);
  }
};

readSheet();
