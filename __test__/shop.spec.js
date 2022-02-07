// 테스트 코드 작성 폴더 구조
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const dotenv = require('dotenv');
dotenv.config();

const url = 'http://localhost:8080';

describe('[GET] /shop/:shopId', () => {
  it('[GET] /shop/:shopId 정상동작', (done) => {
    chai
      .request(url)
      .get('/shop/1')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('소품샵 상세 정보 조회 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('object');
        expect(res.body.data.shopId).be.a('number');
        expect(res.body.data.shopName).be.a('string');
        expect(res.body.data.subway).be.a('string');
        expect(res.body.data.roadAddress).be.a('string');
        expect(res.body.data.landAddress).be.a('string');
        expect(res.body.data.time).be.a('string');
        expect(res.body.data.close).be.a('string');
        expect(res.body.data.phone).be.a('string');
        expect(res.body.data.homepage).be.a('string');
        expect(res.body.data.instagram).be.a('string');
        expect(res.body.data.blog).be.a('string');
        expect(res.body.data.store).be.a('string');
        expect(res.body.data.area).be.a('string');
        expect(res.body.data.bookmarkCount).be.a('number');
        expect(res.body.data.reviewCount).be.a('number');
        expect(res.body.data.createdAt).be.a('string');
        expect(res.body.data.updatedAt).be.a('string');
        expect(res.body.data.isBookmarked).be.a('boolean');
        expect(res.body.data.category).be.a('array');
        expect(res.body.data.theme).be.a('array');
        expect(res.body.data.image).be.a('array');
        expect(res.body.data.shopName).be.a('string');

        expect(res.body.data).to.have.all.keys(
          'shopId',
          'shopName',
          'subway',
          'roadAddress',
          'landAddress',
          'time',
          'close',
          'phone',
          'homepage',
          'instagram',
          'blog',
          'store',
          'area',
          'bookmarkCount',
          'reviewCount',
          'createdAt',
          'updatedAt',
          'isBookmarked',
          'category',
          'theme',
          'image',
        );
        done();
      });
  });

  it('[GET] /shop/:shopId - shopId가 오지 않음', (done) => {
    chai
      .request(url)
      .get('/shop')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        expect(res.body.message).to.deep.equal('필요한 값이 없습니다');
        expect(res.body).be.a('object');
        done();
      });
  });

  it('[GET] /shop/:shopId -  shopId가 잘못된 경우', (done) => {
    chai
      .request(url)
      .get('/shop/-1')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        expect(res.body.message).to.deep.equal('존재하지 않는 소품샵입니다.');
        expect(res.body).be.a('object');
        done();
      });
  });
});
