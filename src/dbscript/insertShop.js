const { google } = require('googleapis');
const keys = require('../../keystoGoogleApis.json');

const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();
const db = require('../db/db');
const dbConfig = require('../config/dbConfig');

const client = new google.auth.JWT(keys.client_email, null, keys.private_key, ['https://www.googleapis.com/auth/spreadsheets']);

client.authorize(function (err, tokens) {
  if (err) {
    console.log(err);
    return;
  } else {
    gsrun(client);
  }
});

async function gsrun(client) {
  const sheets = google.sheets({ version: 'v4', auth: client });

  const request = {
    spreadsheetId: '1Mmz6UuohXzPsvhrPLDLGudfAvS11IIcOjEbsqxwx0_c',
    range: '시트1',
  };

  const response = (await sheets.spreadsheets.values.get(request)).data;
  const responseArray = response.values;
  console.log('responseArray', responseArray);

  for (var value of responseArray) {
    for (data of value) {
      if (data == '') {
        data = null;
      }
    }
  }
  const client2 = await db.connect();

  //<shop 테이블 채우는 코드>
  const sql =
    'INSERT INTO shop (id, shop_name, subway, road_address, land_address, time, close, phone, homepage, instagram, blog, store, area, note) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING * ';
  for (var i = 1; i < responseArray.length; i++) {
    const values = [
      responseArray[i][0],
      responseArray[i][1],
      responseArray[i][4],
      responseArray[i][5],
      responseArray[i][6],
      responseArray[i][9],
      responseArray[i][10],
      responseArray[i][8],
      responseArray[i][11],
      responseArray[i][12],
      responseArray[i][13],
      responseArray[i][14],
      responseArray[i][7],
      // responseArray[i][16], // note
    ];
    const { rows } = await client2.query(
      `
                INSERT INTO shop 
                (id, shop_name, subway, road_address, land_address, time, close, phone, homepage, instagram, blog, store, area)
                VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *
                `,
      values,
    );
    console.log(rows);
  }

  //<shop_category 테이블 채우는 코드>
  const sql2 = `
        INSERT INTO shop_category 
        (shop_id, category_id)
        VALUES
        ($1, $2)
        RETURNING *
    `;

  for (var j = 1; j < responseArray.length; j++) {
    let str = responseArray[j][2];
    let split_str = str.split(',');
    let category_id;
    for (var i = 0; i < split_str.length; i++) {
      if (split_str[i] == '문구팬시') {
        category_id = 1;
      } else if (split_str[i] == '인테리어소품') {
        category_id = 2;
      } else if (split_str[i] == '주방용품') {
        category_id = 3;
      } else if (split_str[i] == '패션소품') {
        category_id = 4;
      } else if (split_str[i] == '공예품') {
        category_id = 5;
      } else if (split_str[i] == '인형장난감') {
        category_id = 6;
      }

      const { rows } = await client2.query(sql2, [responseArray[j][0], category_id]);

      console.log(rows);
    }
  }

  //<shop_theme 테이블 채우는 코드>
  const sql3 = `
        INSERT INTO shop_theme 
        (shop_id, theme_id)
        VALUES
        ($1, $2)
        RETURNING *
    `;

  for (var k = 1; k < responseArray.length; k++) {
    let str = responseArray[k][3];
    let split_str = str.split(',');
    let theme_id;
    for (var i = 0; i < split_str.length; i++) {
      if (split_str[i] == '아기자기') {
        theme_id = 1;
      } else if (split_str[i] == '힙함') {
        theme_id = 2;
      } else if (split_str[i] == '모던') {
        theme_id = 3;
      } else if (split_str[i] == '빈티지') {
        theme_id = 4;
      }

      const { rows } = await client2.query(sql3, [responseArray[k][0], theme_id]);

      console.log(rows);
    }
  }
}
