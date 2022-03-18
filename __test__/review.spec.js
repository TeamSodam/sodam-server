const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const dotenv = require('dotenv');
dotenv.config();

const url = 'http://localhost:8080';

describe('[GET] admin/shop/all?sort={}&page={}&limit={}', () => {
  it('[GET] 전체 리뷰 : sort 없음 - page= 1 , limit = 10', (done) => {
    chai
      .request(url)
      .get('/admin/review/all')
      .query({ page: 1, limit: 10 })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('전체 리뷰 목록 가져오기 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        expect(res.body.data).to.have.lengthOf(10);
        expect(res.body.data[0].shopId).be.a('number');
        expect(res.body.data[0].shopName).be.a('string');
        expect(res.body.data[0].writerName).be.a('string');
        expect(res.body.data[0].likeCount).be.a('number');
        expect(res.body.data[0].scrapCount).be.a('number');
        expect(res.body.data[0].content).be.a('string');
        expect(res.body.data[0].category).be.a('array');
        expect(res.body.data[0].image).be.a('array');
        expect(res.body.data[0]).to.have.all.keys('reviewId', 'shopId', 'shopName', 'writerThumbnail', 'writerName', 'likeCount', 'scrapCount', 'content', 'category', 'image');
        done();
      });
  });
});

describe('[POST] /review/:reviewId/like', () => {
  it('[POST] 리뷰 좋아요', (done) => {
    chai
      .request(url)
      .post('/review/1/like')
      .set('accesstoken', process.env.TEST_TOKEN)
      .send({ isLiked: true })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('리뷰 좋아요 성공');
        expect(res.body.data).be.a('object');
        expect(res.body.data.isLiked).be.a('boolean');
        expect(res.body.data.likeCount).be.a('number');
        expect(res.body.data).to.have.all.keys('isLiked', 'likeCount');
        expect(res.body.data.isLiked).to.deep.equal(true);
        done();
      });
  });

  it('[POST] 리뷰 좋아요 취소', (done) => {
    chai
      .request(url)
      .post('/review/1/like')
      .set('accesstoken', process.env.TEST_TOKEN)
      .send({ isLiked: false })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('리뷰 좋아요 성공');
        expect(res.body.data).be.a('object');
        expect(res.body.data.isLiked).be.a('boolean');
        expect(res.body.data.likeCount).be.a('number');
        expect(res.body.data).to.have.all.keys('isLiked', 'likeCount');
        expect(res.body.data.isLiked).to.deep.equal(false);
        done();
      });
  });

  it('[POST] 리뷰 좋아요 - 로그인 되어있지 않을 때', (done) => {
    chai
      .request(url)
      .post('/review/1/like')
      .send({ isLiked: false })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body).to.deep.equal({
          status: 401,
          success: false,
          message: '로그인이 필요한 서비스 입니다.',
        });
        done();
      });
  });

  it('[POST] 리뷰 좋아요 - body에 이상한 값이 들어있을 때', (done) => {
    chai
      .request(url)
      .post('/review/1/like')
      .set('accesstoken', process.env.TEST_TOKEN)
      .send({ isLiked: '문자열' })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          status: 400,
          success: false,
          message: '파라미터 값이 잘못되었습니다',
        });
        done();
      });
  });

  it('[POST] 리뷰 좋아요 - reviewId에 이상한 값이 들어갔을 때', (done) => {
    chai
      .request(url)
      .post('/review/blabla/like')
      .set('accesstoken', process.env.TEST_TOKEN)
      .send({ isLiked: true })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          status: 400,
          success: false,
          message: '파라미터 값이 잘못되었습니다',
        });
        done();
      });
  });

  it('[POST] 리뷰 좋아요 - 필요한 값이 없을 때', (done) => {
    chai
      .request(url)
      .post('/review/1/like')
      .send({})
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          status: 400,
          success: false,
          message: '필요한 값이 없습니다',
        });
        done();
      });
  });
});

