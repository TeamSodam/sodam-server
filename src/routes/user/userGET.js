const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { userDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const slackAPI = require('../../middlewares/slackAPI');

module.exports = async (req, res) => {
  const { id: userId } = req.params;

  if (!userId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);
    const user = await userDB.getUserById(client, userId);
    const test = {
      test: 'pm2 restart',
      user: user,
    };

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.RENT_HISTORY_SUCCESS, test));
  } catch (error) {
    console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    // 슬랙으로 보낼 메시지
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user[0].id}` : `req.user 없음`} \n[CONTENT] ${error} \n${JSON.stringify(error)} `;

    // 슬랙 Webhook을 사용해, 에러가 발생했을 때 슬랙으로 해당 에러 내용을 담은 메시지를 보내는 코드
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
