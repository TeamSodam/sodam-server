const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const postShopSheet = async (client, shopId, shopName, subway, roadAddress, landAddress, time, closeDay, phone, homepage, instagram, blog, store, area, note) => {
    const { rows } = await client.query(
        `
            INSERT INTO shop 
            (id, shop_name, subway, road_address, land_address, time, close, phone, homepage, instagram, blog, store, area, note)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
            `,
        [shopId, shopName, subway, roadAddress, landAddress, time, closeDay, phone, homepage, instagram, blog, store, area, note],
    );
    console.log(rows);
    return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { postShopSheet };