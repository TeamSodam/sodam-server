const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getAllCategory = async (client) => {
  const { rows } = await client.query(
    `
    SELECT *
    FROM category u
    ORDER BY id
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = {
  getAllCategory,
};
