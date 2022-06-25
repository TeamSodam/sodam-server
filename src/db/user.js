const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getUserById = async (client, userId) => {
  const { rows } = await client.query(
    `
        SELECT *
        FROM "user" u
        WHERE u.id = $1
            AND u.is_deleted = FALSE
        `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};
// console.log(rows);
const getUserByEmail = async (client, email) => {
  const { rows } = await client.query(
    `
          SELECT *
          FROM "user" u
          WHERE u.email = $1
              AND u.is_deleted = FALSE
          `,
    [email],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const postUserBySignup = async (client, email, name, nickname, password) => {
  const { rows } = await client.query(
    `
      INSERT INTO "user"
      (name, email, nickname, password)
      VALUES
      ($1, $2, $3, $4)
      RETURNING id, name, email, password, nickname
          `,
    [name, email, nickname, password],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const checkDuplicatedEmailByEmail = async (client, email) => {
  const { rows } = await client.query(
    `
          SELECT u.email
          FROM "user" u
          WHERE u.email = $1
              AND u.is_deleted = FALSE
          `,
    [email],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getUserByNickname = async (client, nickname) => {
  const { rows } = await client.query(
    `
        SELECT *
        FROM "user" u
        WHERE u.nickname = $1
            AND u.is_deleted = FALSE
        `,
    [nickname],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getThemeById = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT name
    FROM (
      SELECT theme_id
      FROM preference_theme pt
      WHERE pt.user_id = $1
        AND is_deleted = false
      ) pt
    INNER JOIN theme t
    ON pt.theme_id = t.id
    ORDER BY id
        `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const deleteImageById = async (client, userId) => {
  const { rows } = await client.query(
    `
    UPDATE "user"
    SET image = ''
    WHERE id = $1
        `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getThemeIdByUserId = async (client, userId) => {
  const { rows } = await client.query(
    `
      SELECT theme_id
      FROM preference_theme pt
      WHERE pt.user_id = $1
        AND is_deleted = false
        `,
    [userId],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const deleteThemeByUserIdAndThemeId = async (client, userId, themeId) => {
  const { rows } = await client.query(
    `
    UPDATE preference_theme
    SET is_deleted = true
    WHERE user_id = $1
      AND theme_id = $2
    `,
    [userId, themeId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const postThemeByUserIdAndThemeId = async (client, userId, themeId) => {
  const existTheme = await client.query(
    `
    SELECT *
    FROM preference_theme pt
    WHERE pt.user_id = $1
      AND pt.theme_id = $2
    `,
    [userId, themeId],
  );

  // 컬럼이 없으면 새로 만들어줌
  if (existTheme.rows.length === 0) {
    const { rows } = await client.query(
      `
      INSERT INTO preference_theme
      (user_id, theme_id)
      VALUES
      ($1, $2)
      `,
      [userId, themeId],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  }

  // 컬럼이 있으면 업데이트
  const { rows } = await client.query(
    `
    UPDATE preference_theme
    SET is_deleted = false
    WHERE user_id = $1
      AND theme_id = $2
    `,
    [userId, themeId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const postUserImageByUserId = async (client, userId, image) => {
  const { rows } = await client.query(
    `
    UPDATE "user"
    SET image = $1
    WHERE id = $2
    `,
    [image, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const postUserNicknameByUserId = async (client, userId, nickname) => {
  const { rows } = await client.query(
    `
    UPDATE "user"
    SET nickname = $1
    WHERE id = $2
    `,
    [nickname, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = {
  getUserByEmail,
  postUserBySignup,
  checkDuplicatedEmailByEmail,
  getUserById,
  getUserByNickname,
  getThemeById,
  deleteImageById,
  getThemeIdByUserId,
  deleteThemeByUserIdAndThemeId,
  postThemeByUserIdAndThemeId,
  postUserImageByUserId,
  postUserNicknameByUserId,
};
