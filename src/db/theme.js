const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getAllTheme = async (client) => {
  const { rows } = await client.query(
    `
    SELECT *
    FROM theme u
    ORDER BY id
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = {
  getAllTheme,
};
