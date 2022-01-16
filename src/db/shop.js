const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getShopByArea = async (client, area, sort) => {
  let sortQuery = '';
  if (sort === 'popular') {
    sortQuery = `ORDER BY s.bookmark_count DESC`;
  }
  // mysave sort 추가적으로 구현해야함.
  const { rows } = await client.query(
    `
        SELECT s.id as shop_id, s.shop_name, c.name as category, s.road_address, s.land_address, s.review_count, s.time
        FROM shop s 
        INNER JOIN shop_category sc
        ON s.id = sc.shop_id
        INNER JOIN category c
        ON sc.category_id = c.id
        WHERE s.area = $1
            AND s.is_deleted = FALSE
            AND sc.is_deleted = FALSE
         ${sortQuery}
        `,
    [area],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getShopByTheme = async (client, theme, sort, offset, limit) => {
  let sortQuery = '';
  switch (sort) {
    case 'review':
      sortQuery = `ORDER BY s.review_count DESC`;
      break;
    case 'popular':
      sortQuery = `ORDER BY s.bookmark_count DESC`;
      break;
    default:
      sortQuery = `ORDER BY s.bookmark_count DESC`;
  }

  const { rows } = await client.query(
    `
          SELECT s.id as shop_id, s.shop_name, c.name as category
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
              AND sc.is_deleted = FALSE
              AND st.is_deleted = FALSE
          ${sortQuery}
          OFFSET ${offset} LIMIT ${limit}
          `,
    [theme],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getPreviewImageByShopId = async (client, shopId) => {
  const { rows } = await client.query(
    `
        SELECT si.image si.shop_id as shopId
        FROM shop_image si
        WHERE si.shop_id = $1
            AND is_preview = true
            AND si.is_deleted = FALSE
        `,
    [shopId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getBookmarkedShopIdByUserIdAndArea = async (client, area, userId) => {
  const { rows } = await client.query(
    `
            SELECT s.id as shop_id,
            FROM shop s 
            INNER JOIN shop_bookmark sb
            ON s.id = sb.shop_id
            WHERE s.area = $1
                AND sb.user_id = $2
                AND s.is_deleted = FALSE
            `,
    [area, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

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
            ORDER BY s.is_preview DESC
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

const getSavedShopList = async (client, sort, userId, offset, limit) => {
  let sortQuery = '';
  switch (sort) {
    case 'save':
      sortQuery = `ORDER BY s.bookmark_count DESC`;
      break;
    case 'recent':
      sortQuery = `ORDER BY s.created_at DESC`;
      break;
    case 'review':
      sortQuery = `ORDER BY s.review_count DESC`;
      break;
    default:
      sortQuery = `ORDER BY s.bookmark_count DESC`;
  }
  const { rows } = await client.query(
    `
    SELECT s.id as shop_id, s.shop_name, c.name as category
    FROM shop s 
    INNER JOIN shop_category sc
    ON s.id = sc.shop_id
    INNER JOIN category c
    ON sc.category_id = c.id
    INNER JOIN shop_bookmark sb
    ON s.id = sb.shop_id
    WHERE sb.user_id = $1
        AND s.is_deleted = FALSE
        AND sc.is_deleted = FALSE
        AND sb.is_deleted = FALSE
        ${sortQuery}
        OFFSET ${offset} LIMIT ${limit}
              `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getBookmarkByShopIdAndUserId = async (client, shopId, userId) => {
  const { rows } = await client.query(
    `
    SELECT id AS bookmark_id, is_deleted
    FROM shop_bookmark sb
    WHERE sb.shop_id = $1
    AND sb.user_id = $2
              `,
    [shopId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const createBookmarkByShopIdAndUserId = async (client, shopId, userId, isDeleted = false) => {
  const { rows } = await client.query(
    `
    INSERT INTO shop_bookmark
    (shop_id, user_id, is_deleted)
    VALUES
    ($1, $2, $3)
    RETURNING id AS bookmark_id, shop_id, user_id, is_deleted
              `,
    [shopId, userId, isDeleted],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

// updatedIsDeleted: is_deleted가 이 값으로 업데이트됨
const updateBookmarkByShopIdAndUserId = async (client, updatedIsDeleted, shopId, userId) => {
  const { rows } = await client.query(
    `
    UPDATE shop_bookmark
    SET is_deleted = $1, updated_at = now()
    WHERE shop_id = $2
    AND user_id = $3
    RETURNING id AS bookmark_id, shop_id, user_id, is_deleted
              `,
    [updatedIsDeleted, shopId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const updateBookmarkCountByShopId = async (client, bookmarkCount, shopId) => {
  const { rows } = await client.query(
    `
    UPDATE shop
    SET bookmark_count = $1, updated_at = now()
    WHERE id = $2
    RETURNING bookmark_count
              `,
    [bookmarkCount, shopId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = {
  getShopByArea,
  getShopByTheme,
  getPreviewImageByShopId,
  getBookmarkedShopIdByUserIdAndArea,
  getCategoryByShopId,
  getThemeByShopId,
  getImageByShopId,
  getShopByShopId,
  getShopBookmarkByUserId,
  getSavedShopList,
  getBookmarkByShopIdAndUserId,
  createBookmarkByShopIdAndUserId,
  updateBookmarkByShopIdAndUserId,
  updateBookmarkCountByShopId,
};
