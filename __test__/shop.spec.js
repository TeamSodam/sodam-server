// 테스트 코드 작성 폴더 구조
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const dotenv = require('dotenv');
dotenv.config();

const url = 'http://localhost:8080';

//TODO: page,offset 관련해서는 관련 view 나오고 작성하기

describe('[GET] /review/recent',()=>{
    it('[GET] 최근 리뷰 제공',(done)=>{
        chai
            .request(url)
            .get('/review/recent')
            .end((err,res)=>{
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body.status).to.deep.equal(200);
                expect(res.body.message).to.deep.equal('최근 리뷰 가져오기 성공');
                expect(res.body).be.a('object');
                expect(res.body.data).to.have.lengthOf(15);
                expect(res.body.data[0].reviewId).be.a('number');
                expect(res.body.data[0].shopId).be.a('number');
                expect(res.body.data[0].shopName).be.a('string');
                expect(res.body.data[0].category).be.a('array');
                expect(res.body.data[0].writerThumbnail).be.a('string');
                expect(res.body.data[0].writerName).be.a('string');
                expect(res.body.data[0].likeCount).be.a('number');
                expect(res.body.data[0].scrapCount).be.a('number');
                expect(res.body.data[0].image).be.a('array');
                expect(res.body.data[0].image).to.have.lengthOf(1);
                expect(res.body.data[0]).to.have.all.keys(
                    'reviewId',
                    'shopId',
                    'shopName',
                    'category',
                    'writerThumbnail',
                    'writerName',
                    'likeCount',
                    'scrapCount',
                    'content',
                    'image');
                done();
            });  
    })




}) 