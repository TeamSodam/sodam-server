const responseMessage = require('../../constants/responseMessage');
const statusCode = require('../../constants/statusCode');
const { reviewDB } = require('../../db');
const db = require('../../db/db');
const util = require('../../lib/util');
const { duplicatedDataClean } = require('../../lib/convertRawDataToProccessedData');

module.exports = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  let client;
  //getReviewImagesByReviewId
  try {
    client = await db.connect(req);
    if (userId) {
      const myReviewArr = await reviewDB.getReviewByReviewId(client, userId);
      const imagePromise = myReviewArr.map((item) => {
        const reviewId = item.id;
        return reviewDB.getReviewImagesByReviewId(client, reviewId);
      });

      Promise.allSettled(imagePromise).then((image) => {
        image.forEach((result) => {
          if (result.status === 'fulfilled') {
            console.log('성공함');
          } else if (result.status === 'rejected') {
            // console.log('[IMAGE PROMISE REJECTED]');
          }
        });
      });

      myReviewArr.map((item) => {
        if (!item.image) {
          item.image = null;
        }
      });

      if (myReviewArr.length !== 0) res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_REVIEW_OF_MINE, myReviewArr));
      else {
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.NO_REVIEW, myReviewArr));
      }
    }
  } catch (error) {
    console.log(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
