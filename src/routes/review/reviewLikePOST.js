const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { reviewDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');

module.exports = async (req, res) => {
  const { reviewId } = req.params;
  const { isLiked } = req.body;

  if (!reviewId || isLiked === undefined) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);
    const likeCount = await reviewDB.getLikeCountByReviewId(client, reviewId);
    const responseData = {};
    console.log('likeCount', likeCount);
    if (req.user) {
      const userId = req.user.id;
      const isDeletedBefore = await reviewDB.getCurrentLikeStatusByReviewIdAndUserId(client, reviewId, userId); //true -> 좋아요 안돼있음, false-> 좋아요 눌려있음
      // 지금 받은 isLiked상태가 기존과 같은 경우
      if (isLiked === !isDeletedBefore[0].isDeleted) {
        responseData['isLiked'] = isLiked;
        responseData['likeCount'] = likeCount[0].likeCount;
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.REVIEW_LIKE_POST_SUCCESS, responseData));
      } else {
        const isDeleted = await reviewDB.postReviewLikeByReviewId(client, userId, reviewId, isLiked);
        // 좋아요가 true인 경우
        if (!isDeleted) {
          const updateLikeCount = await reviewDB.updateReviewLikeCount(client, reviewId, likeCount[0].likeCount + 1);
          responseData['isLiked'] = !isDeleted;
          responseData['likeCount'] = updateLikeCount[0].likeCount;
        }
        // 좋아요가 false인 경우
        else {
          const updateLikeCount = await reviewDB.updateReviewLikeCount(client, reviewId, likeCount[0].likeCount - 1);
          responseData['isLiked'] = !isDeleted;
          responseData['likeCount'] = updateLikeCount[0].likeCount;
        }
      }

      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.REVIEW_LIKE_POST_SUCCESS, responseData));
    } else {
      return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NEED_LOGIN));
    }
  } catch (error) {
    console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
