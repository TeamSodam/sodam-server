const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { shopDB, reviewDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');

module.exports = async (req, res) => {
  const { shopId, reviewId } = req.params;

  if (!shopId || !reviewId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    // 소품샵 기본정보
    const shop = await shopDB.getShopByShopId(client, shopId);
    if (shop.length === 0) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_SHOP));
    }
    const { shopId: id, shopName } = shop[0];

    // 카테고리 정보
    let category = await shopDB.getCategoryByShopId(client, shopId);
    category = category.map((item) => item.name);

    // 리뷰 정보
    let review = await reviewDB.getReviewByReviewId(client, reviewId);
    if (review.length === 0) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_REVIEW));
    }
    const { userId, createdAt, likeCount, scrapCount, content } = review[0];

    // liked여부, scrap여부
    let isLiked = false;
    let isScraped = false;

    // 로그인 했으면 db에서 데이터 가져오기
    if (req.user) {
      const like = await reviewDB.getReviewLikeByUserId(client, userId, reviewId);
      const scrap = await reviewDB.getReviewScrapByUserId(client, userId, reviewId);
      if (like?.length !== 0) isLiked = true;
      if (scrap?.length !== 0) isScraped = true;
    }

    // writer 정보
    const writer = await reviewDB.getReviewWriterByUserId(client, userId);

    // 리뷰 이미지
    let image = [];
    const reviewImages = await reviewDB.getReviewImagesByReviewId(client, reviewId);
    if (reviewImages?.length !== 0) {
      image = reviewImages.map((item) => item.image);
    }

    // item 정보, 테그 정보
    const item = await reviewDB.getReviewItemByReviewId(client, userId);
    let tag = await reviewDB.getReviewTagByReviewId(client, reviewId);
    tag = tag.map((item) => item.name);

    // 데이터 합치기
    const result = {
      shopId,
      shopName,
      category,
      reviewId: Number(reviewId),
      date: createdAt,
      likeCount,
      scrapCount,
      content,
      isLiked,
      isScraped,
      ...writer[0],
      image,
      item,
      tag,
    };

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_ONE_REVIEW_GET_SUCCESS, result));
  } catch (error) {
    console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
