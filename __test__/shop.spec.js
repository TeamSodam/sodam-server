// 테스트 코드 작성 폴더 구조
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const dotenv = require('dotenv');
dotenv.config();

const url = 'http://localhost:8080';

describe('[GET] /shop/recommend?type={}',()=>{
    it('[GET] 소품샵 추천 : 랜덤순 추천 - type = random',(done)=>{
        chai
            .request(url)
            .get('/shop/recommend')
            .query({type:'random'})
            .end((err,res)=>{
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body.status).to.deep.equal(200);
                expect(res.body.message).to.deep.equal('소품샵 추천 성공');
                expect(res.body).be.a('object');
                expect(res.body.data[0].shopId).be.a('number');
                expect(res.body.data[0].shopName).be.a('string');
                expect(res.body.data[0].category).be.a('array');
                expect(res.body.data[0].image).be.a('array')
                expect(res.body.data[0]).to.have.all.keys('shopId','shopName','category','image');
                done();
            });  
    })

    it('[GET] 소품샵 추천 : 인기순 추천 - type = popular', (done) => {
        chai
            .request(url)
            .get('/shop/recommend')
            .query({type: 'popular'})
            .end((err,res)=>{
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body.status).to.deep.equal(200);
                expect(res.body.message).to.deep.equal('소품샵 추천 성공');
                expect(res.body).be.a('object');
                expect(res.body.data[0].shopId).be.a('number');
                expect(res.body.data[0].shopName).be.a('string');
                expect(res.body.data[0].category).be.a('array');
                expect(res.body.data[0].image).be.a('array')
                expect(res.body.data[0]).to.have.all.keys('shopId','shopName','category','image');
                done();
            });  
    });
})