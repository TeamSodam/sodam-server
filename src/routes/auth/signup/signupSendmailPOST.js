const responseMessage = require('../../../constants/responseMessage');
const statusCode = require('../../../constants/statusCode');
const { userDB } = require('../../../db');
const db = require('../../../db/db');
const util = require('../../../lib/util');
const jwtHandlers = require('../../../lib/jwtHandlers');
const slackAPI = require('../../../middlewares/slackAPI');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

const { randomInt } = require('crypto');

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REDIRECT_URI = process.env.GMAIL_REDIRECT_URI;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

// 구글 oauth2
const oAuth2Client = new google.auth.OAuth2(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });

async function sendMail(to, verificationCode) {
  try {
    const accesstoken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'sodamteam2@gmail.com',
        clientId: GMAIL_CLIENT_ID,
        clientSecret: GMAIL_CLIENT_SECRET,
        refreshToken: GMAIL_REFRESH_TOKEN,
        accessToken: accesstoken,
      },
    });

    const mailOptions = {
      from: '소담<sodamteam2@gmail.com>',
      to,
      subject: `[소담] 인증번호 ${verificationCode}를 입력해 주세요.`,
      text: `안녕하세요,
      소품샵 여정의 이야기를 담다 '소담'입니다.
      하단의 인증번호를 입력해 주세요 :)
      ${verificationCode}`,
      html: `<center>
        <p>
          안녕하세요,<br/>
          소품샵 여정의 이야기를 담다 '소담'입니다.<br/>
          하단의 인증번호를 입력해 주세요 :)<br/>
        </p>
        <h2>
          ${verificationCode}
        </h2>
      </center>`,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
}

module.exports = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  // 이메일 형식 체크
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.INVALID_EMAIL));
  }

  let client;

  try {
    client = await db.connect(req);
    // 중복 이메일 체크
    const duplicatedEmail = await userDB.checkDuplicatedEmailByEmail(client, email);

    let result = {
      uniqueEmail: false,
      verificationCode: '',
    };

    if (duplicatedEmail.length !== 0) {
      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.ALREADY_EMAIL, result));
    }

    // 랜덤 숫자
    const n = randomInt(100, 9990);
    let verificationCode = String(n);
    if (verificationCode.length === 3) {
      verificationCode = '0' + verificationCode;
    }

    // 메일 전송
    sendMail(email, verificationCode).catch((error) => console.log(error.message));

    result.uniqueEmail = true;
    result.verificationCode = String(verificationCode);

    // 가입 가능
    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SIGNUP_OK, result));
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
