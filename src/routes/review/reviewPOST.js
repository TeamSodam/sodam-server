const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { reviewDB, userDB, shopDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const JSON = require('JSON');
const slackAPI = require('../../middlewares/slackAPI');

module.exports = async (req, res) => {
  const { shopId, shopName, item, content, tag } = req.body;

  // 로그인 안 했으면 fail
  if (!req.user) {
    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NEED_LOGIN));
  }

  const userId = req.user[0].id;

  // 업로드된 이미지의 url이 들어있음
  const imageUrls = req.imageUrls;

  // 이미지 없으면 fail
  if (imageUrls.length === 0) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_IMAGE));
  }

  // 내용 없음
  if (!content) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CONTENT));
  }

  // req.body 중 빠진 값 확인
  if (!shopId || !shopName) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  // string을 JSON 배열로 파싱
  let parsedItem = [];
  if (item) parsedItem = JSON.parse(item);
  let parsedTag = [];
  if (tag) parsedTag = JSON.parse(tag);

  let client;

  try {
    client = await db.connect(req);

    // userId가 적절한지 확인, 아니면 fail
    // 동시에 writer 정보도 가져오기 (nickname, 썸네일)
    const writer = await reviewDB.getReviewWriterByUserId(client, userId);
    if (writer.length === 0) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER));
    }

    // shopId가 적절한지 확인, 아니면 fail
    const shop = await shopDB.getShopByShopId(client, shopId);
    if (shop.length === 0) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_SHOP));
    }

    // shopName이 적절한지 확인, 아니면 fail
    if (shopName !== shop[0].shopName) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_MATCH_SHOPNAME_SHOPID));
    }

    // DB에 리뷰 저장하고 리뷰 id를 포함한 모든 데이터 얻기
    const review = await reviewDB.createReview(client, shopId, userId, content);
    const reviewId = review[0].id;

    // DB에 이미지 경로 저장
    await reviewDB.createReviewImage(client, reviewId, imageUrls[0], true);
    imageUrls.slice(1).map(async (url) => {
      const createdReviewImage = await reviewDB.createReviewImage(client, reviewId, url);
    });

    // DB에 구매한 아이템 저장
    if (parsedItem.length > 0) {
      // 구매한 아이템이 있다면
      parsedItem.map(async (item) => {
        const createdItem = await reviewDB.createReviewItem(client, reviewId, item.price, item.itemName);
      });
    }

    // DB에 태그 저장
    if (parsedTag.length > 0) {
      // 태그가 있다면
      parsedTag.map(async (tagName) => {
        // 이미 있는 태그인지 검사
        let targetTag = await reviewDB.getTagByName(client, tagName);

        // DB에 태그가 없다면
        if (targetTag.length === 0) {
          // 태그 저장하고 태그 id 얻기
          targetTag = await reviewDB.createTag(client, tagName);
        }
        // 리뷰 id와 태그 id 연결
        const createdReviewTag = await reviewDB.createReviewTag(client, reviewId, targetTag[0].id);
      });
    }

    // review count 업데이트
    const updatedReviewCount = await shopDB.updateReviewCount(client, shopId, shop[0].reviewCount + 1);

    // 소품샵 id에 따라 소품샵 카테고리 가져오기
    let category = await shopDB.getCategoryByShopId(client, shopId);
    // 소품샵 카테고리 객체를 배열로 펼쳐주기
    category = category.map((item) => item.name);

    // response body 보낼 수 있게 데이터 가공
    result = {
      shopId: Number(shopId),
      shopName,
      category,
      reviewId,
      date: review[0].createdAt,
      isLiked: false, // 방금 만든 리뷰니까 false
      isScraped: false, // 방금 만든 리뷰니까 false
      likeCount: review[0].likeCount,
      scrapCount: review[0].scrapCount,
      image: imageUrls,
      item: parsedItem,
      content,
      tag: parsedTag,
      writerThumbnail: writer[0].writerThumbnail,
      writerName: writer[0].writerName,
    };

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CREATE_REVIEW_SUCCESS, result));
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
