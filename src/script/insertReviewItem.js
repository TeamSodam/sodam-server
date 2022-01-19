// const { google } = require('googleapis');
// const keys = require('../../keystoGoogleApis.json');

const { GoogleSpreadsheet } = require('google-spreadsheet');
const keys = require('../../keystoGoogleApis.json');
const db = require('../db/db');
const { sheetDB } = require('../db');
const doc = new GoogleSpreadsheet('1v2o-Vq0s5T23XTwMcLCZnLN9z4tctOoQcCA_pAPHp6Q');

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
      console.log('review', item._rawData[0], item._rawData[1], item._rawData[2], item._rawData[3]);
      const id = item._rawData[0];
      const review_id = item._rawData[1];
      const price = item._rawData[2];
      const item_name = item._rawData[3];
      return sheetDB.insertReviewItemData(client, id, review_id, price, item_name);
    });
  } catch (e) {
    console.log('>>>>>>>>e', e);
  }
};

readSheet();
