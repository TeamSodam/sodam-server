const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getReviewByReviewId = async (client, reviewId) => {
  const { rows } = await client.query(
    `
        SELECT *
        FROM review r
        WHERE r.id = $1
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
};
