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

describe('[GET] admin/shop/data', () => {
  it('[GET] 전체 소품샵 관련 데이터들 불러오기', (done) => {
    chai
      .request(url)
      .get('/admin/shop/data')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('소품샵 데이터 조회 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('object');
        expect(res.body.data.allShopCount).to.have.lengthOf(1);
        expect(res.body.data.allShopCount[0]).to.have.all.keys('name', 'count');
        expect(res.body.data.allShopCount[0].name).be.a('string');
        expect(res.body.data.allShopCount[0].count).be.a('number');
        expect(res.body.data.allReviewCount).to.have.lengthOf(1);
        expect(res.body.data.allReviewCount[0]).to.have.all.keys('name', 'count');
        expect(res.body.data.allReviewCount[0].name).be.a('string');
        expect(res.body.data.allReviewCount[0].count).be.a('number');
        expect(res.body.data.shopCategoryCount).to.have.lengthOf(6);
        expect(res.body.data.shopCategoryCount[0]).to.have.all.keys('name', 'count');
        expect(res.body.data.shopCategoryCount[0].name).be.a('string');
        expect(res.body.data.shopCategoryCount[0].count).be.a('number');
        expect(res.body.data.shopThemeCount).to.have.lengthOf(4);
        expect(res.body.data.shopThemeCount[0]).to.have.all.keys('name', 'count');
        expect(res.body.data.shopThemeCount[0].name).be.a('string');
        expect(res.body.data.shopThemeCount[0].count).be.a('number');
        expect(res.body.data.shopAreaCount[0]).to.have.all.keys('name', 'count');
        expect(res.body.data.shopAreaCount[0].name).be.a('string');
        expect(res.body.data.shopAreaCount[0].count).be.a('number');
        expect(res.body.data).to.have.all.keys('allShopCount', 'allReviewCount', 'shopCategoryCount', 'shopThemeCount', 'shopAreaCount');
        done();
      });
  });
});
