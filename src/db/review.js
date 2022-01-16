// const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getReviewByShopIdOrderByLike = async (client, shopId, limit, offset) => {
  const { rows } = await client.query(
    `
    SELECT  r.id AS review_id, r.shop_id, ri.image, u.image AS writer_thumbnail, u.nickname AS writer_name, r.like_count, r.scrap_count, r.content
    FROM (SELECT r.id, r.shop_id, r.user_id, r.content, r.like_count, r.scrap_count
        FROM review r
        WHERE r.shop_id = $1
        AND r.is_deleted = FALSE) AS r
    INNER JOIN "user" u
    ON r.user_id = u.id
    INNER JOIN (SELECT ri.image, ri.review_id
        FROM review_image ri
        WHERE ri.is_preview = TRUE
        AND ri.is_deleted = FALSE) AS ri
    ON r.id = ri.review_id
    
    ORDER BY r.like_count DESC, r.scrap_count DESC , r.id
    LIMIT $2
    OFFSET $3
        `,
    [shopId, limit, offset],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getReviewByShopIdOrderByScrap = async (client, shopId, limit, offset) => {
  const { rows } = await client.query(
    `
    SELECT  r.id AS review_id, r.shop_id, ri.image, u.image AS writer_thumbnail, u.nickname AS writer_name, r.like_count, r.scrap_count, r.content
    FROM (SELECT r.id, r.shop_id, r.user_id, r.content, r.like_count, r.scrap_count
        FROM review r
        WHERE r.shop_id = $1
        AND r.is_deleted = FALSE) AS r
    INNER JOIN "user" u
    ON r.user_id = u.id
    INNER JOIN (SELECT ri.image, ri.review_id
        FROM review_image ri
        WHERE ri.is_preview = TRUE
        AND ri.is_deleted = FALSE) AS ri
    ON r.id = ri.review_id
    
    ORDER BY r.scrap_count DESC, r.like_count DESC , r.id
    LIMIT $2
    OFFSET $3
          `,
    [shopId, limit, offset],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getReviewByShopIdOrderByRecent = async (client, shopId, limit, offset) => {
  const { rows } = await client.query(
    `
    SELECT  r.id AS review_id, r.shop_id, ri.image, u.image AS writer_thumbnail, u.nickname AS writer_name, r.like_count, r.scrap_count, r.content
    FROM (SELECT r.id, r.shop_id, r.user_id, r.content, r.like_count, r.scrap_count, r.created_at
        FROM review r
        WHERE r.shop_id = $1
        AND r.is_deleted = FALSE) AS r
    INNER JOIN "user" u
    ON r.user_id = u.id
    INNER JOIN (SELECT ri.image, ri.review_id
        FROM review_image ri
        WHERE ri.is_preview = TRUE
        AND ri.is_deleted = FALSE) AS ri
    ON r.id = ri.review_id
    
    ORDER BY r.created_at , r.scrap_count DESC , r.id
    LIMIT $2
    OFFSET $3
          `,
    [shopId, limit, offset],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};
module.exports = { getReviewByShopIdOrderByLike, getReviewByShopIdOrderByScrap, getReviewByShopIdOrderByRecent };
