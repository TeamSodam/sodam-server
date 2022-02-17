// 테스트 코드 작성 폴더 구조
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const dotenv = require('dotenv');
dotenv.config();

const url = 'http://localhost:8080';

describe('[POST] /shop/bookmark', () => {
  it('[POST] 소품샵 북마크 - 성공', (done) => {
    chai
      .request(url)
      .post('/shop/bookmark')
      .set('accesstoken', process.env.TEST_TOKEN)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        shopId: 1,
        isBookmarked: false,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('소품샵 저장 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('object');
        expect(res.body.data.bookmarkCount).be.a('number');
        done();
      });
  });

  it('[POST] 소품샵 북마크 - 실패: 로그인 안 함', (done) => {
    chai
      .request(url)
      .post('/shop/bookmark')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        shopId: 1,
        isBookmarked: false,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body.status).to.deep.equal(401);
        expect(res.body.message).to.deep.equal('로그인이 필요한 서비스 입니다.');
        done();
      });
  });

  it('[POST] 소품샵 북마크 - shopId없음', (done) => {
    chai
      .request(url)
      .post('/shop/bookmark')
      .set('accesstoken', process.env.TEST_TOKEN)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        shopId: 1,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        expect(res.body.message).to.deep.equal('필요한 값이 없습니다');
        done();
      });
  });

  it('[POST] 소품샵 북마크 - isBookmarked 없음', (done) => {
    chai
      .request(url)
      .post('/shop/bookmark')
      .set('accesstoken', process.env.TEST_TOKEN)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        isBookmarked: false,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        expect(res.body.message).to.deep.equal('필요한 값이 없습니다');
        done();
      });
  });

  it('[POST] 소품샵 북마크 - shopId 잘못됨', (done) => {
    chai
      .request(url)
      .post('/shop/bookmark')
      .set('accesstoken', process.env.TEST_TOKEN)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        shopId: 'dfd',
        isBookmarked: false,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        expect(res.body.message).to.deep.equal('파라미터 값이 잘못되었습니다');
        done();
      });
  });

  it('[POST] 소품샵 북마크 - isBookmarked 잘못됨', (done) => {
    chai
      .request(url)
      .post('/shop/bookmark')
      .set('accesstoken', process.env.TEST_TOKEN)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        shopId: 1,
        isBookmarked: 'dfdfd',
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        expect(res.body.message).to.deep.equal('파라미터 값이 잘못되었습니다');
        done();
      });
  });
});
