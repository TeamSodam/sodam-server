const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getShopByArea = async (client, area) => {
  const { rows } = await client.query(
    `
        SELECT DISTINCT s.id, s.shop_name, c.name, si.image
        FROM shop s 
        INNER JOIN shop_category sc
        ON s.id = sc.shop_id
        INNER JOIN category c
        ON sc.category_id = c.id
        INNER JOIN shop_image si
        ON s.id = si.shop_id
        WHERE s.area = $1
            AND si.is_preview = TRUE
            AND s.is_deleted = FALSE
        `,
    [area],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getShopByTheme = async (client, theme) => {
  const { rows } = await client.query(
    `
          SELECT DISTINCT s.id, s.shop_name, c.name, si.image
          FROM shop s 
          INNER JOIN shop_category sc
          ON s.id = sc.shop_id
          INNER JOIN category c
          ON sc.category_id = c.id
          INNER JOIN shop_theme st
          ON s.id = st.shop_id
          INNER JOIN theme t
          ON st.theme_id = t.id
          INNER JOIN shop_image si
          ON s.id = si.shop_id
          WHERE t.name = $1
              AND si.is_preview = TRUE
              AND s.is_deleted = FALSE
          `,
    [theme],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getShopByArea, getShopByTheme };
