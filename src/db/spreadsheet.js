const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const postShopSheet = async (client, shopId, shopName, subway, roadAddress, landAddress, time, closeDay, phone, homepage, instagram, blog, store, area, note) => {
  const { rows } = await client.query(
    `
            INSERT INTO shop 
            (id, shop_name, subway, road_address, land_address, time, close, phone, homepage, instagram, blog, store, area, note)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
            `,
    [shopId, shopName, subway, roadAddress, landAddress, time, closeDay, phone, homepage, instagram, blog, store, area, note],
  );
  console.log(rows);
  return convertSnakeToCamel.keysToCamel(rows);
};
const insertUserData = async (client, user_id, name, email, nickname, image, password, preference_theme) => {
  const { rows } = await client.query(
    `
    INSERT INTO "user"
    (id, name, email, nickname, image, password, preference_theme)
    VALUES
    ($1, $2, $3, $4, $5, $6,$7 )
    RETURNING *
    `,
    [user_id, name, email, nickname, image, password, preference_theme],
  );
  console.log('rows', rows);
};

const inserttagData = async (client, id, name) => {
  const { rows } = await client.query(
    `
    INSERT INTO tag
    (id, name)
    VALUES
    ($1, $2)
    RETURNING *
    `,
    [id, name],
  );
  console.log('rows', rows);
};

const insertReviewData = async (client, id, shop_id, user_id, content) => {
  const { rows } = await client.query(
    `
    INSERT INTO review
    (id, shop_id, user_id, content)
    VALUES
    ($1, $2, $3, $4)
    RETURNING *
    `,
    [id, shop_id, user_id, content],
  );
  console.log('rows', rows);
};
const insertReviewTagData = async (client, id, review_id, tag_id) => {
  const { rows } = await client.query(
    `
    INSERT INTO review_tag
    (id, review_id, tag_id)
    VALUES
    ($1, $2, $3)
    RETURNING *
    `,
    [id, review_id, tag_id],
  );
  console.log('rows', rows);
};
const insertReviewItemData = async (client, id, review_id, price, item_name) => {
  const { rows } = await client.query(
    `
    INSERT INTO review_item
    (id, review_id, price, item_name)
    VALUES
    ($1, $2, $3, $4)
    RETURNING *
    `,
    [id, review_id, price, item_name],
  );
  console.log('rows', rows);
};

const insertReviewImageData = async (client, id, review_id, image, is_preview) => {
  const { rows } = await client.query(
    `
    INSERT INTO review_image
    (id, review_id, image, is_preview)
    VALUES
    ($1, $2, $3, $4)
    RETURNING *
    `,
    [id, review_id, image, is_preview],
  );
  console.log('rows', rows);
};

const insertShopImageData = async (client, shop_id, image, is_preview) => {
  const { rows } = await client.query(
    `
    INSERT INTO shop_image
    (shop_id, image, is_preview)
    VALUES
    ($1, $2, $3)
    RETURNING *
    `,
    [shop_id, image, is_preview],
  );
  console.log('rows', rows);
};

const updateShopReviewCount = async (client, shopId, reviewCount) => {
  // 나중에 소품샵 테이블의 리뷰카운트 올리는 로직 필요하면 추가
};
module.exports = {
  postShopSheet,
  insertUserData,
  inserttagData,
  insertReviewData,
  insertReviewTagData,
  insertReviewItemData,
  insertReviewImageData,
  updateShopReviewCount,
  insertShopImageData,
};
