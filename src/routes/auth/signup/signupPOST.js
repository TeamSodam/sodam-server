const responseMessage = require('../../../constants/responseMessage');
const statusCode = require('../../../constants/statusCode');
const { userDB, themeDB } = require('../../../db');
const db = require('../../../db/db');
const util = require('../../../lib/util');
const jwtHandlers = require('../../../lib/jwtHandlers');
const slackAPI = require('../../../middlewares/slackAPI');
const redisClient = require('../../../lib/redis');
const { createHashedPassword } = require('../../../lib/encryptHandler');

module.exports = async (req, res) => {
  const { email, name, nickname, password, passwordConfirm, themePreference } = req.body;

  if (!email || !name || !nickname || !password || !passwordConfirm || !themePreference) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  if (password !== passwordConfirm) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.DIFFRERENT_PASSWORD));
  }

  let client;

  try {
    client = await db.connect(req);
    // 중복 이메일 처리
    const duplicatedEmail = await userDB.checkDuplicatedEmailByEmail(client, email);
    if (duplicatedEmail.length !== 0) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_EMAIL));
    }

    // 전체 테마 목록 가져오기
    let allTheme = await themeDB.getAllTheme(client);

    // 선호테마를 테마번호로 바꿔주기
    const themePreferenceNumber = [];
    await allTheme.forEach((element) => {
      if (themePreference.includes(element.name)) {
        themePreferenceNumber.push(element.id);
      }
    });

    // 선호테마 테마 목록 잘못 보냄
    if (themePreferenceNumber.length !== themePreference.length) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.WRONG_THEME));
    }

    const { password: encryptedPassword, salt } = await createHashedPassword(password);
    console.log('encryptedPassword', encryptedPassword);
    console.log('salt', salt);
    // 새로운 user 생성
    const user = await userDB.postUserBySignup(client, email, name, nickname, encryptedPassword, salt);

    // 테마 저장
    await themePreferenceNumber.forEach((item) => {
      userDB.postThemeByUserIdAndThemeId(client, user[0].id, Number(item));
    });

    // 토큰 생성
    const { accesstoken } = jwtHandlers.sign(user[0]);
    const refreshtoken = jwtHandlers.refresh();
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    redisClient.set(String(user[0].id), String(refreshtoken));
    return res.status(statusCode.OK).cookie('userId', user[0].id).cookie('refreshToken', refreshtoken).send(util.success(statusCode.OK, responseMessage.CREATED_USER, { accesstoken }));
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
