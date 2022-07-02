const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getReviewCountByShopId = async (client, shopId) => {
  const { rows } = await client.query(
    `
      SELECT s.review_count
      FROM shop s
      WHERE s.id = $1
    `,
    [shopId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getShopCounts = async (client) => {
  const { rows } = await client.query(
    `
      SELECT COUNT(*) FROM shop;
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};
const getShopByArea = async (client, area, sort) => {
  let sortQuery = '';
  if (sort === 'popular') {
    sortQuery = `ORDER BY s.bookmark_count DESC`;
  }

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
          SELECT s.id as shop_id, s.shop_name
          FROM shop s 
          INNER JOIN shop_theme st
          ON s.id = st.shop_id
          INNER JOIN theme t
          ON st.theme_id = t.id
          WHERE t.name = $1
              AND s.is_deleted = FALSE
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
        SELECT si.image, si.shop_id
        FROM shop_image si
        WHERE si.shop_id = $1
            AND si.is_preview = true
            AND si.is_deleted = FALSE
        `,
    [shopId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getBookmarkedShopIdByUserIdAndArea = async (client, area, userId) => {
  const { rows } = await client.query(
    `
            SELECT s.id as shop_id
            FROM shop s 
            INNER JOIN shop_bookmark sb
            ON s.id = sb.shop_id
            WHERE s.area = $1
                AND sb.user_id = $2
                AND s.is_deleted = FALSE
                AND sb.is_deleted = FALSE
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

const getCategoryAndIdByShopId = async (client, shopId) => {
  const { rows } = await client.query(
    `
    SELECT t.name, c.shop_id
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

const getShopByName = async (client, shopName) => {
  const { rows } = await client.query(
    `
      SELECT s.id as shop_id, s.shop_name, c.name as category
      FROM shop s
      INNER JOIN shop_category sc
      ON s.id = sc.shop_id
      INNER JOIN category c
      ON sc.category_id = c.id
      WHERE s.shop_name LIKE upper('%' || $1 || '%')
    `,
    [shopName],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getShopByShopId = async (client, shopId) => {
  const { rows } = await client.query(
    `
      SELECT id AS shop_id, shop_name, subway, road_address, land_address, time, close, phone, homepage, instagram, blog, store, area, bookmark_count, review_count, created_at, updated_at
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

const getShopByBookmarkCounts = async (client, count) => {
  const { rows } = await client.query(
    `
    SELECT s2.id as shop_id, s2.shop_name, c.name as category
    FROM (
        SELECT * FROM shop s
        ORDER BY s.bookmark_count DESC
        LIMIT $1
      ) AS s2
    INNER JOIN shop_category sc
    ON s2.id = sc.shop_id
    INNER JOIN category c
    ON sc.category_id = c.id
    WHERE
      s2.is_deleted = FALSE
      AND sc.is_deleted = FALSE
    `,
    [count],
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
    SELECT s.id as shop_id, s.shop_name
    FROM shop s 
    INNER JOIN shop_bookmark sb
    ON s.id = sb.shop_id
    WHERE sb.user_id = $1
        AND s.is_deleted = FALSE
        AND sb.is_deleted = FALSE
        ${sortQuery}
        OFFSET ${offset} LIMIT ${limit}
              `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getShopIdByCategory = async (client, type) => {
  let categoryQuery = '';
  switch (type) {
    case '문구팬시':
      categoryQuery = `c.name = '문구팬시'`;
      break;
    case '인테리어소품':
      categoryQuery = `c.name = '인테리어소품'`;
      break;
    case '주방용품':
      categoryQuery = `c.name = '주방용품'`;
      break;
    case '패션소품':
      categoryQuery = `c.name = '패션소품'`;
      break;
    case '공예품':
      categoryQuery = `c.name = '공예품'`;
      break;
    case '인형장난감':
      categoryQuery = `c.name = '인형장난감'`;
      break;
  }
  const { rows } = await client.query(
    `
    SELECT s.id as shop_id
    FROM shop s 
    INNER JOIN shop_category sc
    ON s.id = sc.shop_id
    INNER JOIN category c
    ON sc.category_id = c.id
    WHERE s.is_deleted = FALSE
        AND sc.is_deleted = FALSE
        AND ${categoryQuery}
    LIMIT 20
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getShopListByShopId = async (client, shopId) => {
  const { rows } = await client.query(
    `
          SELECT s.id as shop_id, s.shop_name, c.name as category
          FROM shop s 
          INNER JOIN shop_category sc
          ON s.id = sc.shop_id
          INNER JOIN category c
          ON sc.category_id = c.id
          WHERE s.id = $1
              AND s.is_deleted = FALSE
              AND sc.is_deleted = FALSE
          `,
    [shopId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

// 지하철역에 해당하는 샵 정보 limit개 얻기
// id가 shopId인 소품샵 제외
const getShopBySubwayNotShopIdLimit = async (client, subway, shopId, limit) => {
  const { rows } = await client.query(
    `
    SELECT s.id AS shop_id, s.shop_name
    FROM shop s
    WHERE s.subway = $1
    AND s.is_deleted = FALSE
    AND s.id != $2
    ORDER BY s.bookmark_count DESC, s.id
    LIMIT $3;
              `,
    [subway, shopId, limit],
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

const updateReviewCount = async (client, shopId, reviewCount) => {
  const { rows } = await client.query(
    `
          UPDATE shop
          SET review_count = $1
          WHERE  id = $2
          RETURNING review_count
            `,
    [reviewCount, shopId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getAllShop = async (client, sort, offset, limit) => {
  let sortQuery = '';
  switch (sort) {
    case 'recent':
      sortQuery = `ORDER BY s.created_at DESC`;
      break;
    case 'alphabet':
      sortQuery = `ORDER BY s.shop_name collate "ko_KR.utf8"`;
      break;
    default:
      sortQuery = `ORDER BY s.shop_name collate "ko_KR.utf8"`;
  }

  const { rows } = await client.query(
    `
          SELECT s.id as shop_id, s.shop_name
          FROM shop s 
          WHERE s.is_deleted = FALSE
          ${sortQuery}
          OFFSET $1 LIMIT $2
          `,
    [offset, limit],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getShopCategoryCount = async (client) => {
  const { rows } = await client.query(
    `
    SELECT c.name , COUNT(*) 
    FROM shop_category  sc
    INNER JOIN category c
    ON sc.category_id = c.id
    GROUP BY c.name
          `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getShopThemeCount = async (client) => {
  const { rows } = await client.query(
    `
    SELECT t.name , COUNT(*) 
    FROM shop_theme  st
    INNER JOIN theme t
    ON st.theme_id = t.id
    GROUP BY t.name
          `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getShopAreaCount = async (client) => {
  const { rows } = await client.query(
    `
    SELECT s.area as name , COUNT(*)
    FROM shop s
    GROUP BY s.area
          `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getAllShopNameAndShopId = async (client) => {
  const { rows } = await client.query(
    `
      SELECT s.id as shop_id, s.shop_name, s.land_address, s.area
      FROM shop s
      ORDER BY s.id ASC
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const insertShopImage = async (client, shopId, image, isPreview) => {
  const { rows: existingRows } = await client.query(
    `
          SELECT *
          FROM image_test_table_2 it
          WHERE it.shop_id = $1
              AND it.image= $2
              AND it.is_preview= $3
              AND it.is_deleted= FALSE
          `,
    [shopId, image, isPreview],
  );
  if (existingRows.length === 0) {
    console.log('>>> making new');
    const { rows } = await client.query(
      `
      INSERT INTO image_test_table_2
      (shop_id, image, is_preview)
      VALUES
      ($1, $2, $3 )
      RETURNING *
      `,
      [shopId, image, isPreview],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } else {
    console.log('>>> updating');
    const { rows } = await client.query(
      `
      UPDATE image_test_table_2
      SET image = $2, is_preview = $3
      WHERE shop_id = $1
      RETURNING *
      `,
      [shopId, image, isPreview],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  }
};

const insertNewShopData = async(client, shopName, subway, roadAddress, landAddress, time, closeDay, phone, homepage, instagram, blog, store, area) => {
  const {rows} = await client.query(
    `
    INSERT INTO shop
    (shop_name, subway, road_address, land_address, time, close, phone, homepage, instagram, blog, store, area)
    VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
    `,
    [shopName, subway, roadAddress, landAddress, time, closeDay, phone, homepage, instagram, blog, store, area]
  );
  return convertSnakeToCamel.keysToCamel(rows);
}

const insertShopTheme = async(client, shopId, theme) =>{
  const {rows} = await client.query(
    `
    INSERT INTO shop_theme
    (shop_id, theme_id)
    VALUES
    ($1, $2)
    `,
    [shopId, theme]
  );
  return convertSnakeToCamel.keysToCamel(rows);
}

const insertShopCategory = async(client, shopId, category) => {
  const {rows} = await client.query(
    `
    INSERT INTO shop_category
    (shop_id, category_id)
    VALUES
    ($1, $2)
    `,
    [shopId, category]
  );
  return convertSnakeToCamel.keysToCamel(rows);
}

module.exports = {
  getReviewCountByShopId,
  getShopCounts,
  getShopByArea,
  getShopByTheme,
  getPreviewImageByShopId,
  getBookmarkedShopIdByUserIdAndArea,
  getCategoryByShopId,
  getThemeByShopId,
  getImageByShopId,
  getShopByName,
  getShopByShopId,
  getShopBookmarkByUserId,
  getSavedShopList,
  getShopIdByCategory,
  getShopListByShopId,
  getShopBySubwayNotShopIdLimit,
  getBookmarkByShopIdAndUserId,
  createBookmarkByShopIdAndUserId,
  updateBookmarkByShopIdAndUserId,
  updateBookmarkCountByShopId,
  updateReviewCount,
  getShopByBookmarkCounts,
  getCategoryAndIdByShopId,
  getAllShop,
  getShopCategoryCount,
  getShopThemeCount,
  getShopAreaCount,
  getAllShopNameAndShopId,
  insertShopImage,
  insertNewShopData,
  insertShopTheme,
  insertShopCategory,
};