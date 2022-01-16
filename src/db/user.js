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
  // console.log(rows);
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getUserById };
