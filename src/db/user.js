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

const postUserBySignup = async (client, email, name, nickname, password, themePreference) => {
  const { rows } = await client.query(
    `
      INSERT INTO "user"
      (name, email, nickname, password, preference_theme)
      VALUES
      ($1, $2, $3, $4, $5)
      RETURNING name, email, password
          `,
    [name, email, nickname, password, themePreference],
  );
  console.log(rows);
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

module.exports = {
  getUserByEmail,
  postUserBySignup,
  checkDuplicatedEmailByEmail,
  getUserById,
  getThemeById,
};
