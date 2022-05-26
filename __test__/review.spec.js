const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const dotenv = require('dotenv');
dotenv.config();

const url = 'http://localhost:8080';
const limitNumber = 4;

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

  describe('[GET] /review/:shopId?sort={}&offset={}&limit={}', () => {
    it('[GET] 소품샵별 리뷰 sort=like', (done) => {
      chai
        .request(url)
        .get('/review/15')
        .query({ sort: 'like', offset: 1, limit: 9 })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body.status).to.deep.equal(200);
          expect(res.body.message).to.deep.equal('소품샵 리뷰 목록 가져오기 성공');
          expect(res.body).be.a('object');
          expect(res.body.data).be.a('object');
          expect(res.body.data.reviewCount).be.a('number');
          expect(res.body.data.data).be.a('array');
          expect(res.body.data.data[0].reviewId).be.a('number');
          expect(res.body.data.data[0].shopId).be.a('number');
          expect(res.body.data.data[0].image).be.a('array');
          expect(res.body.data.data[0].writerThumbnail).be.a('string');
          expect(res.body.data.data[0].writerName).be.a('string');
          expect(res.body.data.data[0].likeCount).be.a('number');
          expect(res.body.data.data[0].scrapCount).be.a('number');
          expect(res.body.data.data[0].content).be.a('string');
          expect(res.body.data.data[0]).to.have.all.keys('reviewId', 'shopId', 'image', 'writerThumbnail', 'writerName', 'likeCount', 'scrapCount', 'content');
          // like순 정렬 확인
          for (let i = 0; i < res.body.data.data.length - 1; i++) {
            expect(res.body.data.data[i].likeCount).to.least(res.body.data.data[i + 1].likeCount);
          }
          done();
        });
    });

    it('[GET] 소품샵별 리뷰 sort=save', (done) => {
      chai
        .request(url)
        .get('/review/15')
        .query({ sort: 'save', offset: 1, limit: 9 })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body.status).to.deep.equal(200);
          expect(res.body.message).to.deep.equal('소품샵 리뷰 목록 가져오기 성공');
          expect(res.body).be.a('object');
          expect(res.body.data).be.a('object');
          expect(res.body.data.reviewCount).be.a('number');
          expect(res.body.data.data).be.a('array');
          expect(res.body.data.data[0].reviewId).be.a('number');
          expect(res.body.data.data[0].shopId).be.a('number');
          expect(res.body.data.data[0].image).be.a('array');
          expect(res.body.data.data[0].writerThumbnail).be.a('string');
          expect(res.body.data.data[0].writerName).be.a('string');
          expect(res.body.data.data[0].likeCount).be.a('number');
          expect(res.body.data.data[0].scrapCount).be.a('number');
          expect(res.body.data.data[0].content).be.a('string');
          expect(res.body.data.data[0]).to.have.all.keys('reviewId', 'shopId', 'image', 'writerThumbnail', 'writerName', 'likeCount', 'scrapCount', 'content');
          // scrap순 정렬 확인
          for (let i = 0; i < res.body.data.data.length - 1; i++) {
            expect(res.body.data.data[i].scrapCount).to.least(res.body.data.data[i + 1].scrapCount);
          }
          done();
        });
    });

    it('[GET] 소품샵별 리뷰 sort=recent', (done) => {
      chai
        .request(url)
        .get('/review/15')
        .query({ sort: 'recent', offset: 1, limit: 9 })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body.status).to.deep.equal(200);
          expect(res.body.message).to.deep.equal('소품샵 리뷰 목록 가져오기 성공');
          expect(res.body).be.a('object');
          expect(res.body.data).be.a('object');
          expect(res.body.data.reviewCount).be.a('number');
          expect(res.body.data.data).be.a('array');
          expect(res.body.data.data[0].reviewId).be.a('number');
          expect(res.body.data.data[0].shopId).be.a('number');
          expect(res.body.data.data[0].image).be.a('array');
          expect(res.body.data.data[0].writerThumbnail).be.a('string');
          expect(res.body.data.data[0].writerName).be.a('string');
          expect(res.body.data.data[0].likeCount).be.a('number');
          expect(res.body.data.data[0].scrapCount).be.a('number');
          expect(res.body.data.data[0].content).be.a('string');
          expect(res.body.data.data[0]).to.have.all.keys('reviewId', 'shopId', 'image', 'writerThumbnail', 'writerName', 'likeCount', 'scrapCount', 'content');
          // recent별 정렬 확인 -> 여기서는 안 됨..
          done();
        });
    });

    it('[GET] 소품샵별 리뷰 sort 없음, offset과 limit 정상', (done) => {
      chai
        .request(url)
        .get('/review/15')
        .query({ offset: 1, limit: limitNumber })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body.status).to.deep.equal(200);
          expect(res.body.message).to.deep.equal('소품샵 리뷰 목록 가져오기 성공');
          expect(res.body).be.a('object');
          expect(res.body.data).be.a('object');
          expect(res.body.data.reviewCount).be.a('number');
          expect(res.body.data.data).be.a('array');
          expect(res.body.data.data[0].reviewId).be.a('number');
          expect(res.body.data.data[0].shopId).be.a('number');
          expect(res.body.data.data[0].image).be.a('array');
          expect(res.body.data.data[0].writerThumbnail).be.a('string');
          expect(res.body.data.data[0].writerName).be.a('string');
          expect(res.body.data.data[0].likeCount).be.a('number');
          expect(res.body.data.data[0].scrapCount).be.a('number');
          expect(res.body.data.data[0].content).be.a('string');
          expect(res.body.data.data[0]).to.have.all.keys('reviewId', 'shopId', 'image', 'writerThumbnail', 'writerName', 'likeCount', 'scrapCount', 'content');
          expect(res.body.data.data).to.have.length(limitNumber);
          // like순 정렬 확인
          for (let i = 0; i < res.body.data.data.length - 1; i++) {
            expect(res.body.data.data[i].likeCount).to.least(res.body.data.data[i + 1].likeCount);
          }
          done();
        });
    });

    it('[GET] 소품샵별 리뷰 sort가 지정된 value 이외', (done) => {
      chai
        .request(url)
        .get('/review/15')
        .query({ sort: 'uafhuiahd', offset: 1, limit: 9 })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.status).to.deep.equal(400);
          expect(res.body.message).to.deep.equal('파라미터 값이 잘못되었습니다');
          done();
        });
    });

    it('[GET] 소품샵별 리뷰 - offset만 온 경우', (done) => {
      chai
        .request(url)
        .get('/review/15')
        .query({ offset: 1 })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.status).to.deep.equal(400);
          expect(res.body.message).to.deep.equal('필요한 값이 없습니다');

          done();
        });
    });

    it('[GET] 소품샵별 리뷰 - limit만 온 경우', (done) => {
      chai
        .request(url)
        .get('/review/15')
        .query({ limit: 1 })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.status).to.deep.equal(400);
          expect(res.body.message).to.deep.equal('필요한 값이 없습니다');
          done();
        });
    });

    it('[GET] 소품샵별 리뷰 sort, offset, limit 없음', (done) => {
      chai
        .request(url)
        .get('/review/15')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body.status).to.deep.equal(200);
          expect(res.body.message).to.deep.equal('소품샵 리뷰 목록 가져오기 성공');
          expect(res.body).be.a('object');
          expect(res.body.data).be.a('object');
          expect(res.body.data.reviewCount).be.a('number');
          expect(res.body.data.data).be.a('array');
          expect(res.body.data.data[0].reviewId).be.a('number');
          expect(res.body.data.data[0].shopId).be.a('number');
          expect(res.body.data.data[0].image).be.a('array');
          expect(res.body.data.data[0].writerThumbnail).be.a('string');
          expect(res.body.data.data[0].writerName).be.a('string');
          expect(res.body.data.data[0].likeCount).be.a('number');
          expect(res.body.data.data[0].scrapCount).be.a('number');
          expect(res.body.data.data[0].content).be.a('string');
          expect(res.body.data.data[0]).to.have.all.keys('reviewId', 'shopId', 'image', 'writerThumbnail', 'writerName', 'likeCount', 'scrapCount', 'content');
          expect(res.body.data.data).to.have.length(9);
          // like순 정렬 확인
          for (let i = 0; i < res.body.data.data.length - 1; i++) {
            expect(res.body.data.data[i].likeCount).to.least(res.body.data.data[i + 1].likeCount);
          }
          done();
        });
    });

    it('[GET] 소품샵별 리뷰 - limit이 0 이하인 경우', (done) => {
      chai
        .request(url)
        .get('/review/15')
        .query({ limit: 0, offset: 3 })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.status).to.deep.equal(400);
          expect(res.body.message).to.deep.equal('파라미터 값이 잘못되었습니다');
          done();
        });
    });

    it('[GET] 소품샵별 리뷰 - offset이 0 이하인 경우', (done) => {
      chai
        .request(url)
        .get('/review/15')
        .query({ limit: 1, offset: 0 })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.status).to.deep.equal(400);
          expect(res.body.message).to.deep.equal('파라미터 값이 잘못되었습니다');
          done();
        });
    });

    it('[GET] 소품샵별 리뷰 - limit이 숫자가 아닌 경우', (done) => {
      chai
        .request(url)
        .get('/review/15')
        .query({ limit: 'a', offset: 9 })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.status).to.deep.equal(400);
          expect(res.body.message).to.deep.equal('파라미터 값이 잘못되었습니다');
          done();
        });
    });

    it('[GET] 소품샵별 리뷰 - offset이 숫자가 아닌 경우', (done) => {
      chai
        .request(url)
        .get('/review/15')
        .query({ limit: 1, offset: 's' })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.status).to.deep.equal(400);
          expect(res.body.message).to.deep.equal('파라미터 값이 잘못되었습니다');

          done();
        });
    });

    it('[GET] 소품샵별 리뷰 - 탐색 성공했으나 리뷰 없음', (done) => {
      chai
        .request(url)
        .get('/review/153')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body.success).to.equal(true);
          expect(res.body.status).to.deep.equal(200);
          expect(res.body.message).to.deep.equal('소품샵 리뷰 목록 가져오기 성공');
          expect(res.body.data.data.length).to.deep.equal(0);
          done();
        });
    });

    it('[GET] 소품샵별 리뷰 - shopId가 잘못된 경우', (done) => {
      chai
        .request(url)
        .get('/review/dd')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.status).to.deep.equal(400);
          expect(res.body.message).to.deep.equal('파라미터 값이 잘못되었습니다');
          done();
        });
    });
  });

  describe('[GET] /shop/recommend?type={}', () => {
    it('[GET] 소품샵 추천 : 랜덤순 추천 - type = random', (done) => {
      chai
        .request(url)
        .get('/shop/recommend')
        .query({ type: 'random' })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body.data).to.have.lengthOf(20);
          expect(res.body.status).to.deep.equal(200);
          expect(res.body.message).to.deep.equal('소품샵 추천 성공');
          expect(res.body).be.a('object');
          expect(res.body.data[0].shopId).be.a('number');
          expect(res.body.data[0].shopName).be.a('string');
          expect(res.body.data[0].category).be.a('array');
          expect(res.body.data[0].image).be.a('array');
          expect(res.body.data[0]).to.have.all.keys('shopId', 'shopName', 'category', 'image');
          done();
        });
    });

    it('[GET] 소품샵 추천 : 인기순 추천 - type = popular', (done) => {
      chai
        .request(url)
        .get('/shop/recommend')
        .query({ type: 'popular' })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body.data).to.have.lengthOf(20);
          expect(res.body.status).to.deep.equal(200);
          expect(res.body.message).to.deep.equal('소품샵 추천 성공');
          expect(res.body).be.a('object');
          expect(res.body.data[0].shopId).be.a('number');
          expect(res.body.data[0].shopName).be.a('string');
          expect(res.body.data[0].category).be.a('array');
          expect(res.body.data[0].image).be.a('array');
          expect(res.body.data[0]).to.have.all.keys('shopId', 'shopName', 'category', 'image');
          done();
        });
    });

    it('[GET] 소품샵 추천 : 잘못된 쿼리값 들어왔을 때', (done) => {
      chai
        .request(url)
        .get('/shop/recommend')
        .query({ type: 'popularl' })
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

    it('[GET] 소품샵 추천 : 쿼리값 아무것도 없을 때', (done) => {
      chai
        .request(url)
        .get('/shop/recommend')
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

  describe('[GET] /shop/category', () => {
    it('[GET] 카테고리별 소품샵 제공 - type = 주방용품', (done) => {
      chai
        .request(url)
        .get('/shop/category')
        .query({ type: '주방용품' })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body.status).to.deep.equal(200);
          expect(res.body.message).to.deep.equal('카테고리별 소품샵 리스트 가져오기 성공');
          expect(res.body).be.a('object');
          expect(res.body.data).to.have.lengthOf(20);
          expect(res.body.data[0].shopId).be.a('number');
          expect(res.body.data[0].shopName).be.a('string');
          expect(res.body.data[0].category).be.a('array');
          expect(res.body.data[0].image).be.a('array');
          expect(res.body.data[0].image).to.have.lengthOf(1);
          expect(res.body.data[0]).to.have.all.keys('shopId', 'shopName', 'category', 'image');
          done();
        });
    });

    it('[GET] 소품샵 추천 : 잘못된 쿼리값 들어왔을 때', (done) => {
      chai
        .request(url)
        .get('/shop/category')
        .query({ type: '문궆팬씨' })
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

    it('[GET] 소품샵 추천 : 쿼리값 아무것도 없을 때', (done) => {
      chai
        .request(url)
        .get('/shop/category')
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

  //TODO: page,offset 관련해서는 관련 view 나오고 작성하기

  describe('[GET] /shop/search', () => {
    it('[GET] 검색 결과 소품샵 제공 - keyword = 리', (done) => {
      chai
        .request(url)
        .get('/shop/search')
        .query({ keyword: '리' })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body.status).to.deep.equal(200);
          expect(res.body.message).to.deep.equal('소품샵 이름으로 검색 성공');
          expect(res.body).be.a('object');
          expect(res.body.data[0].shopId).be.a('number');
          expect(res.body.data[0].shopName).be.a('string');
          expect(res.body.data[0].category).be.a('array');
          expect(res.body.data[0].image).be.a('array');
          expect(res.body.data[0].image).to.have.lengthOf(1);
          expect(res.body.data[0]).to.have.all.keys('shopId', 'shopName', 'category', 'image');
          done();
        });
    });

    it('[GET] 검색 결과 소품샵 제공 - keyword = X', (done) => {
      chai
        .request(url)
        .get('/shop/category')
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
  //TODO: page,offset 관련해서는 관련 view 나오고 작성하기

  describe('[GET] /review/recent', () => {
    it('[GET] 최근 리뷰 제공', (done) => {
      chai
        .request(url)
        .get('/review/recent')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body.status).to.deep.equal(200);
          expect(res.body.message).to.deep.equal('최근 리뷰 가져오기 성공');
          expect(res.body).be.a('object');
          expect(res.body.data).to.have.lengthOf(15);
          expect(res.body.data[0].reviewId).be.a('number');
          expect(res.body.data[0].shopId).be.a('number');
          expect(res.body.data[0].shopName).be.a('string');
          expect(res.body.data[0].category).be.a('array');
          expect(res.body.data[0].writerThumbnail).be.a('string');
          expect(res.body.data[0].writerName).be.a('string');
          expect(res.body.data[0].content).be.a('string');
          expect(res.body.data[0].likeCount).be.a('number');
          expect(res.body.data[0].scrapCount).be.a('number');
          expect(res.body.data[0].image).be.a('array');
          expect(res.body.data[0].image).to.have.lengthOf(1);
          expect(res.body.data[0]).to.have.all.keys('reviewId', 'shopId', 'shopName', 'category', 'writerThumbnail', 'writerName', 'likeCount', 'scrapCount', 'content', 'image');
          done();
        });
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

describe('[GET] /my/review/scrap', () => {
  it('[GET] 내가 스크랩한 리뷰', (done) => {
    chai
      .request(url)
      .get('/my/review/scrap')
      .set('accesstoken', process.env.TEST_TOKEN)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('내가 스크랩한 리뷰 가져오기 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        expect(res.body.data[0].reviewId).be.a('number');
        expect(res.body.data[0].shopId).be.a('number');
        expect(res.body.data[0].likeCount).be.a('number');
        expect(res.body.data[0].scrapCount).be.a('number');
        expect(res.body.data[0].shopName).be.a('string');
        expect(res.body.data[0].content).be.a('string');
        expect(res.body.data[0].category).be.a('array');
        expect(res.body.data[0].image).be.a('array');
        expect(res.body.data[0].image).to.have.lengthOf(1);
        expect(res.body.data[0].writerThumbnail).be.a('string');
        expect(res.body.data[0].writerName).be.a('string');
        expect(res.body.data[0]).to.have.all.keys('reviewId', 'shopId', 'likeCount', 'scrapCount', 'shopName', 'content', 'category', 'image', 'writerThumbnail', 'writerName');
        done();
      });
  });

  it('[GET] 내가 스크랩한 리뷰 - 리뷰 데이터 없을 때', (done) => {
    chai
      .request(url)
      .get('/my/review/scrap')
      .set('accesstoken', process.env.TEST_TOKEN2)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('리뷰가 존재하지 않습니다');
        expect(res.body.data).be.a('array');
        expect(res.body).be.a('object');
        done();
      });
  });

  it('[GET] 내가 작성한 리뷰 - 로그인 안 되어 있을 때', (done) => {
    chai
      .request(url)
      .get('/my/review/scrap')
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
