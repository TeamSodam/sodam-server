const { sign, verify, refreshVerify } = require('../../lib/jwtHandlers');
const jwt = require('jsonwebtoken');
const statusCode = require('../../constants/statusCode');
const responseMessage = require('../../constants/responseMessage');
const util = require('../../lib/util');

module.exports = async (req, res) => {
  try{
      if(req.headers.accesstoken && req.cookies.refreshToken && req.cookies.userId){
        const authToken = await req.headers.accesstoken;
        const refreshToken = await req.cookies.refreshToken;
        const userId = await req.cookies.userId;
        const authResult = verify(authToken);
        const decoded = jwt.decode(authToken);
        if(decoded === null){
          return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_AUTH));
        }
        const refreshResult = await refreshVerify(refreshToken, userId);
        if(authResult === -3){
          if(refreshResult === false){
            return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_AUTH));
          } else{
            const newAccessToken = sign(decoded).accesstoken;
            return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.ACCESS_TOKEN_SUCCESS,{ accesstoken: newAccessToken,}));
          }
        } else {
          return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NOT_TOKEN_EXPIRED));
        }
      } else{
          return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST,responseMessage.NULL_VALUE));
      }
  } catch(error){
    console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    // 슬랙으로 보낼 메시지
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user[0].id}` : `req.user 없음`} \n[CONTENT] ${error} \n${JSON.stringify(error)} `;

    // 슬랙 Webhook을 사용해, 에러가 발생했을 때 슬랙으로 해당 에러 내용을 담은 메시지를 보내는 코드
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } 
};
  