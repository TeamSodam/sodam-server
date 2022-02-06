// 테스트 코드 작성 폴더 구조
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const dotenv = require('dotenv');
dotenv.config();

const url = 'http://localhost:8080';

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
