const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { userDB, shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const slackAPI = require('../../middlewares/slackAPI');

module.exports = async (req, res) => {
  // 로그인이 구현되어 있는 경우
  const { shopId, isBookmarked } = req.body;

  // ~~~ req.body 체크
  // !isBookmarked로 하면 false인 경우에서 fail response가 됨
  if (!shopId || isBookmarked === undefined) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  // ~~~ 로그인 여부 확인
  if (!req.user) {
    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NEED_LOGIN));
  }

  // 로그인이 구현되어 있는 경우
  const userId = req.user[0].id;

  let client;

  try {
    client = await db.connect(req);

    // shopId가 제대로 들어왔나 확인
    const shop = await shopDB.getShopByShopId(client, shopId);
    if (shop.length === 0) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
    }

    // userId가 제대로 들어왔나 확인
    const user = await userDB.getUserById(client, userId);
    if (user.length === 0) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
    }

    // 북마크 정보 가져오기
    let bookmarkState = await shopDB.getBookmarkByShopIdAndUserId(client, shopId, userId);

    // 기존 북마크 개수
    let bookmarkCount = Number(shop[0].bookmarkCount);

    // ~~~ 북마크 없으면 새로운 북마크 만들고 response 보내기
    if (bookmarkState.length === 0) {
      // 북마크 정보 만들기
      bookmarkState = await shopDB.createBookmarkByShopIdAndUserId(client, shopId, userId, !isBookmarked);
      const toSum = isBookmarked ? 1 : 0;
      // 북마크 개수 업데이트
      bookmarkCount = await shopDB.updateBookmarkCountByShopId(client, shop[0].bookmarkCount + toSum, shopId);
      bookmarkCount = Number(bookmarkCount[0].bookmarkCount);
      // 성공 response 보내기
      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SHOP_SAVE_SUCCESS, { bookmarkCount }));
    }

    // ~~~ 기존 북마크가 있는 경우

    // toSum 변수: 북마크 수 몇을 더해야 하는지 계산하기 (+1 또는 -1)
    // toSum이 0인 경우: 바꿔야 하는 북마크 여부와 현재 북마크 여부가 같은 경우
    let toSum = 0;

    if (isBookmarked == true && bookmarkState[0].isDeleted === true) {
      toSum = 1;
    } else if (isBookmarked == false && bookmarkState[0].isDeleted === false) {
      toSum = -1;
    }

    // 북마크 정보를 업데이트 해야한다면
    if (toSum !== 0) {
      // 북마크 수가 얼마가 되어야 하는지 계산
      updatedBookmarkCount = bookmarkCount + toSum;
      if (updatedBookmarkCount < 0) updatedBookmarkCount = 0;

      // 북마크 정보 isBookmarked의 반대대로 업데이트하기
      await shopDB.updateBookmarkByShopIdAndUserId(client, !isBookmarked, shopId, userId);
      // 리뷰 테이블 북마크 수 업데이트하기
      bookmarkCount = await shopDB.updateBookmarkCountByShopId(client, updatedBookmarkCount, shopId);
      bookmarkCount = Number(bookmarkCount[0].bookmarkCount);
    }

    // 성공 response 보내기
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SHOP_SAVE_SUCCESS, { bookmarkCount }));
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
