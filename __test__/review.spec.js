// 테스트 코드 작성 폴더 구조
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const dotenv = require('dotenv');
dotenv.config();

const url = 'http://localhost:8080';

describe('[GET] /my/review/write', () => {
it('[GET] 내가 작성한 리뷰', (done) => {
    chai
    .request(url)
    .get('/my/review/write')
    .set('accesstoken', process.env.TEST_TOKEN)
    .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('내가 작성한 리뷰 가져오기 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        expect(res.body.data[0].reviewId).be.a('number');
        expect(res.body.data[0].shopId).be.a('number');
        expect(res.body.data[0].likeCount).be.a('number');
        expect(res.body.data[0].scrapCount).be.a('number');
        expect(res.body.data[0].shopName).be.a('string');
        expect(res.body.data[0].content).be.a('string');
        expect(res.body.data[0].date).be.a('string');
        expect(res.body.data[0].category).be.a('array');
        expect(res.body.data[0].image).be.a('array');
        expect(res.body.data[0].image).to.have.lengthOf(1);
        expect(res.body.data[0]).to.have.all.keys('reviewId', 'shopId', 'likeCount', 'scrapCount', 'shopName', 'content', 'date', 'category', 'image');
        done();
    });
});

it('[GET] 내가 작성한 리뷰 - 리뷰 데이터 없을 때', (done) => {
    chai
    .request(url)
    .get('/my/review/write')
    .set('accesstoken', process.env.TEST_TOKEN2)
    .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('리뷰가 존재하지 않습니다');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        done();
    });
});

it('[GET] 내가 작성한 리뷰 - 로그인 안 되어 있을 때', (done) => {
    chai
    .request(url)
    .get('/my/review/write')
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

});
