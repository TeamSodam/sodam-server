const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getUserByEmail = async (client, email) => {
  const { rows } = await client.query(
    `
            SELECT *
            FROM admin_user au
            WHERE au.email = $1
                AND au.is_deleted = FALSE
            `,
    [email],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getUserByEmail };
