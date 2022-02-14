// 테스트 코드 작성 폴더 구조
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const dotenv = require('dotenv');
dotenv.config();

const url = 'http://localhost:8080';

//TODO: page,offset 관련해서는 관련 view 나오고 작성하기

describe('[GET] /shop/search',()=>{
    it('[GET] 검색 결과 소품샵 제공 - keyword = 리',(done)=>{
        chai
            .request(url)
            .get('/shop/search')
            .query({keyword:'리'})
            .end((err,res)=>{
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body.status).to.deep.equal(200);
                expect(res.body.message).to.deep.equal('소품샵 이름으로 검색 성공');
                expect(res.body).be.a('object');
                expect(res.body.data[0].shopId).be.a('number');
                expect(res.body.data[0].shopName).be.a('string');
                expect(res.body.data[0].category).be.a('array');
                expect(res.body.data[0].image).be.a('array');
                expect(res.body.data[0].image).to.have.lengthOf(1);
                expect(res.body.data[0]).to.have.all.keys('shopId','shopName','category','image');
                done();
            });  
    })

    it('[GET] 검색 결과 소품샵 제공 - keyword = X',(done)=>{
        chai
            .request(url)
            .get('/shop/category')
            .end((err,res)=>{
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({
                    status: 400,
                    success: false,
                    message: '필요한 값이 없습니다',
                });
                done();
            });  
    })

    
}) 