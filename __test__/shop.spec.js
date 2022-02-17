// 테스트 코드 작성 폴더 구조
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const dotenv = require('dotenv');
dotenv.config();

const url = 'http://localhost:8080';
const imageUrl = 'C:/Project/sodam/sodam-server/__test__/codingImage_back.png';
const wrongFileUrl = 'C:/Project/sodam/sodam-server/__test__/text.txt';

describe('[POST] /review', () => {
  it('[POST] 리뷰 작성 - 성공', (done) => {
    chai
      .request(url)
      .post('/review')
      .set('accesstoken', process.env.TEST_TOKEN)
      .set('content-type', 'application/x-www-form-urlencoded')
      .field({
        shopId: 5,
        shopName: '마요',
        content: '댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 ',
      })
      .attach('image', imageUrl)

      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.deep.equal('리뷰 작성 성공');
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
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

  it('[POST] 리뷰 작성 - 실패: shopId가 정수가 아님', (done) => {
    chai
      .request(url)
      .post('/review')
      .set('accesstoken', process.env.TEST_TOKEN)
      .set('content-type', 'application/x-www-form-urlencoded')
      .field({
        shopId: '-1.4sfdf',
        shopName: '마요',
        content: '댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 ',
      })
      .attach('image', imageUrl)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.deep.equal('파라미터 값이 잘못되었습니다');
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        done();
      });
  });

  it('shopId와 shopName이 매칭되지 않음', (done) => {
    chai
      .request(url)
      .post('/review')
      .set('accesstoken', process.env.TEST_TOKEN)
      .set('content-type', 'application/x-www-form-urlencoded')
      .field({
        shopId: '5',
        shopName: '마요네즈',
        content: '댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 ',
      })
      .attach('image', imageUrl)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.deep.equal('소품샵 이름과 아이디가 일치하지 않습니다');
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        done();
      });
  });

  it('[POST] 리뷰 작성 - 실패: 이미지가 아닌 파일 업로드', (done) => {
    chai
      .request(url)
      .post('/review')
      .set('accesstoken', process.env.TEST_TOKEN)
      .set('content-type', 'application/x-www-form-urlencoded')
      .field({
        shopId: 5,
        shopName: '마요',
        content: '댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 ',
      })
      .attach('image', wrongFileUrl)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.deep.equal('이미지만 업로드 가능합니다');
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        done();
      });
  });

  it('[POST] 리뷰 작성 - 실패: req에 shopId 없음', (done) => {
    chai
      .request(url)
      .post('/review')
      .set('accesstoken', process.env.TEST_TOKEN)
      .set('content-type', 'application/x-www-form-urlencoded')
      .field({
        shopName: '마요',
        content: '댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 ',
      })
      .attach('image', imageUrl)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.deep.equal('파라미터 값이 잘못되었습니다');
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        done();
      });
  });

  it('[POST] 리뷰 작성 - 실패: req에 shopName 없음', (done) => {
    chai
      .request(url)
      .post('/review')
      .set('accesstoken', process.env.TEST_TOKEN)
      .set('content-type', 'application/x-www-form-urlencoded')
      .field({
        shopId: 5,
        content: '댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 ',
      })
      .attach('image', imageUrl)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.deep.equal('필요한 값이 없습니다');
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        done();
      });
  });

  it('[POST] 리뷰 작성 - 실패: req에 content 없음', (done) => {
    chai
      .request(url)
      .post('/review')
      .set('accesstoken', process.env.TEST_TOKEN)
      .set('content-type', 'application/x-www-form-urlencoded')
      .field({
        shopId: 5,
        shopName: '마요',
      })
      .attach('image', imageUrl)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.deep.equal('리뷰 내용이 없습니다');
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        done();
      });
  });

  it('[POST] 리뷰 작성 - shopId가 잘못됐을 때', (done) => {
    chai
      .request(url)
      .post('/review')
      .set('accesstoken', process.env.TEST_TOKEN)
      .set('content-type', 'application/x-www-form-urlencoded')
      .field({
        shopId: -5,
        shopName: '마요',
        content: '댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 ',
      })
      .attach('image', imageUrl)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.deep.equal('존재하지 않는 소품샵입니다.');
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        done();
      });
  });

  it('[POST] 리뷰 작성 - 실패: 로그인 필요', (done) => {
    chai
      .request(url)
      .post('/review')
      .set('content-type', 'application/x-www-form-urlencoded')
      .field({
        shopId: 5,
        shopName: '마요',
        content: '댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 댓글내용테스트 ',
      })
      .attach('image', imageUrl)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body.message).to.deep.equal('로그인이 필요한 서비스 입니다.');
        expect(res).to.have.status(401);
        expect(res.body.status).to.deep.equal(401);
        done();
      });
  });
});
