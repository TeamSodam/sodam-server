const { GoogleSpreadsheet } = require('google-spreadsheet');
const keys = require('../../keystoGoogleApis.json');
const db = require('../db/db');
const { sheetDB } = require('../db');
const doc = new GoogleSpreadsheet('1SkoUmp64zakn2I7PatE4JYUU0BjxduGjSHoX8CPcH3Q');

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
    const rows = await sheet.getRows({ offset: 0, limit: 26 });
    const result = rows.map((item) => {
      console.log('review', item._rawData[0], item._rawData[1], item._rawData[2], item._rawData[3]);
      const id = item._rawData[0];
      const shop_id = item._rawData[1];
      const user_id = item._rawData[2];
      const content = item._rawData[3];
      return sheetDB.insertReviewData(client, id, shop_id, user_id, content);
    });
    // 나중에 카운트 올리는 로직 필요하면 추가
    // const updateCount = rows.map((item) => {
    //   console.log('review', item._rawData[0], item._rawData[1], item._rawData[2], item._rawData[3]);
    //   const id = item._rawData[0];
    //   const shop_id = item._rawData[1];
    //   const user_id = item._rawData[2];
    //   const content = item._rawData[3];
    //   return sheetDB.updateShopReviewCount(client, id, shop_id, user_id, content);
    // });
  } catch (e) {
    console.log('>>>>>>>>e', e);
  }
};

readSheet();
