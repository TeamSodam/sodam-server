// 테스트 코드 작성 폴더 구조
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const dotenv = require('dotenv');
dotenv.config();

const url = 'http://localhost:8080';

describe('[GET] /shop/:shopId/location', () => {
  it('[GET] 소품샵 근처 지하철역 기반 소품샵 추천 - 추천할 소품샵이 있는 경우', (done) => {
    chai
      .request(url)
      .get('/shop/15/location')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('소품샵 근처 지하철역 기반 소품샵 추천 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('object');
        expect(res.body.data.subway).be.a('string');
        expect(res.body.data.shopList).be.a('array');
        expect(res.body.data.shopList[0].shopId).be.a('number');
        expect(res.body.data.shopList[0].shopName).be.a('string');
        expect(res.body.data.shopList[0].category).be.a('array');
        expect(res.body.data.shopList[0].image).be.a('array');
        expect(res.body.data.shopList[0]).to.have.all.keys('shopId', 'shopName', 'category', 'image');
        done();
      });
  });

  it('[GET] 소품샵 근처 지하철역 기반 소품샵 추천 - 추천할 소품샵이 없는 경우', (done) => {
    chai
      .request(url)
      .get('/shop/255/location')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('소품샵 근처 지하철역 기반 소품샵 추천 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('object');
        expect(res.body.data.subway).be.a('string');
        expect(res.body.data.shopList).be.a('array');
        expect(res.body.data.shopList.length).to.deep.equal(0);
        done();
      });
  });

  it('[GET] 소품샵 근처 지하철역 기반 소품샵 추천 - shopId로 검색되는 소품샵이 없는 경우', (done) => {
    chai
      .request(url)
      .get('/shop/-1/location')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        expect(res.body.message).to.deep.equal('존재하지 않는 소품샵입니다.');
        done();
      });
  });

  it('[GET] 소품샵 근처 지하철역 기반 소품샵 추천 - shopId가 잘못된 경우', (done) => {
    chai
      .request(url)
      .get('/shop/dfsfsd/location')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        expect(res.body.message).to.deep.equal('파라미터 값이 잘못되었습니다');
        done();
      });
  });
});
