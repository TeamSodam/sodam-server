const { GoogleSpreadsheet } = require('google-spreadsheet');
const keys = require('../../keystoGoogleApis.json');
const db = require('../db/db');
const { sheetDB } = require('../db');

// ==============================================
// IMPORTANT: 필요한 시트 주석 해제하고 사용하세요
// 둘 다 넣어줘야 합니다
// ==============================================

// 크롤링이미지_최종
// const doc = new GoogleSpreadsheet('1T9UUGs010dilS1phcmVq-s1gF1jOo-obV7bqvPBqSLU');

// 이미지 없는 소품샵 리스트_이미지 url (221009 업데이트)
// const doc = new GoogleSpreadsheet('1xr_p-9XOygzJvZ3tLTSF__uWYjEGsT1hrhyil1dUZ_I');

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

    const rows = await sheet.getRows({ offset: 0, limit: 1500 });
    const result = rows.map((item) => {
      // console.log('shop_image', item._rawData[0], item._rawData[1], item._rawData[2], item._rawData[3]);
      const shop_id = item._rawData[0];
      const image_no = item._rawData[1];
      const image_url = item._rawData[2];
      const is_preview = item._rawData[3];

      if (!image_url) {
        console.log('no image', item._rawData[0], item._rawData[1]);
        return;
      }
      // 해당 url이 있어야 이미지가 잘 열림
      if (image_url.includes('https://search.pstatic.net/common/?src=')) {
        return sheetDB.insertShopImageData(client, shop_id, image_url, is_preview);
      } else {
        return sheetDB.insertShopImageData(client, shop_id, 'https://search.pstatic.net/common/?src=' + image_url, is_preview);
      }
    });
  } catch (e) {
    console.log('>>>>>>>>e', e);
  }
};

readSheet();
