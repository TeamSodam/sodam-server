const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getCategoryByShopId = async (client, shopId) => {
  const { rows } = await client.query(
    `
    SELECT "name"
    FROM shop_category c
    JOIN category t
    ON c.category_id = t.id
    WHERE c.shop_id = $1
        AND c.is_deleted = FALSE
          `,
    [shopId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getThemeByShopId = async (client, shopId) => {
  const { rows } = await client.query(
    `
    SELECT "name"
    FROM shop_theme st
    JOIN theme t
    ON st.theme_id = t.id
    WHERE st.shop_id = $1
        AND st.is_deleted = FALSE 
            `,
    [shopId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getImageByShopId = async (client, shopId) => {
  const { rows } = await client.query(
    // order by -> 대표 이미지를 가장 앞에 두기 (true이면 앞에 옴)
    `
            SELECT image
            FROM shop_image s
            WHERE s.shop_id = $1
                AND s.is_deleted = FALSE
            ORDER BY s.is_preview desc
            `,
    [shopId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getShopByShopId = async (client, shopId) => {
  const { rows } = await client.query(
    `
              SELECT *
              FROM shop s
              WHERE s.id = $1
                AND s.is_deleted = FALSE
              `,
    [shopId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getShopBookmarkByUserId = async (client, shopId, userId) => {
  const { rows } = await client.query(
    `
              SELECT id
              FROM shop_bookmark sb
              WHERE sb.shop_id = $1
                AND sb.user_id = $2
                AND sb.is_deleted = FALSE
              `,
    [shopId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getCategoryByShopId, getThemeByShopId, getImageByShopId, getShopByShopId, getShopBookmarkByUserId };
