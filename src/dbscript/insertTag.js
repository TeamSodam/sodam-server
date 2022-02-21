// const { google } = require('googleapis');
// const keys = require('../../keystoGoogleApis.json');

const { GoogleSpreadsheet } = require('google-spreadsheet');
const keys = require('../../keystoGoogleApis.json');
const db = require('../db/db');
const { sheetDB } = require('../db');
const doc = new GoogleSpreadsheet('1g7DyXEwY45EKvEFr-6pUdRjOjNa3xjpe-x5vLsbS8JU');

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
    const rows = await sheet.getRows({ offset: 0, limit: 55 });
    const result = rows.map((item) => {
      console.log('tag>>>', item._rawData[0], item._rawData[1]);
      const id = item._rawData[0];
      const name = item._rawData[1];
      return sheetDB.inserttagData(client, id, name);
    });
  } catch (e) {
    console.log('>>>>>>>>e', e);
  }
};

readSheet();
