const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const dotenv = require('dotenv');
dotenv.config();

const url = 'http://localhost:8080';

describe('[GET] user/info', () => {
  it('[GET] 유저 조회 - 성공', (done) => {
    chai
      .request(url)
      .get('/user/info')
      .set('accesstoken', process.env.TEST_TOKEN)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('유저 조회 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('object');
        expect(res.body.data.name).be.a('string');
        expect(res.body.data.nickname).be.a('string');
        expect(res.body.data.email).be.a('string');
        done();
      });
  });

  it('[GET] 유저 조회 - 실패 (토큰 없음)', (done) => {
    chai
      .request(url)
      .get('/user/info')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body.status).to.deep.equal(401);
        expect(res.body.message).to.deep.equal('로그인이 필요한 서비스 입니다.');
        done();
      });
  });
});

describe('[GET] user/image', () => {
  it('[GET] 유저 프로필사진 가져오기 - 성공', (done) => {
    chai
      .request(url)
      .get('/user/image')
      .set('accesstoken', process.env.TEST_TOKEN)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('유저 조회 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('object');
        expect(res.body.data.image).be.a('string');
        done();
      });
  });

  it('[GET] 유저 프로필사진 가져오기 - 실패 (토큰 없음)', (done) => {
    chai
      .request(url)
      .get('/user/image')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body.status).to.deep.equal(401);
        expect(res.body.message).to.deep.equal('로그인이 필요한 서비스 입니다.');
        done();
      });
  });
});

describe('[GET] user/theme', () => {
  it('[GET] 유저 선호 소품 테마 가져오기 - 성공', (done) => {
    chai
      .request(url)
      .get('/user/theme')
      .set('accesstoken', process.env.TEST_TOKEN)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('유저 조회 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        done();
      });
  });

  it('[GET] 유저 선호 소품 테마 가져오기 - 실패 (토큰 없음)', (done) => {
    chai
      .request(url)
      .get('/user/theme')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body.status).to.deep.equal(401);
        expect(res.body.message).to.deep.equal('로그인이 필요한 서비스 입니다.');
        done();
      });
  });
});
