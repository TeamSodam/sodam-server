const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { reviewDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');

module.exports = async (req, res) => {
    let client;

    try {
        client = await db.connect(req);

        result = await reviewDB.getReviewOrderByRecent(client);

        console.log(result);
        if (result.length === 0) {
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_RECENT_REVIEW_SUCCESS, result));
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_RECENT_REVIEW_SUCCESS, result));
    } catch (error) {
        console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } finally {
        client.release();
    }
};
