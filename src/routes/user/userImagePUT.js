const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { userDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const slackAPI = require('../../middlewares/slackAPI');

module.exports = async (req, res) => {
  // 로그인 안 했으면 fail
  if (!req.user) {
    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NEED_LOGIN));
  }

  const userId = req.user[0].id;

  // 업로드된 이미지의 url이 들어있음
  const imageUrls = req.imageUrls;
  console.log(imageUrls);

  // 이미지 없으면 fail
  if (imageUrls.length === 0) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_IMAGE));
  }

  let client;

  try {
    client = await db.connect(req);
    const user = await userDB.getUserById(client, userId);

    if (!user) {
      return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER));
    }

    await userDB.postUserImageByUserId(client, userId, imageUrls[0]);

    const result = {
      image: imageUrls[0],
    };

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_ONE_USER_SUCCESS, result));
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
