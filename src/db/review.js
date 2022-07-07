const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getReviewByReviewId = async (client, reviewId) => {
  const { rows } = await client.query(
    `
        SELECT r.id AS review_id, r.shop_id, r.like_count, r.scrap_count, r.content, r.created_at AS date, r.user_id
        FROM review r
        WHERE r.id = $1
        AND is_deleted = FALSE
        `,
    [reviewId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getLikeCountByReviewId = async (client, reviewId) => {
  const { rows } = await client.query(
    `
        SELECT r.like_count
        FROM review r
        WHERE r.id = $1
        `,
    [reviewId],
  );
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>rows', rows);
  return convertSnakeToCamel.keysToCamel(rows);
};

const getScrapCountByReviewId = async (client, reviewId) => {
  const { rows } = await client.query(
    `
        SELECT r.scrap_count
        FROM review r
        WHERE r.id = $1
        `,
    [reviewId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getCurrentLikeStatusByReviewIdAndUserId = async (client, reviewId, userId) => {
  const { rows } = await client.query(
    `
          SELECT rl.is_deleted
          FROM review_like rl
          WHERE rl.review_id = $1
            AND rl.user_id = $2
          `,
    [reviewId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getCurrentScrapStatusByReviewIdAndUserId = async (client, reviewId, userId) => {
  const { rows } = await client.query(
    `
            SELECT rc.is_deleted
            FROM review_scrap rc
            WHERE rc.review_id = $1
              AND rc.user_id = $2
            `,
    [reviewId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const postReviewLikeByReviewId = async (client, userId, reviewId, isLiked) => {
  const isDeleted = !isLiked;
  const { rows: existingRows } = await client.query(
    `
          SELECT *
          FROM review_like rl
          WHERE rl.user_id = $1
              AND rl.review_id = $2
          `,
    [userId, reviewId],
  );
  if (existingRows.length === 0) {
    console.log('>>> making new');
    const { rows } = await client.query(
      `
        INSERT INTO review_like
        (user_id, review_id, is_deleted)
        VALUES
        ($1, $2, $3)
        RETURNING is_deleted
        `,
      [userId, reviewId, isDeleted],
    );
    console.log(rows);
    return convertSnakeToCamel.keysToCamel(rows);
  } else {
    console.log('>>> updating');
    const { rows } = await client.query(
      `
        UPDATE review_like
        SET is_deleted = $3
        WHERE user_id = $1
            AND review_id = $2
        RETURNING is_deleted
        `,
      [userId, reviewId, isDeleted],
    );
    console.log(rows);
    return convertSnakeToCamel.keysToCamel(rows);
  }
};

const postReviewScrapByReviewId = async (client, userId, reviewId, isScraped) => {
  const isDeleted = !isScraped;
  const { rows: existingRows } = await client.query(
    `
            SELECT *
            FROM review_scrap rs
            WHERE rs.user_id = $1
                AND rs.review_id = $2
            `,
    [userId, reviewId],
  );
  if (existingRows.length === 0) {
    console.log('>>> making new');
    const { rows } = await client.query(
      `
          INSERT INTO review_scrap
          (user_id, review_id, is_deleted)
          VALUES
          ($1, $2, $3)
          RETURNING is_deleted
          `,
      [userId, reviewId, isDeleted],
    );
    console.log(rows);
    return convertSnakeToCamel.keysToCamel(rows);
  } else {
    console.log('>>> updating');
    const { rows } = await client.query(
      `
          UPDATE review_scrap
          SET is_deleted = $3
          WHERE user_id = $1
              AND review_id = $2
          RETURNING is_deleted
          `,
      [userId, reviewId, isDeleted],
    );
    console.log(rows);
    return convertSnakeToCamel.keysToCamel(rows);
  }
};

const updateReviewLikeCount = async (client, reviewId, likeCount) => {
  const { rows } = await client.query(
    `
        UPDATE review
        SET like_count = $1
        WHERE  id = $2
        RETURNING like_count
          `,
    [likeCount, reviewId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const updateReviewScrapCount = async (client, reviewId, scrapCount) => {
  const { rows } = await client.query(
    `
          UPDATE review
          SET scrap_count = $1
          WHERE  id = $2
          RETURNING scrap_count
            `,
    [scrapCount, reviewId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};
const getReviewScrapByUserId = async (client, reviewId, userId) => {
  const { rows } = await client.query(
    `
              SELECT id
              FROM review_scrap rs
              WHERE rs.review_id = $1
                AND rs.user_id = $2
                AND rs.is_deleted = FALSE
              `,
    [reviewId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getScrapedReviewByUserId = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT r.id AS review_id, ri.image, r.shop_id, s.shop_name, u.image AS writer_thumbnail, u.nickname AS writer_name, r.like_count, r.scrap_count, r.content, c.name as category
    FROM review r
    INNER JOIN review_image ri
    ON r.id = ri.review_id AND ri.is_preview = TRUE
    INNER JOIN shop s
    on s.id = r.shop_id
    INNER JOIN shop_category sc
    ON s.id = sc.shop_id
    INNER JOIN category c
    ON sc.category_id = c.id
    INNER JOIN "user" u
    ON u.id = r.user_id
    INNER JOIN review_scrap rs
    ON r.id = rs.review_id

    WHERE rs.user_id = $1 AND rs.is_deleted = FALSE AND r.is_deleted = FALSE
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};
const getReviewByShopIdOrderBySort = async (client, shopId, limit, offset, sort) => {
  let order = 'like_count';
  if (sort === 'save') {
    order = 'scrap_count';
  } else if (sort === 'recent') {
    order = 'created_at';
  }

  // order by id DESC: 중복값인 경우 최신 리뷰를 먼저 보여주기 위함
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

    ORDER BY r.${order} DESC, r.id DESC
    LIMIT $2
    OFFSET $3
          `,
    [shopId, limit, offset],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getReviewLikeByUserId = async (client, reviewId, userId) => {
  const { rows } = await client.query(
    `
              SELECT rl.review_id
              FROM review_like rl
              WHERE rl.review_id = $1
                AND rl.user_id = $2
                AND rl.is_deleted = FALSE
              `,
    [reviewId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getReviewWriterByUserId = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT u.nickname as writer_name, u.image as writer_thumbnail
    FROM "user" u
    WHERE u.id = $1
    AND u.is_deleted = FALSE
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getReviewImagesByReviewId = async (client, reviewId) => {
  const { rows } = await client.query(
    `
    SELECT ri.image
    FROM review_image ri
    WHERE ri.review_id = $1
    AND ri.is_deleted = FALSE
    `,
    [reviewId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getPreviewImageByReviewId = async (client, reviewId) => {
  const { rows } = await client.query(
    `
    SELECT ri.image, ri.review_id as reviewId
    FROM review_image ri
    WHERE ri.review_id = $1
      AND ri.is_preview = TRUE
      AND ri.is_deleted = FALSE
    `,
    [reviewId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getReviewItemByReviewId = async (client, reviewId) => {
  const { rows } = await client.query(
    `
    SELECT rtm.item_name, rtm.price
    FROM review_item rtm
    WHERE rtm.review_id = $1
    AND rtm.is_deleted = FALSE
    `,
    [reviewId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getReviewTagByReviewId = async (client, reviewId) => {
  const { rows } = await client.query(
    `
    SELECT t.name
    FROM review_tag rt
    INNER JOIN tag t
    ON rt.tag_id = t.id
    WHERE rt.review_id = $1
    AND rt.is_deleted = FALSE
    `,
    [reviewId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getReviewOrderByRecent = async (client, limit) => {
  const { rows } = await client.query(
    `
    SELECT r2.id AS review_id, r2.shop_id, s.shop_name, u.image AS writer_thumbnail, u.nickname AS writer_name, r2.like_count, r2.scrap_count, r2.content, c.name as category
    FROM (
            SELECT *
            FROM review r
            WHERE r.is_deleted = false
            ORDER BY r.created_at DESC
            LIMIT $1
    ) AS r2
    INNER JOIN shop s
    on s.id = r2.shop_id
    INNER JOIN shop_category sc
    ON s.id = sc.shop_id
    INNER JOIN category c
    ON sc.category_id = c.id
    INNER JOIN "user" u
    ON u.id = r2.user_id
    ORDER BY r2.created_at DESC
    `,
    [limit]
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const createReview = async (client, shopId, userId, content) => {
  const { rows } = await client.query(
    `
    INSERT INTO review
    (shop_id, user_id, content)
    VALUES
    ($1, $2, $3)
    RETURNING *
    `,
    [shopId, userId, content],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const createReviewImage = async (client, reviewId, image, isPreview = false) => {
  const { rows } = await client.query(
    `
    INSERT INTO review_image
    (review_id, image, is_preview)
    VALUES
    ($1, $2, $3)
    RETURNING *
    `,
    [reviewId, image, isPreview],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const createReviewItem = async (client, reviewId, price, itemName) => {
  const { rows } = await client.query(
    `
    INSERT INTO review_item
    (review_id, price, item_name)
    VALUES
    ($1, $2, $3)
    RETURNING *
    `,
    [reviewId, price, itemName],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const createTag = async (client, tagName) => {
  const { rows } = await client.query(
    `
    INSERT INTO tag
    (name)
    VALUES
    ($1)
    RETURNING *
    `,
    [tagName],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const createReviewTag = async (client, reviewId, tagId) => {
  const { rows } = await client.query(
    `
    INSERT INTO review_tag
    (review_id, tag_id)
    VALUES
    ($1, $2)
    RETURNING *
    `,
    [reviewId, tagId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getTagByName = async (client, tagName) => {
  const { rows } = await client.query(
    `
    SELECT *
    FROM tag
    WHERE name = $1
    `,
    [tagName],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getReviewByUserId = async (client, userId) => {
  const { rows } = await client.query(
    `
        SELECT r.id AS review_id, r.shop_id, r.like_count, r.scrap_count, r.content, r.created_at AS date
        FROM review r
        WHERE r.user_id = $1
        AND is_deleted = FALSE
        ORDER BY r.created_at DESC
        `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getAllReview = async (client, sort, offset, limit) => {
  // TODO 추후 신고기능 생기면 신고순도
  let sortQuery;

  switch (sort) {
    case 'popular':
      sortQuery = `ORDER BY r.created_at DESC`;
      break;
    default:
      sortQuery = `ORDER BY r.created_at DESC`;
  }

  const { rows } = await client.query(
    `
    SELECT r.id AS review_id, r.shop_id, s.shop_name, u.image AS writer_thumbnail, u.nickname AS writer_name, r.like_count, r.scrap_count, r.content
    FROM review r
    INNER JOIN shop s
    on s.id = r.shop_id
    INNER JOIN "user" u
    ON u.id = r.user_id
    WHERE r.is_deleted = false
    ${sortQuery}
    
    OFFSET $1 LIMIT $2
    `,
    [offset, limit],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getReviewCounts = async (client) => {
  const { rows } = await client.query(
    `
      SELECT COUNT(*) FROM review;
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const deleteReviewByReviewId = async (client, reviewId) => {
  const { rows } = await client.query(
    `
      UPDATE review
      SET is_deleted = true
      WHERE review.id = $1
      RETURNING is_deleted
      `,
    [reviewId],
  );
  console.log(rows);
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = {
  getReviewByReviewId,
  getLikeCountByReviewId,
  getCurrentLikeStatusByReviewIdAndUserId,
  postReviewLikeByReviewId,
  updateReviewLikeCount,
  getReviewScrapByUserId,
  getReviewLikeByUserId,
  getReviewWriterByUserId,
  getReviewImagesByReviewId,
  getReviewItemByReviewId,
  getReviewTagByReviewId,
  getReviewByShopIdOrderBySort,
  getScrapCountByReviewId,
  getCurrentScrapStatusByReviewIdAndUserId,
  postReviewScrapByReviewId,
  updateReviewScrapCount,
  getScrapedReviewByUserId,
  getPreviewImageByReviewId,
  getReviewOrderByRecent,
  createReview,
  createReviewImage,
  createReviewItem,
  createTag,
  createReviewTag,
  getTagByName,
  getReviewByUserId,
  getAllReview,
  getReviewCounts,
  deleteReviewByReviewId,
};
