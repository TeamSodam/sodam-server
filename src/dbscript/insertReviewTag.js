// const { google } = require('googleapis');
// const keys = require('../../keystoGoogleApis.json');

const { GoogleSpreadsheet } = require('google-spreadsheet');
const keys = require('../../keystoGoogleApis.json');
const db = require('../db/db');
const { sheetDB } = require('../db');
const doc = new GoogleSpreadsheet('1nNoxbQZCwYbdHgbKoe00oKhBuLqCw8U6dclYKoVxr1w');

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
    const rows = await sheet.getRows({ offset: 0, limit: 60 });
    const result = rows.map((item) => {
      console.log('review', item._rawData[0], item._rawData[1], item._rawData[2]);
      const id = item._rawData[0];
      const review_id = item._rawData[1];
      const tag_id = item._rawData[2];
      return sheetDB.insertReviewTagData(client, id, review_id, tag_id);
    });
  } catch (e) {
    console.log('>>>>>>>>e', e);
  }
};

readSheet();
