// 테스트 코드 작성 폴더 구조
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

const url = 'http://localhost:8080';

describe('[GET] /shop/:shopId/review/:reviewId', () => {
  it('accesstoken 있을 때', (done) => {
    chai
      .request(url)
      .get('/shop/4/review/4')
      .set(
        'accesstoken',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imdrc2RrZHVzQGdtYWlsLmNvbSIsIm5hbWUiOiLtlZzslYTsl7AiLCJwYXNzd29yZCI6ImRrZHVzMTMiLCJpYXQiOjE2NDI1NTI0NTEsImV4cCI6MTY0NTE0NDQ1MSwiaXNzIjoic29kYW0ifQ.CoFy_hWBksu54L1d_M4sSRWQS93MrUBVkAHLEKOO4_I',
      )
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('리뷰 상세 정보 조회 성공');
        expect(res.body).be.a('object');
        expect(res.body.data.shopId).be.a('number');
        expect(res.body.data.shopName).be.a('string');
        expect(res.body.data.category).be.a('array');
        expect(res.body.data.reviewId).be.a('number');
        expect(res.body.data.date).be.a('string');
        expect(res.body.data.likeCount).be.a('number');
        expect(res.body.data.scrapCount).be.a('number');
        expect(res.body.data.content).be.a('string');
        expect(res.body.data.isLiked).be.a('boolean');
        expect(res.body.data.isScraped).be.a('boolean');
        expect(res.body.data.writerName).be.a('string');
        expect(res.body.data.writerThumbnail).be.a('string');
        expect(res.body.data.image).be.a('array');
        expect(res.body.data.item).be.a('array');
        expect(res.body.data.tag).be.a('array');
        expect(res.body.data).to.have.all.keys(
          'shopId',
          'shopName',
          'category',
          'reviewId',
          'date',
          'likeCount',
          'scrapCount',
          'content',
          'isLiked',
          'isScraped',
          'writerName',
          'writerThumbnail',
          'image',
          'item',
          'tag',
        );
        done();
      });
  });

  it('accesstoken 없을 때', (done) => {
    chai
      .request(url)
      .get('/shop/4/review/4')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('리뷰 상세 정보 조회 성공');
        expect(res.body).be.a('object');
        expect(res.body.data.shopId).be.a('number');
        expect(res.body.data.shopName).be.a('string');
        expect(res.body.data.category).be.a('array');
        expect(res.body.data.reviewId).be.a('number');
        expect(res.body.data.date).be.a('string');
        expect(res.body.data.likeCount).be.a('number');
        expect(res.body.data.scrapCount).be.a('number');
        expect(res.body.data.content).be.a('string');
        expect(res.body.data.isLiked).be.a('boolean');
        expect(res.body.data.isScraped).be.a('boolean');
        expect(res.body.data.writerName).be.a('string');
        expect(res.body.data.writerThumbnail).be.a('string');
        expect(res.body.data.image).be.a('array');
        expect(res.body.data.item).be.a('array');
        expect(res.body.data.tag).be.a('array');
        expect(res.body.data).to.have.all.keys(
          'shopId',
          'shopName',
          'category',
          'reviewId',
          'date',
          'likeCount',
          'scrapCount',
          'content',
          'isLiked',
          'isScraped',
          'writerName',
          'writerThumbnail',
          'image',
          'item',
          'tag',
        );
        expect(res.body.data.isLiked).to.deep.equal(false);
        expect(res.body.data.isScraped).to.deep.equal(false);
        done();
      });
  });

  it('파라미터 값이 유효하지 않을 때', (done) => {
    chai
      .request(url)
      .get('/shop/0/review/4')
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

  it('소품샵 아이디와 리뷰 아이디가 일치하지 않을 때', (done) => {
    chai
      .request(url)
      .get('/shop/4/review/3')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          status: 400,
          success: false,
          message: '소품샵 아이디와 리뷰 아이디가 일치하지 않습니다',
        });
        done();
      });
  });
});
