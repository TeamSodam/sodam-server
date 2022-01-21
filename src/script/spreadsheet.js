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

  for (var value of responseArray) {
    for (data of value) {
      if (data == '') {
        data = null;
      }
    }
  }
  const client2 = await db.connect();
  /*
  //<shop 테이블 채우는 코드>
  const sql =
    'INSERT INTO shop (id, shop_name, subway, road_address, land_address, time, close, phone, homepage, instagram, blog, store, area, note) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING * ';
  for(var i = 1; i<responseArray.length; i++){
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
        responseArray[i][16],
      ];
      const { rows } = await client2.query(
        `
                INSERT INTO shop 
                (id, shop_name, subway, road_address, land_address, time, close, phone, homepage, instagram, blog, store, area, note)
                VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING *
                `,
        values,
      );
      console.log(rows);
  }
    */

  /*
  //<shop_category 테이블 채우는 코드>
    const sql2 = `
        INSERT INTO shop_category 
        (shop_id, category_id)
        VALUES
        ($1, $2)
        RETURNING *
    `;

    for(var j = 1; j<responseArray.length; j++){
        let str = responseArray[j][2];
        let split_str = str.split(",");
        let category_id;
        for(var i = 0; i<split_str.length; i++){
            if(split_str[i] == "문구팬시"){
                category_id = 1;
            }
            else if(split_str[i] == "인테리어소품"){
                category_id = 2;
            }
            else if(split_str[i] == "주방용품"){
                category_id = 3;
            }
            else if(split_str[i] == "패션소품"){
                category_id = 4;
            }
            else if(split_str[i] == "공예품"){
                category_id = 5;
            }
            else if(split_str[i] == "인형장난감"){
                category_id = 6;
            }

        
            const { rows } = await client2.query(
                sql2,
                [responseArray[j][0], category_id]
            );
            
            console.log(rows);
        }
    }
    */

  /*
    //<shop_theme 테이블 채우는 코드>
    const sql3 = `
        INSERT INTO shop_theme 
        (shop_id, theme_id)
        VALUES
        ($1, $2)
        RETURNING *
    `;

    for(var k = 1; k<responseArray.length; k++){
        let str = responseArray[k][3];
        let split_str = str.split(",");
        let theme_id;
        for(var i = 0; i<split_str.length; i++){
            if(split_str[i] == "아기자기"){
                theme_id = 1;
            }
            else if(split_str[i] == "힙함"){
                theme_id = 2;
            }
            else if(split_str[i] == "모던"){
                theme_id = 3;
            }
            else if(split_str[i] == "빈티지"){
                theme_id = 4;
            }
            
            const { rows } = await client2.query(
                sql3,
                [responseArray[k][0], theme_id]
            );
            
            console.log(rows);
        }
    }
    */

  // 소품샵 대표 이미지 넣는 스크립트
  // 이미지 경로는 포스트맨으로 manage/upload에 해서 url 반환받음
  const cute = [
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/cute/20220119-091706-363-cute%20%281%29.jpeg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/cute/20220119-091706-371-cute%20%282%29.jpeg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/cute/20220119-091706-400-cute%20%283%29.jpeg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/cute/20220119-091706-406-cute%20%284%29.jpeg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/cute/20220119-091706-410-cute%20%285%29.jpeg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/cute/20220119-091706-414-cute%20%286%29.jpeg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/cute/20220119-091706-419-cute%20%287%29.jpeg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/cute/20220119-091706-424-cute%20%288%29.jpeg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/cute/20220119-091706-428-cute%20%289%29.jpeg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/cute/20220119-091706-431-cute%20%2810%29.jpeg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/cute/20220119-091706-437-cute%20%2811%29.jpeg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/cute/20220119-091706-440-cute%20%2812%29.jpeg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/cute/20220119-091706-444-cute%20%2813%29.jpeg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/cute/20220119-091706-447-cute%20%2814%29.jpeg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/cute/20220119-091706-453-cute%20%2815%29.jpeg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/cute/20220119-091706-456-cute%20%2816%29.jpeg',
  ];

  const hip = [
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/hip/20220119-092147-724-hip%20%281%29.png',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/hip/20220119-092147-732-hip%20%282%29.png',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/hip/20220119-092147-768-hip%20%283%29.png',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/hip/20220119-092147-777-hip%20%284%29.png',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/hip/20220119-092147-783-hip%20%285%29.png',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/hip/20220119-092147-793-hip%20%286%29.png',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/hip/20220119-092147-800-hip%20%287%29.png',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/hip/20220119-092147-807-hip%20%288%29.png',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/hip/20220119-092147-812-hip%20%289%29.png',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/hip/20220119-092147-818-hip%20%2810%29.png',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/hip/20220119-092147-826-hip%20%2811%29.png',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/hip/20220119-092147-836-hip%20%2812%29.png',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/hip/20220119-092147-844-hip%20%2813%29.png',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/hip/20220119-092147-851-hip%20%2814%29.png',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/hip/20220119-092147-860-hip%20%2815%29.png',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/hip/20220119-092147-872-hip%20%2816%29.png',
  ];
  const modern = [
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/modern/20220119-092439-579-modern%20%281%29.jpg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/modern/20220119-092439-586-modern%20%282%29.jpg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/modern/20220119-092439-617-modern%20%283%29.jpg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/modern/20220119-092439-624-modern%20%284%29.jpg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/modern/20220119-092439-630-modern%20%285%29.jpg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/modern/20220119-092439-636-modern%20%286%29.jpg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/modern/20220119-092439-641-modern%20%287%29.jpg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/modern/20220119-092439-646-modern%20%288%29.jpg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/modern/20220119-092439-652-modern%20%289%29.jpg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/modern/20220119-092439-658-modern%20%2810%29.jpg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/modern/20220119-092439-663-modern%20%2811%29.jpg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/modern/20220119-092439-670-modern%20%2812%29.jpg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/modern/20220119-092439-674-modern%20%2813%29.jpg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/modern/20220119-092439-679-modern%20%2814%29.jpg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/modern/20220119-092439-685-modern%20%2815%29.jpg',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/modern/20220119-092439-688-modern%20%2816%29.jpg',
  ];
  const vintage = [
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/vintage/20220119-092556-011-vintage%20%281%29.PNG',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/vintage/20220119-092556-017-vintage%20%282%29.PNG',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/vintage/20220119-092556-042-vintage%20%283%29.PNG',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/vintage/20220119-092556-048-vintage%20%284%29.PNG',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/vintage/20220119-092556-055-vintage%20%285%29.PNG',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/vintage/20220119-092556-059-vintage%20%286%29.PNG',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/vintage/20220119-092556-063-vintage%20%287%29.PNG',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/vintage/20220119-092556-068-vintage%20%288%29.PNG',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/vintage/20220119-092556-073-vintage%20%289%29.PNG',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/vintage/20220119-092556-076-vintage%20%2810%29.PNG',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/vintage/20220119-092556-081-vintage%20%2811%29.PNG',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/vintage/20220119-092556-087-vintage%20%2812%29.PNG',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/vintage/20220119-092556-091-vintage%20%2813%29.PNG',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/vintage/20220119-092556-095-vintage%20%2814%29.PNG',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/vintage/20220119-092556-099-vintage%20%2815%29.PNG',
    'https://sodam-bucket.s3.ap-northeast-2.amazonaws.com/theme/vintage/20220119-092556-105-vintage%20%2816%29.PNG',
  ];
  // 테마 배열 (2차원 배열)
  let theme = [cute, hip, modern, vintage];
  // 테마별 이미지 길이
  let imageThemeLen = [cute.length, hip.length, modern.length, vintage.length];

  // 현재 저장될 이미지 번호
  let imageThemeCount = [0, 0, 0, 0];

  const { rows: allShop } = await client2.query(
    `
    SELECT id
    FROM shop
    WHERE is_deleted = FALSE  
    `,
  );

  await Promise.all(
    allShop.map(async (shop) => {
      const shopId = shop.id;
      console.log(shopId);

      const { rows: theme_id } = await client2.query(
        `
        SELECT theme_id
        FROM shop_theme
        WHERE shop_id = $1
              AND is_deleted = FALSE

        `,
        [shopId],
      );

      const themeId = Number(theme_id[0].theme_id) - 1;

      // console.log(`themeID: ${themeId}`);
      // console.log(themeId);

      // console.log(`배열: ${imageThemeCount}`);

      const { rows: rows1 } = await client2.query(
        `
              INSERT INTO shop_image
              (shop_id, image, is_preview)
              VALUES
              ( $1 , $2, true);
      
                `,
        // 테마[현재테마][현재 저장될 이미지번호]
        [shopId, theme[themeId][imageThemeCount[themeId]]],
      );
      // 환형구조: 이미지번호가 이미지 개수만큼 커지면 다시 0부터 시작
      imageThemeCount[themeId] = (imageThemeCount[themeId] + 1) % imageThemeLen[themeId];

      const { rows: rows2 } = await client2.query(
        `
              INSERT INTO shop_image
              (shop_id, image, is_preview)
              VALUES
              ( $1 , $2, false);
      
                `,
        // 테마[현재테마][현재 저장될 이미지번호]
        [shopId, theme[themeId][imageThemeCount[themeId]]],
      );
      // 환형구조: 이미지번호가 이미지 개수만큼 커지면 다시 0부터 시작
      imageThemeCount[themeId] = (imageThemeCount[themeId] + 1) % imageThemeLen[themeId];

      const { rows: rows3 } = await client2.query(
        `
              INSERT INTO shop_image
              (shop_id, image, is_preview)
              VALUES
              ( $1 , $2, false);
      
                `,
        // 테마[현재테마][현재 저장될 이미지번호]
        [shopId, theme[themeId][imageThemeCount[themeId]]],
      );
      // 환형구조: 이미지번호가 이미지 개수만큼 커지면 다시 0부터 시작
      imageThemeCount[themeId] = (imageThemeCount[themeId] + 1) % imageThemeLen[themeId];

      const { rows: rows4 } = await client2.query(
        `
              INSERT INTO shop_image
              (shop_id, image, is_preview)
              VALUES
              ( $1 , $2, false);
      
                `,
        // 테마[현재테마][현재 저장될 이미지번호]
        [shopId, theme[themeId][imageThemeCount[themeId]]],
      );
      // 환형구조: 이미지번호가 이미지 개수만큼 커지면 다시 0부터 시작
      imageThemeCount[themeId] = (imageThemeCount[themeId] + 1) % imageThemeLen[themeId];
    }),
  );
  console.log('작업 종료');
  // // 모든 소품샵 테마 정보 가져오기
  // const { rows: allShopTheme } = await client2.query(
  //   `
  //   SELECT *
  //   FROM shop_theme
  //   WHERE is_deleted = FALSE
  //       ORDER BY shop_id

  //     `,
  // );

  // // 대표이미지만 처리하는 코드 (사용 안 함)
  // // 이미 처리한 적이 있는 소품샵 id인지 확인용도
  // let beforeShopId = 0;
  // await Promise.all(
  //   allShopTheme.map(async (item) => {
  //     const shopId = item.shop_id;
  //     // 인덱스로 처리하기 때문에 -1이 붙음
  //     let themeId = Number(item.theme_id) - 1;

  //     // 방금전에 처리한 shopId와 다르다면
  //     if (beforeShopId !== shopId) {
  //       const { rows } = await client2.query(
  //         `
  //       INSERT INTO shop_image
  //       (id, shop_id, image, is_preview)
  //       VALUES
  //       ( $1 , $2, $3, true);

  //         `,
  //         // 테마[현재테마][현재 저장될 이미지번호]
  //         [shopId, shopId, theme[themeId][imageThemeCount[themeId]]],
  //       );
  //       // 환형구조: 이미지번호가 이미지 개수만큼 커지면 다시 0부터 시작
  //       imageThemeCount[themeId] = (imageThemeCount[themeId] + 1) % imageThemeLen[themeId];
  //     }
  //     beforeShopId = shopId;
  //   }),
  // );

  // // 대표이미지 1장, 일반 이미지 3장 넣는 코드
  // // 이미 처리한 적이 있는 소품샵 id인지 확인용도
  // let beforeShopId = 0;
  // await Promise.all(
  //   allShopTheme.map(async (item) => {
  //     const shopId = item.shop_id;
  //     // 인덱스로 처리하기 때문에 -1이 붙음
  //     let themeId = Number(item.theme_id) - 1;

  //     imageName = [];
  //     for (let i = 0; i < 3; i++) {
  //       imageName.push(theme[themeId][imageThemeCount[themeId]]);
  //       imageThemeCount[themeId] = (imageThemeCount[themeId] + 1) % imageThemeLen[themeId];
  //     }
  //     // console.log(imageName);

  //     // // 방금전에 처리한 shopId와 다르다면
  //     if (beforeShopId !== shopId) {
  //       await Promise.all(
  //         imageName.map(async (image) => {
  //           const { rows } = await client2.query(
  //             `
  //       INSERT INTO shop_image
  //       (shop_id, image, is_preview)
  //       VALUES
  //       ( $1 , $2, false);

  //         `,
  //             // 테마[현재테마][현재 저장될 이미지번호]
  //             [shopId, theme[themeId][imageThemeCount[themeId]]],
  //           );
  //         }),
  //       );
  //     }

  //     beforeShopId = shopId;
  //   }),
  // );
}
