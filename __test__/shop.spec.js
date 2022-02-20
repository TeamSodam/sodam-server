// 테스트 코드 작성 폴더 구조
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const dotenv = require('dotenv');
dotenv.config();

const url = 'http://localhost:8080';

describe('[GET] admin/shop/all?sort={}&page={}&limit={}', () => {
  it('[GET] 전체 소품샵 : ㄱ,ㄴ,ㄷ순 정렬 - page= 1 , limit = 30', (done) => {
    chai
      .request(url)
      .get('/admin/shop/all')
      .query({ sort: 'alphabet', page: 1, limit: 30 })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('전체 소품샵 조회 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        expect(res.body.data).to.have.lengthOf(30);
        expect(res.body.data[0].shopId).be.a('number');
        expect(res.body.data[0].shopName).be.a('string');
        expect(res.body.data[0].category).be.a('array');
        expect(res.body.data[0].image).be.a('array');
        expect(res.body.data[0]).to.have.all.keys('shopId', 'shopName', 'category', 'image');
        done();
      });
  });
});
