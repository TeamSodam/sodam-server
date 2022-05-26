const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { userDB, themeDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const slackAPI = require('../../middlewares/slackAPI');

module.exports = async (req, res) => {
  // 로그인 안 했으면 fail
  if (!req.user) {
    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NEED_LOGIN));
  }
  const userId = req.user[0].id;

  // body 확인
  let { theme } = req.body;
  if (!theme) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);
    const user = await userDB.getUserById(client, userId);

    // 없는 유저
    if (!user) {
      return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER));
    }

    // 테마 가져오기
    let allTheme = await themeDB.getAllTheme(client);

    // 테마를 테마번호로 바꿔주기
    const newTheme = [];
    allTheme.forEach((element) => {
      if (theme.includes(element.name)) {
        newTheme.push(element.id);
      }
    });

    // 기존 테마 가져오기
    let originalTheme = await userDB.getThemeIdByUserId(client, userId);

    // 배열로 펼쳐주기
    originalTheme = originalTheme.map((item) => item.themeId);

    const toDelete = originalTheme.filter((x) => !newTheme.includes(x));
    const toAdd = newTheme.filter((x) => !originalTheme.includes(x));

    toDelete.forEach((item) => {
      userDB.deleteThemeByUserIdAndThemeId(client, userId, Number(item));
    });

    toAdd.forEach((item) => {
      userDB.postThemeByUserIdAndThemeId(client, userId, Number(item));
    });

    const responseData = { theme };
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ONE_USER_SUCCESS, responseData));
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
