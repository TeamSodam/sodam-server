const { sign, verify, refreshVerify } = require('../../lib/jwtHandlers');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  try{
      if(req.headers.accesstoken && req.cookies.refreshToken && req.cookies.userId){
        const authToken = await req.headers.accesstoken;
        const refreshToken = req.cookies.refreshToken;
        const userId = req.cookies.userId;
        const authResult = verify(authToken);
        const decoded = jwt.decode(authToken);
        if(decoded === null){
          res.status(401).send({
            ok:false,
            message:'No authorized!',
          })
        }
        const refreshResult = refreshVerify(refreshToken, userId);
        if(authResult === -3){
          if(refreshResult === false){
            res.status(401).send({
              ok: false,
              message: 'No authorized!',
            })
          } else{
            const newAccessToken = sign(decoded).accesstoken;

            res.status(200).send({
              ok: true,
              data: {
                accessToken: newAccessToken,
              },
            });
          }
        } else {
          res.status(400).send({
            ok: false,
            message: 'Access token is not expired!',
          });
        }

      } else{
          res.status(400).send({
            ok: false,
            message: 'Access token and refresh token are need for refresh!',
          })
      }
  } catch(error){
    onsole.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    // 슬랙으로 보낼 메시지
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uid:${req.user[0].id}` : `req.user 없음`} \n[CONTENT] ${error} \n${JSON.stringify(error)} `;

    // 슬랙 Webhook을 사용해, 에러가 발생했을 때 슬랙으로 해당 에러 내용을 담은 메시지를 보내는 코드
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
  