const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getShopByArea = async (client, area) => {
  const { rows } = await client.query(
    `
        SELECT DISTINCT s.id as shop_id, s.shop_name, c.name as category
        FROM shop s 
        INNER JOIN shop_category sc
        ON s.id = sc.shop_id
        INNER JOIN category c
        ON sc.category_id = c.id
        WHERE s.area = $1
            AND s.is_deleted = FALSE
        `,
    [area],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getShopByTheme = async (client, theme) => {
  const { rows } = await client.query(
    `
          SELECT DISTINCT s.id as shop_id, s.shop_name, c.name as category
          FROM shop s 
          INNER JOIN shop_category sc
          ON s.id = sc.shop_id
          INNER JOIN category c
          ON sc.category_id = c.id
          INNER JOIN shop_theme st
          ON s.id = st.shop_id
          INNER JOIN theme t
          ON st.theme_id = t.id
          WHERE t.name = $1
              AND s.is_deleted = FALSE
          `,
    [theme],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getImageByShopId = async (client, shopId) => {
  const { rows } = await client.query(
    `
        SELECT DISTINT si.image si.shop_id as shopId
        FROM shop_image si
        WHERE si.shop_id = $1
            AND is_preview = true
        `,
    [shopId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getShopByArea, getShopByTheme, getImageByShopId };
