const responseMessage = require('../../../constants/responseMessage');
const statusCode = require('../../../constants/statusCode');
const { userDB } = require('../../../db');
const db = require('../../../db/db');
const util = require('../../../lib/util');
const jwtHandlers = require('../../../lib/jwtHandlers');
const slackAPI = require('../../../middlewares/slackAPI');

module.exports = async (req, res) => {
  const { email, verificationNumber } = req.body;

  if (!email || !verificationNumber) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  // 이메일 형식 체크
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.INVALID_EMAIL));
  }

  // verificationNumber이 문자열이어야 함 (0으로 시작하는 숫자)
  let number = String(verificationNumber);
  if (number.length === 3) {
    number = '0' + number;
  }

  if (number.length !== 4) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
  }

  // 임시
  let savedNumber = '1111';

  let client;

  try {
    client = await db.connect(req);

    let result = {
      verified: false,
    };

    if (savedNumber === number) {
      result.verified = true;
      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.VERIFY_SUCCESS, result));
    }

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.VERIFY_FAIL, result));
  } catch (error) {
    console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    // 슬랙으로 보낼 메시지
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user[0].id}` : `req.user 없음`} \n[CONTENT] ${error} \n${JSON.stringify(error)} `;

    // 슬랙 Webhook을 사용해, 에러가 발생했을 때 슬랙으로 해당 에러 내용을 담은 메시지를 보내는 코드
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
