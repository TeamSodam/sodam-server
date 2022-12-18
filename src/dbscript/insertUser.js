// const { google } = require('googleapis');
// const keys = require('../../keystoGoogleApis.json');

const { GoogleSpreadsheet } = require('google-spreadsheet');
const keys = require('../../keystoGoogleApis.json');
const db = require('../db/db');
const { sheetDB, userDB, themeDB } = require('../db');
const { createHashedPassword } = require('../lib/encryptHandler');

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

    // 전체 테마 목록 가져오기
    let allTheme = await themeDB.getAllTheme(client);

    const result = rows.map(async (item) => {
      console.log('item>>>', item._rawData[0], item._rawData[1], item._rawData[2], item._rawData[3], item._rawData[4], item._rawData[5]);
      const user_id = item._rawData[0];
      const name = item._rawData[1];
      const nickname = item._rawData[2];
      const email = item._rawData[3];
      const password = item._rawData[4];
      const preference_theme = item._rawData[5];

      // 선호테마를 테마번호로 바꿔주기
      const themePreferenceNumber = [];
      await allTheme.forEach((element) => {
        if (element.name == preference_theme) {
          themePreferenceNumber.push(element.id);
        }
      });

      const { password: encryptedPassword, salt } = await createHashedPassword(password);
      const image = 'https://source.unsplash.com/random';
      const user = await sheetDB.insertUserData(client, user_id, name, email, nickname, image, encryptedPassword, salt);
      console.log(user);
      // 테마 저장
      await themePreferenceNumber.forEach((item) => {
        userDB.postThemeByUserIdAndThemeId(client, user[0].id, Number(item));
      });

      return user;
    });
  } catch (e) {
    console.log('>>>>>>>>e', e);
  }
};

readSheet();
