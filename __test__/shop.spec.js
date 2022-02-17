// 테스트 코드 작성 폴더 구조
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const dotenv = require('dotenv');
dotenv.config();

const url = 'http://localhost:8080';

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
    const limit = 4;
    chai
      .request(url)
      .get('/review/15')
      .query({ offset: 1, limit: limit })
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
        expect(res.body.data.data).to.have.length(limit);
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
