// const { google } = require('googleapis');
// const keys = require('../../keystoGoogleApis.json');

const { GoogleSpreadsheet } = require('google-spreadsheet');
const keys = require('../../keystoGoogleApis.json');
const db = require('../db/db');
const { sheetDB } = require('../db');
const doc = new GoogleSpreadsheet('1zIwVOaZRyo6COY00ZNJyuSMjD7mVq942HgQIv3C0zcQ');

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
    const rows = await sheet.getRows({ offset: 0, limit: 30 });
    const result = rows.map((item) => {
      console.log('item>>>', item._rawData[0], item._rawData[1], item._rawData[2], item._rawData[3], item._rawData[4], item._rawData[5]);
      const user_id = item._rawData[0];
      const name = item._rawData[1];
      const nickname = item._rawData[2];
      const email = item._rawData[3];
      const password = item._rawData[4];
      const preference_theme = item._rawData[5];
      const image = 'https://source.unsplash.com/random';
      return sheetDB.insertUserData(client, user_id, name, email, nickname, image, password, email, preference_theme);
    });
  } catch (e) {
    console.log('>>>>>>>>e', e);
  }
};

readSheet();
