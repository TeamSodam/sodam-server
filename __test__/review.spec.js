const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const dotenv = require('dotenv');
dotenv.config();

const url = 'http://localhost:8080';

describe('[GET] admin/shop/all?sort={}&page={}&limit={}', () => {
  it('[GET] 전체 리뷰 : sort 없음 - page= 1 , limit = 30', (done) => {
    chai
      .request(url)
      .get('/admin/review/all')
      .query({ page: 1, limit: 10 })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('전체 리뷰 목록 가져오기 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        expect(res.body.data).to.have.lengthOf(10);
        expect(res.body.data[0].shopId).be.a('number');
        expect(res.body.data[0].shopName).be.a('string');
        expect(res.body.data[0].writerName).be.a('string');
        expect(res.body.data[0].writerThumbnail).be.a('string');
        expect(res.body.data[0].likeCount).be.a('number');
        expect(res.body.data[0].scrapCount).be.a('number');
        expect(res.body.data[0].content).be.a('string');
        expect(res.body.data[0].category).be.a('array');
        expect(res.body.data[0].image).be.a('array');
        expect(res.body.data[0]).to.have.all.keys('reviewId', 'shopId', 'shopName', 'writerThumbnail', 'writerName', 'likeCount', 'scrapCount', 'content', 'category', 'image');
        done();
      });
  });
});