describe('[POST] /review/:reviewId/scrap', () => {
  it('[POST] 리뷰 스크랩', (done) => {
    chai
      .request(url)
      .post('/review/1/scrap')
      .set('accesstoken', process.env.TEST_TOKEN)
      .send({ isScraped: true })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('리뷰 스크랩 성공');
        expect(res.body.data).be.a('object');
        expect(res.body.data.isScraped).be.a('boolean');
        expect(res.body.data.scrapCount).be.a('number');
        expect(res.body.data).to.have.all.keys('isScraped', 'scrapCount');
        expect(res.body.data.isScraped).to.deep.equal(true);
        done();
      });
  });

  it('[POST] 리뷰 스크랩 취소', (done) => {
    chai
      .request(url)
      .post('/review/1/scrap')
      .set('accesstoken', process.env.TEST_TOKEN)
      .send({ isScraped: false })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('리뷰 스크랩 성공');
        expect(res.body.data).be.a('object');
        expect(res.body.data.isScraped).be.a('boolean');
        expect(res.body.data.scrapCount).be.a('number');
        expect(res.body.data).to.have.all.keys('isScraped', 'scrapCount');
        expect(res.body.data.isScraped).to.deep.equal(false);
        done();
      });
  });

  it('[POST] 리뷰 스크랩 - 로그인 되어있지 않을 때', (done) => {
    chai
      .request(url)
      .post('/review/1/scrap')
      .send({ isScraped: false })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body).to.deep.equal({
          status: 401,
          success: false,
          message: '로그인이 필요한 서비스 입니다.',
        });
        done();
      });
  });

  it('[POST] 리뷰 스크랩 - body에 이상한 값이 들어있을 때', (done) => {
    chai
      .request(url)
      .post('/review/1/scrap')
      .set('accesstoken', process.env.TEST_TOKEN)
      .send({ isScraped: '문자열' })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          status: 400,
          success: false,
          message: '파라미터 값이 잘못되었습니다',
        });
        done();
      });
  });

  it('[POST] 리뷰 스크랩 - reviewId에 이상한 값이 들어갔을 때', (done) => {
    chai
      .request(url)
      .post('/review/blabla/scrap')
      .set('accesstoken', process.env.TEST_TOKEN)
      .send({ isScraped: true })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          status: 400,
          success: false,
          message: '파라미터 값이 잘못되었습니다',
        });
        done();
      });
  });

  it('[POST] 리뷰 스크랩 - 필요한 값이 없을 때', (done) => {
    chai
      .request(url)
      .post('/review/1/scrap')
      .send({})
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          status: 400,
          success: false,
          message: '필요한 값이 없습니다',
        });
        done();
      });
  });
});

describe('[GET] /my/review/write', () => {
it('[GET] 내가 작성한 리뷰', (done) => {
    chai
    .request(url)
    .get('/my/review/write')
    .set('accesstoken', process.env.TEST_TOKEN)
    .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('내가 작성한 리뷰 가져오기 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        expect(res.body.data[0].reviewId).be.a('number');
        expect(res.body.data[0].shopId).be.a('number');
        expect(res.body.data[0].likeCount).be.a('number');
        expect(res.body.data[0].scrapCount).be.a('number');
        expect(res.body.data[0].shopName).be.a('string');
        expect(res.body.data[0].content).be.a('string');
        expect(res.body.data[0].date).be.a('string');
        expect(res.body.data[0].category).be.a('array');
        expect(res.body.data[0].image).be.a('array');
        expect(res.body.data[0].image).to.have.lengthOf(1);
        expect(res.body.data[0]).to.have.all.keys('reviewId', 'shopId', 'likeCount', 'scrapCount', 'shopName', 'content', 'date', 'category', 'image');
        done();
    });
});

it('[GET] 내가 작성한 리뷰 - 리뷰 데이터 없을 때', (done) => {
    chai
    .request(url)
    .get('/my/review/write')
    .set('accesstoken', process.env.TEST_TOKEN2)
    .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('리뷰가 존재하지 않습니다');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        done();
    });
});

it('[GET] 내가 작성한 리뷰 - 로그인 안 되어 있을 때', (done) => {
    chai
    .request(url)
    .get('/my/review/write')
    .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body).to.deep.equal({
        status: 401,
        success: false,
        message: '로그인이 필요한 서비스 입니다.',
        });
        done();
    });
});

});
